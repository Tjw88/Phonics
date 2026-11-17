#!/usr/bin/env python3
"""Generate placeholder phonics audio with espeak-ng (en-GB-x-rp) and AUDIT it.

Run:  python3 -m pip install espeakng-loader numpy && npx tsx scripts/export-bank.ts && python3 scripts/audio/gen_audio.py

What this is and is not
-----------------------
espeak-ng is a formant synthesiser: intelligible, robotic. It is a stand-in for the recordings the spec calls for.
Nothing here replaces a phonics specialist listening to every file. The audit below only catches *mechanical*
errors: wrong phoneme synthesised, trailing vowel on a stop ("puh"), clipped/too-long clips, accent clashes.
"""
import json, math, os, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import espeak as E  # noqa: E402
import formant as FM  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "audio")
SR = E.RATE
VARIANTS = [(50, 125), (54, 125), (46, 125)]  # (pitch, rate) - small variation so repeats do not sound identical

# phoneme key -> espeak mnemonic. The SAME mnemonic is realised differently by each accent's voice file
# (e.g. [[V]] is /ʌ/ in RP but /ʊ/ in the Lancashire voice), so one table serves every accent.
MNEMONIC = {
    "s": "s", "a": "a", "t": "t", "p": "p", "i": "I", "n": "n", "m": "m", "d": "d", "g": "g", "o": "0", "k": "k",
    "e": "E", "u": "V", "r": "r-", "h": "h", "b": "b", "f": "f", "l": "l",
    "sh": "S", "ch": "tS", "th": "T", "ng": "N",
    "ai": "eI", "ee": "i:", "oa": "oU", "oo": "u:",
}
# What each accent SHOULD teach, as IPA. Anything not listed here is the RP value below.
BASE_IPA = {
    "s": "s", "a": "æ", "t": "t", "p": "p", "i": "ɪ", "n": "n", "m": "m", "d": "d", "g": "ɡ", "o": "ɒ", "k": "k",
    "e": "ɛ", "u": "ʌ", "r": "ɹ", "h": "h", "b": "b", "f": "f", "l": "l",
    "sh": "ʃ", "ch": "tʃ", "th": "θ", "ng": "ŋ",
    "ai": "eɪ", "ee": "iː", "oa": "əʊ", "oo": "uː",
}
ACCENTS = {
    "rp": {"label": "Southern British (RP)", "voice": "en-GB-x-rp", "ipa": {}},
    # FOOT-STRUT merger (cup = /kʊp/) and short /a/ in pass/bath: the two features that change what phonics teaches.
    # The engine's only northern voice is Lancashire; there is no Yorkshire voice.
    # (West Midlands, en-GB-x-gbcwmd, was rejected outright: it drops /h/ ("hill" -> /ɪl/), which would teach /h/ wrongly.)
    "north": {"label": "Northern English", "voice": "en-GB-x-gbclan", "ipa": {"a": "a", "u": "ʊ"}},
    # Scots /r/ is a tap: the engine's own isolated /r/ is a ~40 ms tap, so it is used instead of the formant approximant.
    "scotland": {"label": "Scottish", "voice": "en-GB-scotland", "ipa": {"a": "a", "r": "r"}, "espeak_r": True,
                 "enabled": False,
                 "why_disabled": "espeak-ng renders a lone Scots /r/ as silence, and its isolated /i/ comes out as /e/ although the same "
                                 "voice says \"kit\" with /ɪ/; without a human ear that conflict cannot be resolved. Run with --all to retry."},
}
GRAPHEME_KEY = {  # grapheme -> phoneme key (digraphs share the single sound)
    "s": "s", "a": "a", "t": "t", "p": "p", "i": "i", "n": "n", "m": "m", "d": "d", "g": "g", "o": "o", "c": "k",
    "k": "k", "ck": "k", "e": "e", "u": "u", "r": "r", "h": "h", "b": "b", "f": "f", "ff": "f", "l": "l", "ll": "l",
    "ss": "s", "gg": "g", "sh": "sh", "ch": "ch", "th": "th", "ng": "ng",
    "ai": "ai", "ee": "ee", "oa": "oa", "oo": "oo",
}
STOPS = {"p", "t", "k", "b", "d", "g"}
VOICELESS_STOPS = {"p", "t", "k"}
MAX_MS = {"s": 420, "f": 420, "h": 380, "m": 380, "n": 380, "l": 380, "r": 380}
VOWELS = {"a", "i", "o", "e", "u", "ai", "ee", "oa", "oo"}
FRICATIVE_LONG = {"s": "s:", "f": "f:", "h": "h:"}  # the engine's own lengthening works for these
# espeak-ng renders a lone /b d g/ as SILENCE and a lone /m n l r/ as ~40 ms, so these seven come from formant.py
WEAK_FORM_WORDS = {"an", "in", "it", "at", "am", "ad", "on", "up", "us", "if", "as", "is"}  # engine may reduce these
FORMANT_SOUNDS = {"m", "n", "l", "r", "b", "d", "g"}  # (Scottish /r/ is the exception: see ACCENTS)
F0_VARIANTS = [200, 190, 212]


