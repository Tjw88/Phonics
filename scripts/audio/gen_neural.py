#!/usr/bin/env python3
"""Generate the app's audio with neural voices (Piper) instead of espeak-ng, and audit it.

    pip install piper-tts soundfile numpy   (+ optional: faster-whisper matplotlib for the extra checks)
    npx tsx scripts/export-bank.ts && python3 scripts/audio/gen_neural.py [--sheet]

Voices (downloaded on first run into scripts/audio/voices/, not committed):
  rp    -> en_GB-cori-medium                 CC BY 4.0     (British RP, female, LibriVox reader Cori Samuel)
  north -> en_GB-northern_english_male-medium CC BY-SA 4.0  (OpenSLR 83 northern English speaker)  <- ShareAlike: check before shipping

How sounds are made
  * WORDS and PHRASES: the voice speaks a phoneme string WE supply (not its own spelling rules), so each accent teaches the
    sounds in our tables (e.g. northern "cup" = k-ʊ-p). Piper's own text->phoneme step is RP-only.
  * ISOLATED SOUNDS: a neural voice given a lone consonant produces near-silence, so each consonant is CUT from a natural
    syllable (e.g. "mʌ"), then lengthened so it is long enough to hear: noise sounds by granular resynthesis, voiced
    sounds by pitch-synchronous looping, stops kept short but with a faded release so they are audible.
  * Checks: measurements on every clip, plus (optional) a speech recogniser listening to a carrier sentence. Nothing here
    replaces a human ear; the recogniser is biased on short vowels and is only used as a rough second opinion.
"""
import functools, json, os, sys, urllib.request
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen_audio as G  # noqa: E402  (shared helpers + the per-accent IPA tables)
from piper import PiperVoice, SynthesisConfig  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "audio")
VOICE_DIR = os.path.join(HERE, "voices")
SR = 22050
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB"
ACCENT_VOICES = {
    "rp": ("en_GB-cori-medium", f"{HF}/cori/medium/en_GB-cori-medium", "Cori Samuel (LibriVox / Hi-Fi TTS), CC BY 4.0"),
    "north": ("en_GB-northern_english_male-medium", f"{HF}/northern_english_male/medium/en_GB-northern_english_male-medium",
              "Northern English male (OpenSLR 83), CC BY-SA 4.0"),
}
NORTH_MAP = {"ʌ": "ʊ", "æ": "a"}  # applied to Piper's own RP phonemisation of ordinary words (Safari words, phrases)
VOWEL_SYMS = {"æ", "a", "ɪ", "ɒ", "ɛ", "ʌ", "ʊ", "eɪ", "iː", "əʊ", "uː", "aɪ", "ɑː", "ɔː", "ɜː", "aʊ", "ɔɪ", "ɪə", "ɛə", "ɛː"}
DIPHTHONGS = {"ai", "oa", "igh", "ow", "oi", "ear", "air"}  # a glide: keep the voice's own movement, do not loop it into a steady vowel
LS_WORD, NS, NW = 1.25, 0.5, 0.6  # slower than normal speech for children; steady (low noise) delivery
CLASS = {"v": "vfric", "z": "vfric", "j": "affrv", "w": "vstop1", "y": "vstop1", "x": "seq", "qu": "seq",
         "s": "fric", "f": "fric", "h": "fric", "sh": "fric", "th": "fric", "ch": "affr", "m": "sonor", "n": "sonor", "ng": "sonor", "l": "sonor", "r": "sonor",
         "p": "vstop0", "t": "vstop0", "k": "vstop0", "b": "vstop1", "d": "vstop1", "g": "vstop1"}
TARGET_MS = {"fric": 480, "sonor": 430, "vowel": 520}
NASALS = ("m", "n", "ng")
BORROWED = {("north", "th"): "rp"}  # (accent, sound) -> accent whose voice supplies it
STOP_TAIL_MS = 70  # how much of the following vowel a stop keeps (faded), so it is audible


