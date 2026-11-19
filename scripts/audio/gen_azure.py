#!/usr/bin/env python3
"""Generate the 'azure-rp' accent pack with Azure AI Speech (neural TTS) and audit it.

    npx tsx scripts/export-bank.ts            # (bank.json already committed)
    python3 scripts/audio/gen_azure.py --cache /path/to/cache [--voice en-GB-SoniaNeural] [--no-asr]

The key: NEVER put a subscription key in this repo. The script sends no key header at all; in the cloud environment the network
proxy adds it for the Speech host. If you run it yourself, route requests through your own authenticated proxy or add the
header in azure_client.py LOCALLY and do not commit that change.

WHAT THIS IS AND IS NOT (read before trusting any number)
  * Nobody has LISTENED to this audio. Every check is a measurement: duration, level, clipping, silence, spectral shape, formants,
    and a speech recogniser (faster-whisper base.en). The recogniser is a biased intelligibility proxy (it was trained on adult
    running speech, it is blind to many phonics errors, and it says NOTHING about how natural or pleasant a voice sounds).
  * Output lands in public/audio/azure-rp/ next to the existing rp and north packs, which are never touched.
  * Same container/format as the other packs: 16-bit mono PCM WAV at 22050 Hz, RMS-normalised the same way (words/phrases 0.10).

How each kind of clip is made (all from Azure; `ph` = <phoneme alphabet='ipa'>, so the voice says OUR sound, not its spelling rules)
  * stops p t k g d   : lone IPA phoneme, burst kept, silence trimmed. b: its lone clip is ~70 ms, so the burst of "bə" plus a
                        short faded vowel (same recipe and reason as the existing packs: DfE Reading Framework says /b d g/ cannot be heard alone)
  * hiss s th         : lone IPA phoneme at rate x-slow (~450-500 ms of steady hiss)
  * hiss f sh h       : the lone phoneme is clicky/short for these, so the hiss before the vowel of "fɑ/ʃɑ/hɑ" (x-slow) is cut out and, if
                        shorter than 480 ms, lengthened by granular resynthesis (the existing packs' method)
  * m n ng l r v z    : lone IPA phoneme at x-slow, steady part kept (~430 ms)
  * vowels            : lone IPA vowel at x-slow, cut to ~520 ms (diphthongs keep the whole glide, <= 750 ms)
  * ch j              : lone affricate (ch normal rate, j slow)
  * x, qu             : x = /k/ then /s/ joined (one letter group, two sounds); qu = lone "kw"
  * three takes       : pitch +0% / +5% / -5%, so repeats do not sound identical
  * words             : plain text (rate -10%) in a UK voice; a word the recogniser misses is re-made with a phoneme tag if we have its IPA
  * phrases/stories   : plain text, natural prosody
"""
import argparse, concurrent.futures as cf, hashlib, io, json, os, re, shutil, subprocess, sys, time
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen_audio as G  # noqa: E402  (the per-accent IPA tables and the fixed phrases)
from azure_client import Client, AuthStop, BudgetStop, ssml_doc, esc  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
AUDIO = os.path.join(ROOT, "public", "audio")
SR = 22050
ACCENT_ID = "azure-rp"
LABEL = "Southern English (Azure voice)"
CREDIT = ("Microsoft Azure AI Speech neural voice {voice} (prebuilt standard neural voice), synthetic speech generated "
          "{date}. Terms unverified: see CREDITS.txt")
EXCLUDE_WORDS = {"pass"}  # RP BATH vowel /pɑːs/ clashes with the taught /a/: same exclusion as the rp pack (ACCENT_EXCLUDE)
TAKE_PITCH = ["+0%", "+5%", "-5%"]
WORD_RATE = "-10%"
TARGET_RMS = {"fric": 0.10, "sonor": 0.13, "vowel": 0.11, "stop": 0.13, "affr": 0.13, "affrv": 0.13, "seq": 0.12}
TARGET_MS = {"fric": 480, "sonor": 430, "vowel": 520}
CLASS = {"v": "sonor", "z": "sonor", "j": "affrv", "w": "stop", "y": "stop", "x": "seq", "qu": "seq",
         "s": "fric", "f": "fric", "h": "fric", "sh": "fric", "th": "fric", "ch": "affr", "m": "sonor", "n": "sonor", "ng": "sonor",
         "l": "sonor", "r": "sonor", "p": "stop", "t": "stop", "k": "stop", "b": "stop", "d": "stop", "g": "stop"}