PHRASES = {
    "play": "Play", "play_again": "Play again", "play_together": "Play together", "next": "Next",
    "goodnight": "Goodnight", "hello": "Hello!", "two_minutes": "Two more minutes, then it's sleepy time.",
    "find_grownup": "Find a grown-up to play with you!", "treasure": "You found a treasure!",
    "island_asleep": "Zzz. The island is asleep.", "listen_robot": "Listen to the robot.",
    "which_rhymes": "Which one rhymes?", "tap_sounds": "Tap each sound, in order.", "blend_it": "Now blend them. Which word is it?",
    "again": "Let's tap the sounds again.", "hungry_for": "I'm hungry for", "find_the": "Find the", "your_turn": "Your turn!", "copy_me": "Copy me!", "which_letter": "Which letter says", "well_done": "Well done!",
    "slide_blend": "Slide your finger across to blend.", "hello_friend": "Hello, friend!",
    "drum_prompt": "Beat the drum once for each sound.", "safari_prompt": "Find things that start with the sound.",
    "kitchen_prompt": "Build the word.", "trace_prompt": "Trace the letter. Start at the green dot.", "pick_egg": "Pick an egg.", "pick_friend": "Pick a friend.", "show_grownup": "Show a grown-up",
}


def norm_ipa(s: str, drop_length: bool = False) -> str:
    if drop_length:
        s = s.replace("ː", "")
        s = "".join(ch for i, ch in enumerate(s) if i == 0 or ch != s[i - 1])  # "hh" from a lengthened phoneme -> "h"
    return s.replace("ˈ", "").replace("ˌ", "").replace("ɫ", "l").replace("ɡ", "ɡ").replace("g", "ɡ").replace(" ", "")


def rms(x):
    return float(np.sqrt(np.mean(np.square(x.astype(np.float64))))) if len(x) else 0.0


def voicing(x, hop_ms=5, win_ms=25):
    """Per-hop flag: periodic (voiced) via normalised autocorrelation in the 80-400 Hz pitch range."""
    hop, win = int(SR * hop_ms / 1000), int(SR * win_ms / 1000)
    lo, hi = int(SR / 400), int(SR / 80)
    flags = []
    xf = x.astype(np.float64)
    for i in range(0, max(1, len(xf) - win), hop):
        f = xf[i : i + win]
        f = f - f.mean()
        e = float((f * f).sum())
        if e < 1e3 * len(f) or len(f) < hi + 2:
            flags.append(False)
            continue
        ac = np.correlate(f, f, "full")[len(f) - 1 :]
        flags.append(bool(ac[lo:hi].max() / e > 0.5))
    return flags


def trim_lead(x, thresh=0.04):
    peak = float(np.abs(x).max()) or 1.0
    idx = np.nonzero(np.abs(x) > thresh * peak)[0]
    return x[max(0, idx[0] - int(SR * 0.004)) :] if len(idx) else x


def fade(x, ms):
    n = min(len(x), int(SR * ms / 1000))
    if n:
        x = x.astype(np.float64).copy()
        x[-n:] *= np.linspace(1, 0, n)
    return x


def level(x, target_rms=2600.0, ceiling=29000.0):
    x = x.astype(np.float64)
    g = target_rms / (rms(x) or 1.0)
    g = min(g, ceiling / (np.abs(x).max() or 1.0))
    return np.clip(x * g, -32768, 32767).astype(np.int16)


def write_wav(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.astype(np.int16).tobytes())