@functools.lru_cache(maxsize=None)
def fetch(name, base):  # cached: a freshly loaded voice repeats the same "random" output, so takes would be identical
    os.makedirs(VOICE_DIR, exist_ok=True)
    for ext in ("onnx", "onnx.json"):
        dst = os.path.join(VOICE_DIR, f"{name}.{ext}")
        if not os.path.exists(dst):
            print(f"downloading {name}.{ext} ...", flush=True)
            urllib.request.urlretrieve(f"{base}.{ext}", dst)
    return PiperVoice.load(os.path.join(VOICE_DIR, f"{name}.onnx"))


def speak_ids(voice, ids, ls=LS_WORD):
    a = voice.phoneme_ids_to_audio(ids, SynthesisConfig(length_scale=ls, noise_scale=NS, noise_w_scale=NW))
    return np.asarray(a, dtype=np.float32).reshape(-1)


def to_ids(voice, phonemes):
    missing = [p for p in phonemes if p not in voice.config.phoneme_id_map]
    if missing:
        raise ValueError(f"voice cannot say {missing}")
    return voice.phonemes_to_ids(phonemes)


def trim(a, thresh=0.02, pad_ms=12):
    peak = float(np.abs(a).max()) or 1.0
    idx = np.nonzero(np.abs(a) > thresh * peak)[0]
    if not len(idx):
        return a
    pad = int(SR * pad_ms / 1000)
    return a[max(0, idx[0] - pad): idx[-1] + pad]


def env_of(a, win_ms=10, hop_ms=5):
    w, h = int(SR * win_ms / 1000), int(SR * hop_ms / 1000)
    return np.array([float(np.sqrt(np.mean(a[i:i + w] ** 2))) for i in range(0, max(1, len(a) - w), h)]), h


def fade_out(a, ms):
    n = min(len(a), int(SR * ms / 1000))
    a = a.copy()
    if n:
        a[-n:] *= np.linspace(1, 0, n) ** 1.5
    return a


def fade_in(a, ms):
    n = min(len(a), int(SR * ms / 1000))
    a = a.copy()
    if n:
        a[:n] *= np.linspace(0, 1, n)
    return a


def normalise(a, target_rms=0.11, ceiling=0.92):
    r = float(np.sqrt(np.mean(a ** 2))) or 1.0
    g = min(target_rms / r, ceiling / (float(np.abs(a).max()) or 1.0))
    return (a * g).astype(np.float32)


def to_int16(a):
    return np.clip(a * 32767, -32768, 32767).astype(np.int16)


# ---- lengthening -----------------------------------------------------------------------------------------------
def sustain_noise(x, target_ms, seed=7):
    """Granular resynthesis for noise-like sounds (s f h): overlap-add windowed grains from random places in x."""
    rng = np.random.default_rng(seed)
    grain = min(len(x), int(SR * 0.07))
    hop = grain // 2
    target = int(SR * target_ms / 1000)
    out = np.zeros(target + grain, dtype=np.float64)
    win = np.hanning(grain)
    pos = 0
    while pos < target:
        st = int(rng.integers(0, max(1, len(x) - grain + 1)))
        out[pos:pos + grain] += x[st:st + grain] * win[: len(x[st:st + grain])]
        pos += hop
    return (out[:target] / (np.sqrt(np.mean(out[:target] ** 2)) or 1) * (np.sqrt(np.mean(x ** 2)) or 1)).astype(np.float32)