DIPHTHONGS = {"ai", "oa", "igh", "ow", "oi", "ear", "air"}
# hard limits per type (ms): the same ones the repo's engine test enforces for every accent
LIMITS = {"stop": (130, 320), "affr": (150, 450), "affrv": (110, 450), "seq": (250, 700), "fric": (400, 900), "sonor": (380, 900), "vowel": (450, 900)}


OUT_ROOT = os.path.join(AUDIO, ACCENT_ID)


def dest(rel):
    """Manifest-relative path ('azure-rp/words/cat.wav', or another pack's file for a fallback) -> file on disk."""
    return os.path.join(OUT_ROOT, rel[len(ACCENT_ID) + 1:]) if rel.startswith(ACCENT_ID + "/") else os.path.join(AUDIO, rel)


def kind_of(key):
    return CLASS.get(key, "vowel")


# ------------------------------------------------------------------------------------------------ audio helpers
def decode(wav_bytes):
    """Azure's 48 kHz WAV -> float32 mono at 22050 Hz (ffmpeg's resampler)."""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1"],
                       input=wav_bytes, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def frames_db(a, win_ms=10):
    w = int(SR * win_ms / 1000)
    n = max(1, len(a) // w)
    e = np.array([np.sqrt(np.mean(a[i * w:(i + 1) * w] ** 2)) for i in range(n)])
    return 20 * np.log10(e + 1e-9), w


def trim(a, rel_db=-40, floor_db=-75, pad_ms=12, merge_ms=300, junk_ms=90, junk_share=0.01):
    """Cut leading/trailing silence. Azure leaves faint blips ~0.4 s after the end of some clips; segments that are short and
    carry <1% of the energy and sit beyond a gap are dropped so they are not mistaken for speech."""
    if not len(a):
        return a
    db, w = frames_db(a)
    pk = db.max()
    act = db > max(pk + rel_db, floor_db)
    segs, i = [], 0
    while i < len(act):
        if act[i]:
            j = i
            while j + 1 < len(act) and act[j + 1]:
                j += 1
            segs.append([i, j]); i = j + 1
        else:
            i += 1
    if not segs:
        return a
    merged = [segs[0]]
    for s in segs[1:]:
        if (s[0] - merged[-1][1]) * w / SR * 1000 <= merge_ms:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    energy = lambda s: float(np.sum(a[s[0] * w:(s[1] + 1) * w] ** 2))
    tot = sum(energy(s) for s in merged) or 1.0
    keep = [s for s in merged if not ((s[1] - s[0] + 1) * w / SR * 1000 < junk_ms and energy(s) / tot < junk_share)] or merged
    pad = int(SR * pad_ms / 1000)
    return a[max(0, keep[0][0] * w - pad): keep[-1][1] * w + w + pad]


def _strongest(a, rel_db=-40, floor_db=-75, gap_ms=70, pad_ms=10):
    db, w = frames_db(a)
    act = db > max(db.max() + rel_db, floor_db)
    segs, i = [], 0
    while i < len(act):
        if act[i]:
            j = i
            while j + 1 < len(act) and act[j + 1]:
                j += 1
            segs.append([i, j]); i = j + 1
        else:
            i += 1
    if not segs:
        return a
    merged = [segs[0]]
    for s in segs[1:]:
        if (s[0] - merged[-1][1]) * w / SR * 1000 <= gap_ms:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    best = max(merged, key=lambda s: float(np.sum(a[s[0] * w:(s[1] + 1) * w] ** 2)))
    pad = int(SR * pad_ms / 1000)
    return a[max(0, best[0] * w - pad): best[1] * w + w + pad]


def fade_in(a, ms):
    n = min(len(a), int(SR * ms / 1000)); a = a.copy()
    if n:
        a[:n] *= np.linspace(0, 1, n)
    return a


def fade_out(a, ms, power=1.5):
    n = min(len(a), int(SR * ms / 1000)); a = a.copy()
    if n:
        a[-n:] *= np.linspace(1, 0, n) ** power
    return a


def rms_of(a):
    return float(np.sqrt(np.mean(a ** 2))) if len(a) else 0.0


def normalise(a, target_rms, ceiling=0.92):
    r = rms_of(a) or 1.0
    g = min(target_rms / r, ceiling / (float(np.abs(a).max()) or 1.0))
    return (a * g).astype(np.float32)


def to_int16(a):
    return np.clip(a * 32767, -32768, 32767).astype(np.int16)


def sustain_noise(x, target_ms, seed=7):
    """Granular resynthesis for noise-like sounds (same method as the existing packs)."""
    rng = np.random.default_rng(seed)
    grain = min(len(x), int(SR * 0.07)); hop = max(1, grain // 2)
    target = int(SR * target_ms / 1000)
    out = np.zeros(target + grain, dtype=np.float64); win = np.hanning(grain); pos = 0
    while pos < target:
        st = int(rng.integers(0, max(1, len(x) - grain + 1)))
        g = x[st:st + grain]
        out[pos:pos + len(g)] += g * win[:len(g)]
        pos += hop
    return (out[:target] / (rms_of(out[:target]) or 1) * (rms_of(x) or 1)).astype(np.float32)


def voiced_flags(a, hop_ms=5, win_ms=25):
    """Per-hop periodicity flag (autocorrelation in the 80-400 Hz pitch range), as in gen_audio.voicing."""
    hop, win = int(SR * hop_ms / 1000), int(SR * win_ms / 1000)
    lo, hi = int(SR / 400), int(SR / 80)
    out = []
    for i in range(0, max(1, len(a) - win), hop):
        f = a[i:i + win].astype(np.float64); f = f - f.mean(); e = float((f * f).sum())
        if e < 1e-6 * len(f) or len(f) < hi + 2:
            out.append(False); continue
        ac = np.correlate(f, f, "full")[len(f) - 1:]
        out.append(bool(ac[lo:hi].max() / e > 0.5))
    return np.array(out), hop


def vowel_onset(a):
    """Sample index where the voiced vowel starts in a consonant+vowel carrier (first >=20 ms voiced run that is also loud)."""
    v, hop = voiced_flags(a)
    db, w = frames_db(a, 5)
    peak = db.max()
    for i in range(len(v) - 4):
        if v[i:i + 4].all() and i < len(db) and db[i] > peak - 14:
            return i * hop
    return len(a) // 2


def spectral_centroid(a):
    if len(a) < 64:
        return 0.0
    sp = np.abs(np.fft.rfft(a * np.hanning(len(a)))) ** 2; f = np.fft.rfftfreq(len(a), 1 / SR)
    return float((f * sp).sum() / (sp.sum() or 1))


# ------------------------------------------------------------------------------------------------ SSML builders
def ipa_ssml(voice, ph, pitch="+0%", rate="x-slow", carrier_text="x"):
    inner = f"<phoneme alphabet='ipa' ph='{ph}'>{carrier_text}</phoneme>"
    return ssml_doc(voice, f"<prosody rate='{rate}' pitch='{pitch}'>{inner}</prosody>")


def text_ssml(voice, text, rate=None, pitch=None):
    inner = esc(text)
    attrs = (f" rate='{rate}'" if rate else "") + (f" pitch='{pitch}'" if pitch else "")
    return ssml_doc(voice, f"<prosody{attrs}>{inner}</prosody>" if attrs else inner)


# ------------------------------------------------------------------------------------------------ isolated sounds
# key -> (strategy, ipa for the phoneme tag, rate)
def plan(key, ipa):
    k = kind_of(key)
    if key == "x":
        return ("join_ks", None, None)
    if key == "qu":
        return ("lone", "kw", "medium")
    if key in ("f", "sh", "h"):
        return ("fric_carrier", ipa + "ɑ", "x-slow")
    if key == "b":
        return ("burst_carrier", ipa + "ə", "slow")
    if key == "p":
        return ("breath_stop", ipa, "medium")  # a lone Azure /p/ is "puh": keep the burst + aspiration, drop the voiced vowel
    if key == "z":
        return ("coda_fric", "ɑ" + ipa, "x-slow")  # a lone Azure /z/ is almost unvoiced (sounds like /s/): take the z of "ɑz" instead
    if key in ("t", "k"):
        return ("lone", ipa, "medium")
    if key in ("d", "g"):
        return ("lone", ipa, "medium")
    if key in ("w", "y"):
        return ("lone", ipa, "medium")
    if key == "ch":
        return ("lone", ipa, "medium")
    if key == "j":
        return ("lone", ipa, "slow")
    return ("lone", ipa, "x-slow")  # s th m n ng l r v z and every vowel


def render_sound(client, voice, key, ipa, take, base_ipa):
    """Returns (clip, info) before loudness normalisation. May raise only on API failure."""
    strat, ph, rate = plan(key, ipa)
    pitch = TAKE_PITCH[take]
    kind = kind_of(key)
    if strat == "join_ks":
        k_clip, _ = render_sound(client, voice, "k", base_ipa["k"], take, base_ipa)
        s_clip, _ = render_sound(client, voice, "s", base_ipa["s"], take, base_ipa)
        k_clip, s_clip = normalise(k_clip, 0.13), normalise(s_clip, 0.10)  # a lone /k/ is far quieter than /s/: balance them first
        first = fade_out(k_clip[: int(SR * 0.16)], 10)
        second = fade_out(s_clip[: int(SR * 0.30)], 70)
        xf = int(SR * 0.012)
        clip = np.concatenate([first[:-xf], first[-xf:] * np.linspace(1, 0, xf) + second[:xf] * np.linspace(0, 1, xf), second[xf:]])
        return clip, {"method": f"two sounds as one letter group: /k/ then /s/, joined, {len(clip) / SR * 1000:.0f} ms"}
    raw = decode(client.synth(voice, ipa_ssml(voice, ph, pitch, rate)))
    info = {"ssml_ph": ph, "rate": rate, "pitch": pitch}
    if strat == "lone":
        a = _strongest(raw)
        if kind == "fric":
            clip = fade_out(fade_in(a[: int(SR * TARGET_MS["fric"] / 1000)], 20), 70)
            info["method"] = f"lone phoneme at {rate}, steady hiss kept ({len(clip) / SR * 1000:.0f} ms)"
        elif kind == "sonor":
            clip = fade_out(fade_in(a[: int(SR * TARGET_MS["sonor"] / 1000)], 25), 80)
            info["method"] = f"lone phoneme at {rate}, steady part kept ({len(clip) / SR * 1000:.0f} ms)"
        elif kind == "vowel":
            if key in DIPHTHONGS:
                clip = fade_out(fade_in(a[: int(SR * 0.75)], 20), 120)
                info["method"] = f"diphthong, lone phoneme at {rate}, whole glide kept ({len(clip) / SR * 1000:.0f} ms)"
            else:
                clip = fade_out(fade_in(a[: int(SR * TARGET_MS["vowel"] / 1000)], 20), 90)
                info["method"] = f"lone vowel at {rate}, cut to {len(clip) / SR * 1000:.0f} ms"
        elif key in ("w", "y"):
            clip = fade_out(fade_in(a[: int(SR * 0.29)], 8), 60)
            info["method"] = f"glide, lone phoneme, {len(clip) / SR * 1000:.0f} ms"
        else:
            clip = fade_out(fade_in(a, 4), 70 if key in ("d", "g") else 25 if kind == "stop" else 40)
            info["method"] = f"lone phoneme ({kind}), {len(clip) / SR * 1000:.0f} ms"
        return clip, info
    if strat == "fric_carrier":
        a = trim(raw, merge_ms=1000, pad_ms=0)
        on = vowel_onset(a)
        part = a[: max(int(SR * 0.10), on - int(SR * 0.015))]
        target = TARGET_MS["fric"]
        clip = sustain_noise(part, target) if len(part) < int(SR * target / 1000) else part[: int(SR * target / 1000)]
        clip = fade_out(fade_in(clip, 25), 70)
        info["method"] = f"hiss cut from carrier /{ph}/ before the vowel ({len(part) / SR * 1000:.0f} ms), granular lengthening to {len(clip) / SR * 1000:.0f} ms"
        return clip, info
    if strat == "breath_stop":
        a = trim(raw, rel_db=-50, floor_db=-75, merge_ms=1000, pad_ms=0)
        v, hop = voiced_flags(a)
        db, w = frames_db(a, 5)
        st = int(np.argmax(db > -62)) * w
        on = next((i * hop for i in range(len(v) - 2) if v[i:i + 3].all() and i * hop > st), st + int(SR * 0.05))
        burst = a[st: st + int(SR * 0.022)]
        asp = a[st + int(SR * 0.012): max(st + int(SR * 0.04), on - int(SR * 0.004))]
        tail = sustain_noise(asp, 130, seed=11)
        tail = tail * np.exp(-np.linspace(0, 3.2, len(tail)))  # the breath dies away (as in the existing packs)
        xf = int(SR * 0.004)
        clip = np.concatenate([burst[:-xf], burst[-xf:] * np.linspace(1, 0, xf) + tail[:xf] * np.linspace(0, 1, xf), tail[xf:]])
        clip = fade_out(fade_in(clip, 2), 30)
        info["method"] = f"unvoiced stop: burst + {len(asp) / SR * 1000:.0f} ms of aspiration lengthened to a breathy release, voiced vowel dropped ({len(clip) / SR * 1000:.0f} ms)"
        return clip, info
    if strat == "coda_fric":
        a = trim(raw, merge_ms=1000, pad_ms=0)
        w = int(SR * 0.01)
        hf = []
        for i in range(0, len(a) - w, w):
            sp = np.abs(np.fft.rfft(a[i:i + w] * np.hanning(w))) ** 2; f = np.fft.rfftfreq(w, 1 / SR)
            hf.append(sp[f > 3000].sum() / (sp.sum() or 1))
        hf = np.array(hf)
        j = len(hf) - 1
        while j > 0 and hf[j] < 0.5:  # skip the faded tail
            j -= 1
        k = j
        while k > 0 and hf[k - 1] >= 0.5:
            k -= 1
        part = a[k * w + int(SR * 0.012): (j + 1) * w + int(SR * 0.02)]
        clip = part[: int(SR * TARGET_MS["sonor"] / 1000)]
        clip = fade_out(fade_in(clip, 15), 70)
        info["method"] = f"voiced hiss cut from the end of carrier /{ph}/ ({len(clip) / SR * 1000:.0f} ms)"
        return clip, info
    # burst_carrier (b): burst of "bə" + a short faded vowel
    a = trim(raw, rel_db=-58, floor_db=-72, merge_ms=1000, pad_ms=0)  # the burst is ~45 dB below the vowel that follows it
    db, w = frames_db(a, 5)
    st = int(np.argmax(db > -66)) * w
    clip = a[max(0, st - int(SR * 0.01)): st + int(SR * 0.165)]
    clip = fade_out(fade_in(clip, 3), 95)
    info["method"] = f"voiced stop: burst of /{ph}/ + a small faded vowel (as in the existing packs), {len(clip) / SR * 1000:.0f} ms"
    return clip, info


def sound_checks(key, raw_clip, clip):
    """Measurements for the HARD checks (a failure means: fall back to the rp pack's file) and advisory notes."""
    kind = kind_of(key)
    ms = len(clip) / SR * 1000
    out = {"ms": round(ms), "rms": round(rms_of(clip), 3), "peak": round(float(np.abs(clip).max()), 3),
           "raw_peak": round(float(np.abs(raw_clip).max()), 4), "centroid_hz": round(spectral_centroid(clip))}
    vf = float(np.mean(voiced_flags(clip)[0])) if len(clip) > 600 else 0.0
    out["voiced_fraction"] = round(vf, 2)
    db, w = frames_db(clip, 5)
    act = np.nonzero(db > -55)[0]  # absolute: quieter than -55 dBFS counts as silence
    out["lead_silence_ms"] = round(act[0] * w / SR * 1000) if len(act) else None
    out["trail_silence_ms"] = round((len(db) - 1 - act[-1]) * w / SR * 1000) if len(act) else None
    hard, note = [], []
    lo, hi = LIMITS[kind]
    if not len(clip) or out["raw_peak"] < 0.004:
        hard.append("silent / empty")
    if ms < lo:
        hard.append(f"too short ({ms:.0f} ms < {lo})")
    if ms > hi:
        hard.append(f"too long ({ms:.0f} ms > {hi})")
    if out["peak"] >= 0.98 or float(np.mean(np.abs(clip) >= 0.98)) > 0:
        hard.append("clipped")
    if out["rms"] < 0.04:
        hard.append("too quiet after normalisation (peaky clip)")
    if out["lead_silence_ms"] is not None and (out["lead_silence_ms"] > 40 or out["trail_silence_ms"] > 60):
        hard.append("leading/trailing silence not trimmed")
    if kind == "vowel" and vf < 0.6:
        note.append("vowel not clearly voiced")
    if key in ("s",) and out["centroid_hz"] < 4000:
        note.append("/s/ should be bright (centroid > 4 kHz)")
    if key == "sh" and not (2200 <= out["centroid_hz"] <= 5200):
        note.append("/sh/ centroid outside 2.2-5.2 kHz")
    if key == "th" and out["centroid_hz"] < 3500:
        note.append("/th/ should be a bright flat hiss (centroid > 3.5 kHz)")
    if key in ("s", "f", "sh", "th", "h", "ch", "p", "t", "k") and vf > 0.25:
        note.append("should be voiceless but has a voiced murmur")
    if kind in ("sonor",) and key != "v" and key != "z" and vf < 0.5:
        note.append("sonorant not clearly voiced")
    if key in ("m", "n", "ng") and out["centroid_hz"] > 1800:
        note.append("nasal looks too bright")
    out["hard_failures"], out["notes"] = hard, note
    return out


# ------------------------------------------------------------------------------------------------ main
def asr_model():
    from faster_whisper import WhisperModel
    return WhisperModel("base.en", device="cpu", compute_type="int8")


def transcribe(model, a):
    a = np.concatenate([np.zeros(8000, np.float32), a, np.zeros(8000, np.float32)])
    x = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / SR)), np.arange(len(a)), a).astype(np.float32)
    segs, _ = model.transcribe(x, language="en", beam_size=5, condition_on_previous_text=False, vad_filter=False)
    return " ".join(s.text for s in segs).strip().lower()