def render_phoneme(key, mn, variant, voice, use_formant):
    pitch, rate = VARIANTS[variant]
    if use_formant:
        f0 = F0_VARIANTS[variant]
        sig = FM.sustained(key, f0=f0) if key in FM.SUSTAINED else FM.voiced_stop(key, f0=f0)
        ok, detail = FM.check(key, sig)
        clip = level(fade(sig * 20000, 10))
        vv = voicing(clip)
        return clip, {"source": "formant-synth", "self_check": detail, "self_check_ok": bool(ok), "ms": round(len(clip) / SR * 1000),
                      "voiced_fraction": round(sum(vv) / max(1, len(vv)), 2), "peak": int(np.abs(clip).max())}
    E.set_voice(voice, pitch=pitch, rate=rate)
    raw = trim_lead(E.synth(f"[[{FRICATIVE_LONG.get(key, mn)}]]"))
    info = {"source": "espeak-ng"}
    if key in STOPS:
        # keep only the burst (+ aspiration for voiceless stops)
        v = voicing(raw)
        first_voiced = next((i for i, f in enumerate(v) if f), None)
        hop = int(SR * 0.005)
        if key in VOICELESS_STOPS:
            cut = (first_voiced * hop if first_voiced is not None else int(SR * 0.12))
            cut = int(np.clip(cut, SR * 0.04, SR * 0.14))
        else:
            cut = int(SR * 0.085)
        clip = fade(raw[:cut], 12)
    else:
        cap = MAX_MS.get(key, 380 if key in VOWELS else 400)
        clip = fade(raw[: int(SR * cap / 1000)], 35)
    clip = level(clip)
    v = voicing(clip)
    return clip, {**info, "ms": round(len(clip) / SR * 1000), "voiced_fraction": round(sum(v) / max(1, len(v)), 2),
                  "peak": int(np.abs(clip).max())}


def rel_url(*parts):
    return "/".join(parts)