def sustain_voiced(x, target_ms, periods=4):
    """Pitch-synchronous looping for voiced sounds (m n l r and vowels): repeat FOUR pitch periods from the steadiest middle,
    cross-faded by one period, so the repetition is faster than the ear can hear as a stutter (long loops made audible seams)."""
    n = len(x)
    lo, hi = int(SR / 420), int(SR / 70)
    a, b = int(n * 0.30), int(n * 0.85)
    src = x[a:b] - x[a:b].mean()
    if len(src) < hi * 2:  # a very short cut-out: measure the pitch on all of it
        a, b = 0, n
        src = x - x.mean()
    ac = np.correlate(src, src, "full")[len(src) - 1:]
    T = lo + int(np.argmax(ac[lo:min(hi, len(ac))]))
    seg_len = min(periods * T, max(T, (b - a) - T))
    core = x[a:b] - x[a:b].mean()
    best, best_i = 1e9, 0
    for i in range(0, max(1, len(core) - seg_len - T), max(1, T // 2)):
        e1 = float(np.mean(core[i:i + seg_len] ** 2)); e2 = float(np.mean(core[i + T:i + T + seg_len] ** 2))
        if abs(e1 - e2) < best:
            best, best_i = abs(e1 - e2), i
    seg = x[a + best_i: a + best_i + seg_len + T].astype(np.float64)
    c = min(T, len(seg) // 2)
    ramp = np.linspace(0, 1, c)
    unit = seg[: seg_len + c]
    out = np.array(x[: a + best_i].astype(np.float64))
    target = int(SR * target_ms / 1000)
    guard = 0
    while len(out) < target and guard < 4000:
        guard += 1
        if len(out) >= c and len(unit) > c:
            out[-c:] = out[-c:] * (1 - ramp) + unit[:c] * ramp
            out = np.concatenate([out, unit[c:seg_len]])
        else:
            out = np.concatenate([out, unit[:max(1, seg_len)]])
    return out[:target].astype(np.float32)


# ---- isolated sounds -----------------------------------------------------------------------------------------------
def syms(s):
    """An IPA string as Piper symbols (an affricate such as tʃ is two symbols)."""
    return list(s)


def carrier(voice, c_sym, kind):
    ls = {"fric": 3.0, "sonor": 3.5, "vfric": 3.0, "affr": 2.2, "affrv": 2.2}.get(kind, 1.4)
    return trim(speak_ids(voice, to_ids(voice, [*syms(c_sym), "ˈ", "ʌ"]), ls))


def lowfreq_ratio(a, hop, win_ms=20, cut_hz=700):
    w = int(SR * win_ms / 1000)
    out = []
    for i in range(0, max(1, len(a) - w), hop):
        sp = np.abs(np.fft.rfft(a[i:i + w] * np.hanning(w))) ** 2
        f = np.fft.rfftfreq(w, 1 / SR)
        out.append(float(sp[f < cut_hz].sum() / (sp.sum() or 1)))
    return np.array(out)


def render_seq(voice, key):
    """x (/ks/) and qu (/kw/) are ONE letter group that says two sounds: join the first sound's clip to the second's, close together."""
    parts = {"x": ("k", "s"), "qu": ("k", "w")}[key]
    clips = []
    for k2 in parts:
        c2, _ = render_consonant(voice, k2, G.BASE_IPA[k2])
        clips.append(c2)
    first, second = clips
    if key == "x":
        first = first[: int(SR * 0.16)]
        second = fade_out(second[: int(SR * 0.30)], 70)
    else:
        first = first[: int(SR * 0.13)]
    xf = int(SR * 0.012)
    first = fade_out(first, 10)
    clip = np.concatenate([first[:-xf], first[-xf:] * np.linspace(1, 0, xf) + second[:xf] * np.linspace(0, 1, xf), second[xf:]])
    return normalise(clip, 0.12), {"method": f"two sounds as one letter group: /{parts[0]}/ then /{parts[1]}/, joined, {len(clip) / SR * 1000:.0f} ms"}


def render_consonant(voice, key, ipa_sym):
    kind = CLASS[key]
    if kind == "seq":
        return render_seq(voice, key)
    a = carrier(voice, ipa_sym, kind)
    env, h = env_of(a)
    peak = float(env.max()) or 1.0
    v = G.voicing((a * 32768).astype(np.int16))
    info = {"method": ""}
    if kind == "fric":
        on = next((i for i in range(len(v)) if v[i] and i < len(env) and env[i] > 0.3 * peak), len(env) // 2)
        part = a[: max(int(SR * 0.08), on * h - int(SR * 0.02))]
        clip = sustain_noise(part, TARGET_MS["fric"])
        clip = fade_out(fade_in(clip, 25), 70)
        info["method"] = f"cut {len(part) / SR * 1000:.0f} ms of hiss before the vowel, granular resynthesis to {TARGET_MS['fric']} ms"
    elif kind in ("sonor", "vfric"):
        if key in NASALS:
            lr = lowfreq_ratio(a, h)
            first = next((i for i in range(len(lr)) if lr[i] > 0.8), 0)  # nasal murmur: energy almost all below 700 Hz
            on = next((i for i in range(first + 2, len(lr)) if lr[i] < 0.6), first + 12)
        else:
            base = float(np.median(env[: max(3, int(0.05 / (h / SR)))])) or 1e-4
            on = next((i for i in range(int(0.03 / (h / SR)), len(env)) if env[i] > max(2.6 * base, 0.35 * peak)), len(env) // 2)
        part = a[: max(int(SR * 0.07), min(on * h - int(SR * 0.012), int(SR * 0.22)))]
        clip = sustain_voiced(part, TARGET_MS["sonor"])
        clip = fade_out(fade_in(clip, 30), 80)
        info["method"] = f"cut {len(part) / SR * 1000:.0f} ms before the vowel, pitch-synchronous loop to {TARGET_MS['sonor']} ms"
    elif kind == "affr":
        # /ch/ = a stop burst then hiss: keep the natural burst + frication up to the vowel and give the hiss a little more length
        on = next((i for i in range(len(v)) if v[i] and i < len(env) and env[i] > 0.3 * peak), len(env) // 2)
        part = a[: max(int(SR * 0.09), on * h - int(SR * 0.015))]
        hiss = sustain_noise(part[int(len(part) * 0.45):], 140, seed=5)
        xf = int(SR * 0.012)
        head = part[: int(len(part) * 0.45)]
        clip = np.concatenate([head[:-xf], head[-xf:] * np.linspace(1, 0, xf) + hiss[:xf] * np.linspace(0, 1, xf), hiss[xf:]])
        clip = fade_out(clip, 60)
        info["method"] = f"affricate: natural burst + {len(part) / SR * 1000:.0f} ms of the voice's own frication, hiss lengthened to ~{len(clip) / SR * 1000:.0f} ms"
    elif kind == "affrv":
        # /j/ (dʒ) is a stop then VOICED friction: keep the voice's own burst and buzz up to the vowel (looping the hiss would lose the voicing)
        on = next((i for i in range(len(v)) if v[i] and i < len(env) and env[i] > 0.3 * peak), len(env) // 2)
        part = a[: max(int(SR * 0.13), on * h - int(SR * 0.01))]
        clip = fade_out(part, 70)
        info["method"] = f"voiced affricate: the voice's own burst and buzz, {len(clip) / SR * 1000:.0f} ms"
    elif kind == "vstop0":
        # /p t k/ are unvoiced: PURE sounds are allowed. Burst + a breathy (voiceless) release, no voiced vowel.
        st = next((i for i in range(len(env)) if env[i] > 0.10 * peak), 0)
        on = next((i for i in range(st, len(v)) if v[i] and i < len(env) and env[i] > 0.25 * peak), st + 10)
        burst = a[max(0, st * h - int(SR * 0.006)): st * h + int(SR * 0.014)]
        asp = a[st * h + int(SR * 0.010): max(st * h + int(SR * 0.045), on * h + int(SR * 0.010))]
        tail = sustain_noise(asp, 150, seed=11)
        tail = tail * np.exp(-np.linspace(0, 3.2, len(tail)))  # breath dies away
        xf = int(SR * 0.004)
        clip = np.concatenate([burst[:-xf], burst[-xf:] * np.linspace(1, 0, xf) + tail[:xf] * np.linspace(0, 1, xf), tail[xf:]])
        info["method"] = "unvoiced stop: burst + breathy release (no voiced vowel), ~170 ms"
    else:
        # /b d g/ cannot be heard clearly alone without a little vowel (DfE Reading Framework, Appendix 6): keep a small faded schwa
        st = next((i for i in range(len(env)) if env[i] > 0.10 * peak), 0)
        on = next((i for i in range(st, len(v)) if v[i] and i < len(env) and env[i] > 0.25 * peak), st + 10)
        end = max(on * h + int(SR * 0.085), st * h + int(SR * 0.165))
        clip = a[max(0, st * h - int(SR * 0.006)): end]
        clip = fade_out(clip, 95)
        info["method"] = "voiced stop: burst + a small faded vowel (the Reading Framework allows this for /b d g/)"
    return normalise(clip, 0.13 if kind != "fric" else 0.10), info


def render_vowel(voice, ipa_sym, key=None):
    ids = ["ˈ", ipa_sym] if ipa_sym in voice.config.phoneme_id_map else ["ˈ", *syms(ipa_sym)]  # one symbol where the voice has one
    if key in DIPHTHONGS:
        # a diphthong is a glide (e to i): looping its middle would flatten it into a steady vowel, so slow the voice down
        # until the whole glide is long enough to hear
        for ls in (2.4, 3.0, 3.6, 4.2, 5.0, 6.0):
            a = trim(speak_ids(voice, to_ids(voice, ids), ls))
            if len(a) >= int(SR * 0.52):
                break
        a = a[: int(SR * 0.75)]  # long enough to hear the glide, not so long it drags
        a = fade_out(fade_in(a, 20), 120 if len(a) >= int(SR * 0.75) else 90)
        return normalise(a, 0.11), {"method": f"diphthong spoken slowly by the voice (glide kept), {len(a) / SR * 1000:.0f} ms"}
    a = trim(speak_ids(voice, to_ids(voice, ids), 2.4))
    a = sustain_voiced(a, TARGET_MS["vowel"], periods=5) if len(a) < int(SR * TARGET_MS["vowel"] / 1000) else a[: int(SR * TARGET_MS["vowel"] / 1000)]
    a = fade_out(fade_in(a, 20), 90)
    return normalise(a, 0.11), {"method": "lone vowel from the voice, steady middle extended to ~520 ms"}


def spectral_centroid(a):
    sp = np.abs(np.fft.rfft(a * np.hanning(len(a)))) ** 2
    f = np.fft.rfftfreq(len(a), 1 / SR)
    return float((f * sp).sum() / (sp.sum() or 1))


def checks_for(key, clip):
    """Measurements that catch mechanical failures (not a substitute for listening)."""
    ms = len(clip) / SR * 1000
    rms = float(np.sqrt(np.mean(clip ** 2)))
    vf = float(np.mean(G.voicing(to_int16(clip)))) if len(clip) > 600 else 0.0
    out = {"ms": round(ms), "rms": round(rms, 3), "voiced_fraction": round(vf, 2), "centroid_hz": round(spectral_centroid(clip))}
    warn = []
    kind = CLASS.get(key, "vowel")
    if rms < 0.04: warn.append("very quiet")
    if kind == "vowel" and vf < 0.6: warn.append("vowel not clearly voiced (this take is breathy or noisy)")
    if kind == "vowel" and ms < 450: warn.append("vowel too short to hear")
    if kind == "fric" and ms < 300: warn.append("short")
    if kind == "sonor" and (ms < 300 or vf < 0.5): warn.append("short or not clearly voiced")
    if kind == "fric" and key == "s" and out["centroid_hz"] < 4000: warn.append("/s/ should be bright (centroid >4 kHz)")
    if key == "sh" and not (2200 <= out["centroid_hz"] <= 5200): warn.append("/sh/ should sit lower than /s/ (centroid about 2.5-5 kHz)")
    if kind in ("fric", "affr") and key not in ("v", "z", "j") and out["voiced_fraction"] > 0.2: warn.append("should be voiceless (this take has a voiced murmur)")
    if key == "th" and out["centroid_hz"] < 3500: warn.append("/th/ should be a bright, flat hiss (centroid > 3.5 kHz)")
    if kind == "affr" and not (150 <= ms <= 450): warn.append("affricate length odd")
    if kind == "affrv" and not (110 <= ms <= 450): warn.append("voiced affricate length odd")
    if kind == "vfric" and (ms < 300 or vf < 0.3): warn.append("voiced fricative short or not voiced")
    if kind == "seq" and not (250 <= ms <= 700): warn.append("two-sound letter group length odd")
    if kind == "sonor" and key in NASALS and out["centroid_hz"] > 1800: warn.append("nasal looks too bright")
    if kind.startswith("vstop") and not (130 <= ms <= 320): warn.append("stop length odd")
    out["warnings"] = warn
    return out


# ---- words / phrases -------------------------------------------------------------------------------------------
def word_phonemes(graphemes, ipa, voice=None):
    """The phoneme string for a word. A diphthong is ONE symbol where the voice has one (RP: aɪ aʊ ɔɪ eɪ): spoken as two separate
    symbols ("a" then "ɪ") the voice squeezes it into a short vowel (a recogniser heard night as knit, cow as coo; understood 0/11 igh words
    that way and 8/11 with the single symbol). A voice with no such symbol (the Northern one) gets the two symbols, plus a length mark after
    eɪ, which helped there."""
    have = voice.config.phoneme_id_map if voice is not None else {}
    syms, done = [], False
    for g in graphemes:
        s = ipa[G.GRAPHEME_KEY[g]]
        if s in VOWEL_SYMS and not done:
            syms.append("ˈ")
            done = True
        if s in have:
            syms.append(s)
        else:
            syms.extend(list(s))
            if s == "eɪ":
                syms.append("ː")
    return syms


def text_phonemes(voice, text, accent):
    out = []
    for sent in voice.phonemize(text):
        out.append([NORTH_MAP.get(p, p) if accent == "north" else p for p in sent])
    return out


def speak_sentences(voice, sentences, ls=LS_WORD):
    parts = []
    for s in sentences:
        parts.append(trim(speak_ids(voice, to_ids(voice, s), ls)))
        parts.append(np.zeros(int(SR * 0.18), dtype=np.float32))
    return np.concatenate(parts[:-1]) if parts else np.zeros(0, dtype=np.float32)


def write(rel, a):
    path = os.path.join(OUT, rel)
    G.write_wav(path, to_int16(a))


def asr_available():
    try:
        sys.path.insert(0, HERE)
        import asr_check  # noqa: F401
        return True
    except Exception:
        return False


MISSING = "--missing" in sys.argv  # only render what is not already on disk (keeps every existing take byte-for-byte)


def have(rel):
    return MISSING and os.path.exists(os.path.join(OUT, rel))


def generate(accent, bank, shared_unused):
    name, base, credit = ACCENT_VOICES[accent]
    voice = fetch(name, base)
    cfg = G.ACCENTS[accent]
    ipa = {**G.BASE_IPA, **cfg["ipa"]}
    out = os.path.join(OUT, accent)
    os.makedirs(out, exist_ok=True)
    report = {"accent": accent, "label": cfg["label"], "voice": name, "credit": credit, "engine": "Piper neural TTS",
              "expected_ipa": ipa, "phonemes": {}, "words": {}, "phrases": {}, "safari": {}, "problems": [], "warnings": [], "asr": {}}
    manifest = {"accent": accent, "label": cfg["label"], "voice": name, "credit": credit, "phonemes": {}, "words": {}, "phrases": {}, "sources": {}}
    if MISSING and os.path.exists(os.path.join(out, "manifest.json")):
        old_m, old_r = json.load(open(os.path.join(out, "manifest.json"))), json.load(open(os.path.join(out, "audit.json")))
        manifest.update({k: old_m[k] for k in ("phonemes", "words", "phrases", "sources")})
        for k in ("phonemes", "words", "phrases", "safari", "asr"):
            report[k] = old_r.get(k, {})

    # 1. isolated sounds: three variants each (slightly different settings) so repeats do not sound identical
    for key in G.MNEMONIC:
        if have(f"{accent}/phonemes/{key}_2.wav"):
            continue
        manifest["phonemes"].pop(key, None)  # re-rendering a sound replaces its takes (it must not append to the old ones)
        sym = ipa[key]
        entry = {"expected_ipa": sym, "files": []}
        for v in range(3):
            # the voice is stochastic: every take differs; re-take one that fails its own measurements. /th/ is a weak, flat hiss that
            # the northern voice only occasionally produces without a voiced murmur, so it gets many more tries.
            for attempt in range(60 if key == "th" else 6):
                if key in G.VOWELS:
                    clip, info = render_vowel(voice, sym, key)
                elif (accent, key) in BORROWED:
                    # the northern voice cannot make a voiceless /th/ (60 takes each came out as a voiced murmur); a voiceless hiss carries no
                    # regional vowel, so the RP voice's /th/ is used and the manifest says so
                    src = BORROWED[(accent, key)]
                    clip, info = render_consonant(fetch(*ACCENT_VOICES[src][:2]), key, {**G.BASE_IPA, **G.ACCENTS[src]["ipa"]}[key])
                    info["method"] += f" [borrowed from the {src} voice: the {accent} voice cannot make a voiceless /{key}/]"
                else:
                    clip, info = render_consonant(voice, key, sym)
                chk = checks_for(key, clip)
                if not chk["warnings"]:
                    break
            info["takes_needed"] = attempt + 1
            rel = f"{accent}/phonemes/{key}_{v}.wav"
            write(rel, clip)
            entry["files"].append({"file": rel, "source": f"piper:{ACCENT_VOICES[BORROWED[(accent, key)]][0] if (accent, key) in BORROWED else name}", **info, **chk})
            manifest["phonemes"].setdefault(key, []).append(rel)
            manifest["sources"][key] = f"piper ({info['method'].split(',')[0]})" + (f" [borrowed from the {BORROWED[(accent, key)]} voice]" if (accent, key) in BORROWED else "")
            for w in chk["warnings"]:
                # a clip that is nearly silent is a hard failure; the rest are measurement notes for the human listener
                (report["problems"] if w == "very quiet" else report["warnings"]).append(f"[{accent}] /{key}/ v{v}: {w}")
        report["phonemes"][key] = entry

    # 2. words: spoken from OUR phoneme strings
    removed = []
    for w in bank["words"]:
        text, gr = w["text"], w["graphemes"]
        if text in cfg.get("exclude", ()) or (accent == "rp" and text == "pass"):
            removed.append(text)
            report["words"][text] = {"status": "excluded in this accent (BATH vowel)"}
            continue
        rel = f"{accent}/words/{text}.wav"
        if have(rel):
            manifest["words"][text] = rel
            continue
        ph = word_phonemes(gr, ipa, voice)
        a = normalise(trim(speak_ids(voice, to_ids(voice, ph))), 0.1)
        write(rel, a)
        manifest["words"][text] = rel
        report["words"][text] = {"phonemes": "".join(ph), "ms": round(len(a) / SR * 1000)}

    # 3. Safari words: Piper's own phonemisation (patched for northern), first sound audited
    removed_safari = []
    for it in bank.get("safari", []):
        word, p = it["word"], it["p"]
        if have(f"{accent}/words/{word}.wav") and word in report["safari"]:
            if report["safari"][word] != "ok":
                removed_safari.append(word)
            continue
        phs = text_phonemes(voice, word, accent)
        flat = [x for x in phs[0] if x != "ˈ"] if phs else []
        exp = ipa[p]
        if not flat or "".join(flat).startswith(exp) is False:
            report["safari"][word] = f"excluded: starts with {flat[:len(exp)]}, expected {exp!r}"
            removed_safari.append(word)
            continue
        report["safari"][word] = "ok"
        if word not in manifest["words"]:
            a = normalise(trim(speak_sentences(voice, phs)), 0.1)
            rel = f"{accent}/words/{word}.wav"
            write(rel, a)
            manifest["words"][word] = rel

    # 4. fixed phrases
    for k, t in G.PHRASES.items():
        if have(f"{accent}/phrases/{k}.wav"):
            continue
        a = normalise(trim(speak_sentences(voice, text_phonemes(voice, t, accent), 1.1)), 0.1)
        rel = f"{accent}/phrases/{k}.wav"
        write(rel, a)
        manifest["phrases"][k] = rel
        report["phrases"][k] = {"text": t, "ms": round(len(a) / SR * 1000)}

    # 4b. what each sound-friend says (no letter names: the real sound is played right after the line)
    for gid, text in bank.get("stories", {}).items():
        if have(f"{accent}/phrases/story_{gid}.wav"):
            continue
        a = normalise(trim(speak_sentences(voice, text_phonemes(voice, text, accent), 1.1)), 0.1)
        rel = f"{accent}/phrases/story_{gid}.wav"
        write(rel, a)
        manifest["phrases"][f"story_{gid}"] = rel

    # 5. optional second opinion: a speech recogniser on a carrier sentence for each bank word
    if "--asr" in sys.argv and asr_available():
        import asr_check
        ok, miss = 0, []
        for w in bank["words"]:
            if w["text"] in removed:
                continue
            ph = word_phonemes(w["graphemes"], ipa, voice)
            lead = text_phonemes(voice, "The word is", accent)[0]
            a = speak_sentences(voice, [lead, ph])
            got = asr_check.transcribe(a, SR)
            if got.endswith(w["text"]):
                ok += 1
            else:
                miss.append((w["text"], got.replace("the word is", "").strip()))
        report["asr"] = {"understood": ok, "of": ok + len(miss), "missed": miss,
                         "note": "base.en recogniser on 'The word is X.'; biased on short vowels; misses mean 'listen to this one', not 'wrong'"}
        print(f"  [{accent}] recogniser understood {ok}/{ok + len(miss)} words")

    manifest["removed_words"] = sorted(removed)
    manifest["removed_safari"] = sorted(removed_safari)
    report["removed_words"] = sorted(removed)
    json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(out, "audit.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(HERE, f"audit-{accent}.json"), "w"), indent=1, ensure_ascii=False)
    return manifest, report


def main():
    import shutil
    bank = json.load(open(os.path.join(HERE, "bank.json")))
    only = [a for a in ACCENT_VOICES if f"--only={a}" in sys.argv] or list(ACCENT_VOICES)
    if "--keep" not in sys.argv and not MISSING:
        for a in only:
            shutil.rmtree(os.path.join(OUT, a), ignore_errors=True)
    index = {"accents": {}}
    for accent in only:
        manifest, report = generate(accent, bank, None)
        index["accents"][accent] = {"label": G.ACCENTS[accent]["label"], "voice": manifest["voice"], "credit": manifest["credit"],
                                    "removed_words": manifest["removed_words"], "removed_safari": manifest["removed_safari"]}
        print(f"[{accent}] sounds {len(manifest['phonemes'])}/26 words {len(manifest['words'])} phrases {len(manifest['phrases'])} "
              f"excluded words {manifest['removed_words']} safari {manifest['removed_safari']}")
        for p in report["problems"]:
            print("   PROBLEM", p)
        for p in report["warnings"]:
            print("   note:", p)
    if len(only) == len(ACCENT_VOICES):
        json.dump(index, open(os.path.join(OUT, "index.json"), "w"), indent=1, ensure_ascii=False)
    shutil.rmtree(os.path.join(OUT, "shared"), ignore_errors=True)  # the formant clips are no longer used
    if len(only) == len(ACCENT_VOICES):
        credits = ["Soundling audio credits", "",
                   "Spoken audio is generated with the Piper neural text-to-speech engine (https://github.com/rhasspy/piper)."]
        for a, (n, _, c) in ACCENT_VOICES.items():
            credits.append(f"  {G.ACCENTS[a]['label']}: voice {n} - {c}")
        credits += ["", "CC BY-SA 4.0 (the northern voice) has a ShareAlike condition: whether generated audio counts as a derivative is a legal",
                    "question that has NOT been checked. Review before any public release.", "",
                    "Generated audio is a stand-in for recordings by trained voice talent. Nobody has yet listened to it for correctness.", "",
                    "Note on the Northern English pack: its /th/ sound (the hiss of \"thin\") is taken from the Southern British voice above, because the",
                    "Northern voice could not produce a voiceless /th/. See public/audio/north/manifest.json (\"sources\") for the exact files."]
        open(os.path.join(OUT, "CREDITS.txt"), "w").write("\n".join(credits) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