def norm_words(t):
    return re.sub(r"[^a-z' ]", " ", t.lower().replace("-", " ")).split()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="en-GB-SoniaNeural")
    ap.add_argument("--cache", default=os.environ.get("AZURE_TTS_CACHE", os.path.join(os.path.expanduser("~"), ".cache", "soundling-azure-tts")),
                    help="raw responses are cached here by sha256(voice, format, ssml); keep it OUTSIDE the repo")
    ap.add_argument("--out", default=os.path.join(AUDIO, ACCENT_ID))
    ap.add_argument("--budget", type=int, default=1500, help="hard cap on HTTP requests (cache hits are free)")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--no-asr", action="store_true")
    ap.add_argument("--only-sounds", action="store_true", help="render and check the isolated sounds only (writes nothing but the sound files)")
    ap.add_argument("--rp-dir", default=os.path.join(AUDIO, "rp"), help="existing pack used for per-item fallback of failed isolated sounds")
    args = ap.parse_args()
    voice = args.voice
    client = Client(args.cache, budget=args.budget, workers=args.workers)
    bank = json.load(open(os.path.join(HERE, "bank.json")))
    rp_manifest = json.load(open(os.path.join(args.rp_dir, "manifest.json")))
    ipa = {**G.BASE_IPA}  # the RP table: azure-rp teaches the same sounds as rp
    out = args.out
    global OUT_ROOT
    OUT_ROOT = out
    for sub in ("phonemes", "words", "phrases"):
        shutil.rmtree(os.path.join(out, sub), ignore_errors=True)
        os.makedirs(os.path.join(out, sub), exist_ok=True)
    rel_root = f"{ACCENT_ID}"
    pool = cf.ThreadPoolExecutor(max_workers=args.workers)
    t0 = time.time()
    model = None if args.no_asr else asr_model()
    report = {"accent": ACCENT_ID, "label": LABEL, "voice": voice, "engine": "Azure AI Speech neural TTS (prebuilt standard voice)",
              "output_format_requested": client.fmt, "stored_as": f"WAV PCM 16-bit mono {SR} Hz",
              "expected_ipa": ipa, "phonemes": {}, "words": {}, "phrases": {}, "safari": {}, "problems": [], "warnings": [],
              "fallbacks": [], "asr": {}, "caveats": [
                  "Nobody has listened to this audio. All checks are measurements.",
                  "faster-whisper base.en is a biased intelligibility proxy only. It is not a naturalness measure and it cannot tell "
                  "whether a sound teaches the right phoneme to a child."]}
    manifest = {"accent": ACCENT_ID, "label": LABEL, "voice": voice,
                "credit": CREDIT.format(voice=voice, date=time.strftime("%Y-%m-%d")),
                "phonemes": {}, "words": {}, "phrases": {}, "sources": {}, "fallbacks": {}}

    # ---- 1. isolated sounds -------------------------------------------------------------------------------------
    keys = list(G.MNEMONIC)
    # warm the cache in parallel (the order of results does not matter), then render deterministically
    def warm(key, take):
        strat, ph, rate = plan(key, ipa[key])
        if strat == "join_ks":
            return
        client.synth(voice, ipa_ssml(voice, ph, TAKE_PITCH[take], rate))
    list(pool.map(lambda kt: warm(*kt), [(k, t) for k in keys for t in range(3)]))
    for key in keys:
        entry = {"expected_ipa": ipa[key], "files": []}
        for take in range(3):
            raw_for_check = None
            clip, info = render_sound(client, voice, key, ipa[key], take, ipa)
            kind = kind_of(key)
            raw_for_check = clip
            clip_n = normalise(clip, TARGET_RMS[kind])
            chk = sound_checks(key, raw_for_check, clip_n)
            rel = f"{rel_root}/phonemes/{key}_{take}.wav"
            if chk["hard_failures"]:
                rp_rel = rp_manifest["phonemes"][key][take]
                report["fallbacks"].append({"item": f"/{key}/ take {take}", "why": chk["hard_failures"], "used": rp_rel})
                manifest["fallbacks"][f"phonemes/{key}/{take}"] = rp_rel
                entry["files"].append({"file": rp_rel, "source": "fallback:rp (Piper cori)", "azure_failed": chk, **info, "ms": round(sf.info(dest(rp_rel)).duration * 1000), "rms": 0.13})  # (the FALLBACK clip's own length, not the failed Azure clip's)
                manifest["phonemes"].setdefault(key, []).append(rp_rel)
                continue
            sf.write(dest(rel), to_int16(clip_n), SR, subtype="PCM_16")
            entry["files"].append({"file": rel, "source": f"azure:{voice}", **info, **chk})
            manifest["phonemes"].setdefault(key, []).append(rel)
            manifest["sources"][key] = f"azure ({info['method'].split(',')[0]})"
            for n in chk["notes"]:
                report["warnings"].append(f"/{key}/ take {take}: {n}")
        report["phonemes"][key] = entry
    print(f"[sounds] {len(keys)} sounds, fallbacks: {len(report['fallbacks'])}  http so far {client.total_requests()}", flush=True)
    if args.only_sounds:
        json.dump(report, open(os.path.join(args.cache, "sounds-only-report.json"), "w"), indent=1, ensure_ascii=False)
        return 0

    # ---- 2. words -----------------------------------------------------------------------------------------------
    words = []  # (text, graphemes or None)
    for w in bank["words"]:
        if w["text"] in EXCLUDE_WORDS:
            report["words"][w["text"]] = {"status": "excluded in this accent (BATH vowel), same as the rp pack"}
            continue
        words.append((w["text"], w["graphemes"]))
    seen = {w for w, _ in words}
    for it in bank.get("safari", []):
        if it["word"] not in seen:
            words.append((it["word"], None)); seen.add(it["word"])
    list(pool.map(lambda tw: client.synth(voice, text_ssml(voice, tw[0], WORD_RATE)), words))
    lead_raw = decode(client.synth(voice, text_ssml(voice, "The word is", WORD_RATE)))
    lead = trim(lead_raw)
    gap = np.zeros(int(SR * 0.18), np.float32)

    def finish_speech(a, ms_pad=12):
        a = trim(a, pad_ms=ms_pad)
        return fade_out(fade_in(a, 6), 20, 1.0)

    word_clips = {}
    for text, gr in words:
        a = finish_speech(decode(client.synth(voice, text_ssml(voice, text, WORD_RATE))))
        word_clips[text] = (normalise(a, 0.10), "plain text")

    def asr_word(text, clip):
        a = np.concatenate([lead, gap, clip]); got = transcribe(model, a)
        toks = norm_words(got)
        return (bool(toks) and toks[-1] == text.lower()) or text.lower() in toks[-2:], got

    asr_missed = []
    if model:
        for text, gr in words:
            ok, got = asr_word(text, word_clips[text][0])
            if not ok:
                asr_missed.append((text, got))
        # second chance: a phoneme-tag variant where we know the word's sounds (not for Safari-only words)
        gmap = dict(words)
        improved = []
        for text, got in list(asr_missed):
            gr = gmap.get(text)
            if not gr:
                continue
            ph = "".join(("ˈ" if i == 0 else "") + ipa[G.GRAPHEME_KEY[g]] for i, g in enumerate(gr))
            ssml = ssml_doc(voice, f"<prosody rate='{WORD_RATE}'><phoneme alphabet='ipa' ph='{ph}'>{esc(text)}</phoneme></prosody>")
            clip = normalise(finish_speech(decode(client.synth(voice, ssml))), 0.10)
            ok, got2 = asr_word(text, clip)
            if ok:
                word_clips[text] = (clip, f"phoneme tag /{ph}/ (plain text was misheard as '{' '.join(norm_words(got)[-2:])}')")
                improved.append(text)
        asr_missed = [(t, g) for t, g in asr_missed if t not in improved]
        report["asr"]["words_variant_used"] = improved
    for text, gr in words:
        clip, how = word_clips[text]
        rel = f"{rel_root}/words/{text}.wav"
        sf.write(dest(rel), to_int16(clip), SR, subtype="PCM_16")
        manifest["words"][text] = rel
        report["words"][text] = {"ms": round(len(clip) / SR * 1000), "rms": round(rms_of(clip), 3), "peak": round(float(np.abs(clip).max()), 3),
                                 "source": how, **({"asr_miss": dict(asr_missed).get(text)} if text in dict(asr_missed) else {})}
    if model:
        report["asr"]["words"] = {"understood": len(words) - len(asr_missed), "of": len(words),
                                  "missed": [[t, g.replace("the word is", "").strip()] for t, g in asr_missed],
                                  "note": "faster-whisper base.en on 'The word is X.' (lead-in synthesised by the same voice); biased proxy, 'miss' means 'listen to this one'"}
        print(f"[words] {len(words)} words; recogniser understood {len(words) - len(asr_missed)}/{len(words)}; variants {len(report['asr']['words_variant_used'])}", flush=True)
    print(f"  http so far {client.total_requests()}", flush=True)

    # ---- 3. phrases + sound-friend lines ------------------------------------------------------------------------
    items = list(G.PHRASES.items()) + [(f"story_{gid}", t) for gid, t in bank.get("stories", {}).items()]
    list(pool.map(lambda kt: client.synth(voice, text_ssml(voice, kt[1])), items))
    phrase_miss = []
    for k, t in items:
        a = normalise(finish_speech(decode(client.synth(voice, text_ssml(voice, t)))), 0.10)
        rel = f"{rel_root}/phrases/{k}.wav"
        sf.write(dest(rel), to_int16(a), SR, subtype="PCM_16")
        manifest["phrases"][k] = rel
        rec = {"text": t, "ms": round(len(a) / SR * 1000), "rms": round(rms_of(a), 3), "peak": round(float(np.abs(a).max()), 3)}
        if model:
            exp, got = norm_words(t), norm_words(transcribe(model, a))
            hit = sum(1 for w in exp if w in got)
            rec["asr_words_found"] = f"{hit}/{len(exp)}"
            rec["asr_heard"] = " ".join(got)
            if hit < len(exp):
                phrase_miss.append(k)
        report["phrases"][k] = rec
    if model:
        report["asr"]["phrases"] = {"clips": len(items), "with_missing_words": phrase_miss,
                                    "note": "whole clip transcribed, expected words looked up in the transcript; proxy only"}
        print(f"[phrases] {len(items)} clips; {len(phrase_miss)} with a word the recogniser did not find", flush=True)

    # ---- 4. advisory consonant frame test: [lone sound] + 'in' should be heard as a real word (biased proxy) --------
    if model:
        tail = trim(decode(client.synth(voice, ipa_ssml(voice, "ɪn", "+0%", "medium"))))
        frames = {"s": "sin", "f": "fin", "b": "bin", "p": "pin", "k": "kin", "d": "din", "t": "tin", "g": "gin", "w": "win", "ch": "chin", "sh": "shin", "th": "thin"}
        ok = bad = 0
        for key, word in frames.items():
            for f in report["phonemes"][key]["files"]:
                a, _ = sf.read(dest(f["file"]), dtype="float32")
                if a.ndim > 1: a = a[:, 0]
                heard = norm_words(transcribe(model, np.concatenate([a, tail * (rms_of(a) / (rms_of(tail) or 1))])))
                f["frame_test"] = {"expected": word, "heard": " ".join(heard), "ok": word in heard}
                ok += word in heard; bad += word not in heard
        report["asr"]["consonant_frame_test"] = {"ok": ok, "of": ok + bad,
                                                 "note": "lone sound spliced in front of the voice's own 'in'; crude, biased, advisory only"}
        print(f"[frame test] {ok}/{ok + bad}", flush=True)

    # ---- 5. write manifest, audit, index ------------------------------------------------------------------------
    manifest["removed_words"] = sorted(EXCLUDE_WORDS & {w["text"] for w in bank["words"]})
    manifest["removed_safari"] = []
    if not manifest["fallbacks"]:
        manifest.pop("fallbacks")
    # pack size
    size = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
    report["requests"] = {"live_http_attempts_total_incl_experiments": client.total_requests(), "this_run": client.stats,
                          "budget": args.budget, "note": "cache hits are free; the total includes earlier experiments (counter file in the cache dir)"}
    report["problems"] = []  # hard failures were all repaired by fallback; anything still wrong would be listed here
    for it in manifest["phonemes"].values():
        assert len(it) == 3
    json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    # the pack's own copy of the audit sits beside the other accents' audits (the engine test reads scripts/audio/audit-<id>.json)
    for name in ("audit-azure.json", f"audit-{ACCENT_ID}.json"):
        json.dump(report, open(os.path.join(HERE, name), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(out, "audit.json"), "w"), indent=1, ensure_ascii=False)
    idx_path = os.path.join(AUDIO, "index.json")
    index = json.load(open(idx_path))
    index["accents"][ACCENT_ID] = {"label": LABEL, "voice": voice, "credit": manifest["credit"],
                                   "removed_words": manifest["removed_words"], "removed_safari": []}
    json.dump(index, open(idx_path, "w"), indent=1, ensure_ascii=False)
    print(f"done in {time.time() - t0:.0f}s; pack {size / 1e6:.1f} MB; http attempts total {client.total_requests()}; stats {client.stats}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (AuthStop, BudgetStop) as e:
        print("STOPPED:", e, file=sys.stderr)
        sys.exit(2)