def generate(accent, cfg, bank, shared):
    """Generate one accent pack under public/audio/<accent>/. Formant sounds (accent-independent) live in public/audio/shared/."""
    voice = cfg["voice"]
    ipa = {**BASE_IPA, **cfg["ipa"]}
    out = os.path.join(OUT, accent)
    os.makedirs(out, exist_ok=True)
    report = {"accent": accent, "label": cfg["label"], "voice": voice, "engine": "espeak-ng (formant synthesis)",
              "expected_ipa": ipa, "phonemes": {}, "words": {}, "phrases": {}, "problems": []}
    manifest = {"accent": accent, "label": cfg["label"], "voice": voice, "phonemes": {}, "words": {}, "phrases": {}, "sources": {}}

    # ---- 1. isolated sounds ---------------------------------------------------
    for key, mn in MNEMONIC.items():
        use_formant = key in FORMANT_SOUNDS and not (key == "r" and cfg.get("espeak_r"))
        E.set_voice(voice, pitch=50, rate=125)
        trace_mn = "r" if (key == "r" and cfg.get("espeak_r")) else FRICATIVE_LONG.get(key, mn)
        if use_formant:
            got, ok = "n/a (formant synth)", True  # no engine transcription exists; see self_check in each file entry
        else:
            got = norm_ipa(E.trace(f"[[{trace_mn}]]"), drop_length=key not in VOWELS)
            ok = got == norm_ipa(ipa[key])
        entry = {"mnemonic": trace_mn, "expected_ipa": ipa[key], "engine_ipa": got, "ipa_match": ok, "files": []}
        if not ok:
            report["problems"].append(f"[{accent}] /{key}/: engine synthesised {got!r}, expected {ipa[key]!r}; NOT written")
            report["phonemes"][key] = entry
            continue
        for v in range(len(VARIANTS)):
            if use_formant and len(shared.get(key, [])) > v:  # accent-independent: generated once, reused
                rel, m = shared[key][v]
            else:
                clip, m = render_phoneme(key, "r" if trace_mn == "r" else mn, v, voice, use_formant)
                rel = rel_url("shared" if use_formant else accent, "phonemes", f"{key}_{v}.wav")
                write_wav(os.path.join(OUT, rel), clip)
                if use_formant:
                    shared.setdefault(key, []).append((rel, m))
            entry["files"].append({"file": rel, **m})
            manifest["phonemes"].setdefault(key, []).append(rel)
            manifest["sources"][key] = m.get("source", "espeak-ng")
            tap_ok = key == "r" and cfg.get("espeak_r")  # a tapped /r/ is naturally ~40 ms
            if m["peak"] < 1500:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: SILENT (peak {m['peak']}) FAILED")
            if m.get("self_check_ok") is False:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: formant self-check failed: {m['self_check']}")
            if key in VOICELESS_STOPS and m["voiced_fraction"] > 0.25:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: {m['voiced_fraction']:.0%} voiced after trimming, vowel tail likely")
            if key not in STOPS and m["ms"] < 150 and not tap_ok:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: only {m['ms']} ms, too short to hear as a held sound")
            if key in STOPS and m["ms"] < 50:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: only {m['ms']} ms, may be inaudible (needs a human listen)")
            if key in STOPS and m["ms"] > 150:
                report["problems"].append(f"[{accent}] /{key}/ v{v}: {m['ms']} ms is too long for a stop")
        report["phonemes"][key] = entry

    # ---- 2. words: the engine must say each word with the sounds THIS accent teaches ----
    E.set_voice(voice, pitch=56, rate=115)
    removed = []
    for w in bank["words"]:
        text, gr = w["text"], w["graphemes"]
        expected = norm_ipa("".join(ipa[GRAPHEME_KEY[g]] for g in gr))
        engine = norm_ipa(E.trace(text))
        entry = {"graphemes": gr, "expected_ipa": expected, "engine_ipa_for_text": engine}
        if engine == expected:
            samples, entry["status"] = E.synth(text), "ok (rendered from text)"
        else:
            # function words ("an", "it") can get weak forms: try building from the taught phonemes, then re-verify
            mn_seq, vowel_done = "", False
            for g in gr:
                key = GRAPHEME_KEY[g]
                m = MNEMONIC[key]
                if key in VOWELS and not vowel_done:
                    m, vowel_done = "'" + m, True
                mn_seq += m
            built = norm_ipa(E.trace(f"[[{mn_seq}]]"))
            # only accept a built word if it matches AND the engine's own reading of the text is a mere weak form,
            # never a genuine accent difference (e.g. RP /pɑːs/ for "pass")
            weak_form = text in WEAK_FORM_WORDS
            if built == expected and weak_form:
                samples, entry["status"] = E.synth(f"[[{mn_seq}]]"), f"ok (built from phonemes [[{mn_seq}]]; text said {engine!r})"
            else:
                entry["status"] = f"excluded in this accent: engine says {engine!r}, taught sounds give {expected!r}"
                removed.append(text)
                report["words"][text] = entry
                continue
        samples = level(fade(trim_lead(samples), 30), 3000.0)
        rel = rel_url(accent, "words", f"{text}.wav")
        write_wav(os.path.join(OUT, rel), samples)
        manifest["words"][text] = rel
        entry["ms"] = round(len(samples) / SR * 1000)
        report["words"][text] = entry

    # ---- 2b. Sound Safari words: audited on their FIRST sound in this accent ----------------------
    E.set_voice(voice, pitch=56, rate=115)
    removed_safari = []
    report["safari"] = {}
    for it in bank.get("safari", []):
        word, p = it["word"], it["p"]
        got = norm_ipa(E.trace(word))
        exp = norm_ipa(ipa[p])
        if not got.startswith(exp):
            report["safari"][word] = f"excluded: starts with {got[:3]!r}, expected {exp!r}"
            removed_safari.append(word)
            continue
        report["safari"][word] = "ok"
        if word not in manifest["words"]:
            samples = level(fade(trim_lead(E.synth(word)), 30), 3000.0)
            rel = rel_url(accent, "words", f"{word}.wav")
            write_wav(os.path.join(OUT, rel), samples)
            manifest["words"][word] = rel
    manifest["removed_safari"] = sorted(removed_safari)

    # ---- 3. fixed phrases ----------------------------------------------------------
    E.set_voice(voice, pitch=56, rate=135)
    for k, t in PHRASES.items():
        samples = level(fade(trim_lead(E.synth(t)), 40), 3000.0)
        rel = rel_url(accent, "phrases", f"{k}.wav")
        write_wav(os.path.join(OUT, rel), samples)
        manifest["phrases"][k] = rel
        report["phrases"][k] = {"text": t, "ms": round(len(samples) / SR * 1000)}

    manifest["removed_words"] = sorted(removed)
    report["removed_words"] = sorted(removed)
    json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(out, "audit.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(HERE, f"audit-{accent}.json"), "w"), indent=1, ensure_ascii=False)
    return manifest, report


def main():
    import shutil
    bank = json.load(open(os.path.join(HERE, "bank.json")))
    shutil.rmtree(OUT, ignore_errors=True)
    shared = {}
    bad = 0
    index = {"accents": {}}
    for accent, cfg in ACCENTS.items():
        if not cfg.get("enabled", True) and "--all" not in sys.argv:
            print(f"[{accent:8s}] {cfg['label']}: DISABLED - {cfg['why_disabled']}")
            continue
        manifest, report = generate(accent, cfg, bank, shared)
        index["accents"][accent] = {"label": cfg["label"], "voice": cfg["voice"], "removed_words": manifest["removed_words"], "removed_safari": manifest["removed_safari"]}
        print(f"[{accent:8s}] {cfg['label']}: sounds {len(manifest['phonemes'])}/{len(MNEMONIC)}  words {len(manifest['words'])}/{len(bank['words'])}"
              f"  phrases {len(manifest['phrases'])}  excluded words: {manifest['removed_words']}  excluded safari: {manifest['removed_safari']}")
        for p in report["problems"]:
            print("   -", p)
        bad += sum(1 for p in report["problems"] if "NOT written" in p or "FAILED" in p or "self-check failed" in p)
    json.dump(index, open(os.path.join(OUT, "index.json"), "w"), indent=1, ensure_ascii=False)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
