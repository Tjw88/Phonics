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

# phoneme key -> (espeak mnemonic, expected IPA). IPA is what UK phonics teaches for the MVP sets.
PHONEMES = {
    "s": ("s", "s"), "a": ("a", "æ"), "t": ("t", "t"), "p": ("p", "p"),
    "i": ("I", "ɪ"), "n": ("n", "n"), "m": ("m", "m"), "d": ("d", "d"),
    "g": ("g", "ɡ"), "o": ("0", "ɒ"), "k": ("k", "k"), "e": ("E", "ɛ"),
    "u": ("V", "ʌ"), "r": ("r-", "ɹ"), "h": ("h", "h"), "b": ("b", "b"),
    "f": ("f", "f"), "l": ("l", "l"),
}
GRAPHEME_IPA = {  # grapheme -> expected IPA (digraphs map to the same single sound)
    "s": "s", "a": "æ", "t": "t", "p": "p", "i": "ɪ", "n": "n", "m": "m", "d": "d", "g": "ɡ", "o": "ɒ", "c": "k",
    "k": "k", "ck": "k", "e": "ɛ", "u": "ʌ", "r": "ɹ", "h": "h", "b": "b", "f": "f", "ff": "f", "l": "l", "ll": "l",
    "ss": "s", "gg": "ɡ",
}
STOPS = {"p", "t", "k", "b", "d", "g"}
VOICELESS_STOPS = {"p", "t", "k"}
MAX_MS = {"s": 420, "f": 420, "h": 380, "m": 380, "n": 380, "l": 380, "r": 380}
VOWELS = {"a", "i", "o", "e", "u"}
FRICATIVE_LONG = {"s": "s:", "f": "f:", "h": "h:"}  # the engine's own lengthening works for these
# espeak-ng renders a lone /b d g/ as SILENCE and a lone /m n l r/ as ~40 ms, so these seven come from formant.py
FORMANT_SOUNDS = {"m", "n", "l", "r", "b", "d", "g"}
F0_VARIANTS = [200, 190, 212]

# Words whose southern-British pronunciation does not use the sound the grapheme teaches (BATH split etc).
ACCENT_CLASHES = {"pass", "mass"}  # only excluded if the engine actually clashes (mass is fine in RP; pass is /pɑːs/)

PHRASES = {
    "play": "Play", "play_again": "Play again", "play_together": "Play together", "next": "Next",
    "goodnight": "Goodnight", "hello": "Hello!", "two_minutes": "Two more minutes, then it's sleepy time.",
    "find_grownup": "Find a grown-up to play with you!", "treasure": "You found a treasure!",
    "island_asleep": "Zzz. The island is asleep.", "listen_robot": "Listen to the robot.",
    "which_rhymes": "Which one rhymes?", "tap_sounds": "Tap each sound, in order.", "blend_it": "Now blend them. Which word is it?",
    "again": "Let's tap the sounds again.", "pick_egg": "Pick an egg.", "show_grownup": "Show a grown-up",
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


def render_phoneme(key, mn, variant):
    pitch, rate = VARIANTS[variant]
    if key in FORMANT_SOUNDS:
        f0 = F0_VARIANTS[variant]
        sig = FM.sustained(key, f0=f0) if key in FM.SUSTAINED else FM.voiced_stop(key, f0=f0)
        ok, detail = FM.check(key, sig)
        clip = level(fade(sig * 20000, 10))
        vv = voicing(clip)
        return clip, {"source": "formant-synth", "self_check": detail, "self_check_ok": bool(ok), "ms": round(len(clip) / SR * 1000),
                      "voiced_fraction": round(sum(vv) / max(1, len(vv)), 2), "peak": int(np.abs(clip).max())}
    E.set_voice(pitch=pitch, rate=rate)
    raw = trim_lead(E.synth(f"[[{FRICATIVE_LONG.get(key, mn)}]]"))
    info = {"source": "espeak-ng"}
    if key in STOPS:
        # espeak adds a vowel-like release to a bare stop ("puh"). Keep only the burst (+ aspiration for voiceless).
        v = voicing(raw)
        first_voiced = next((i for i, f in enumerate(v) if f), None)
        hop = int(SR * 0.005)
        if key in VOICELESS_STOPS:
            cut = (first_voiced * hop if first_voiced is not None else int(SR * 0.12))
            cut = int(np.clip(cut, SR * 0.04, SR * 0.14))
        else:
            cut = int(SR * 0.085)  # voiced stops: burst + a short voiced release, as in clipped phonics recordings
        info["trimmed_from_ms"] = round(len(raw) / SR * 1000)
        clip = fade(raw[:cut], 12)
    else:
        cap = MAX_MS.get(key, 380 if key in VOWELS else 400)
        clip = fade(raw[: int(SR * cap / 1000)], 35)
    clip = level(clip)
    v = voicing(clip)
    return clip, {**info, "ms": round(len(clip) / SR * 1000), "voiced_fraction": round(sum(v) / max(1, len(v)), 2),
                  "peak": int(np.abs(clip).max())}


def main():
    bank = json.load(open(os.path.join(HERE, "bank.json")))
    report = {"engine": "espeak-ng (formant synthesis), voice en-GB-x-rp", "phonemes": {}, "words": {}, "phrases": {}, "problems": []}
    manifest = {"phonemes": {}, "words": {}, "phrases": {}}

    # ---- 1. isolated sounds -------------------------------------------------
    for key, (mn, ipa) in PHONEMES.items():
        E.set_voice(pitch=50, rate=125)
        if key in FORMANT_SOUNDS:
            got, ok = "n/a (formant synth)", True  # no engine transcription exists for these; see self_check in each file entry
        else:
            got = norm_ipa(E.trace(f"[[{FRICATIVE_LONG.get(key, mn)}]]"), drop_length=key not in VOWELS)
            ok = got == norm_ipa(ipa)
        entry = {"mnemonic": mn, "expected_ipa": ipa, "engine_ipa": got, "ipa_match": ok, "files": []}
        if not ok:
            report["problems"].append(f"phoneme /{key}/: engine synthesised {got!r}, expected {ipa!r}; NOT written")
            report["phonemes"][key] = entry
            continue
        for v in range(len(VARIANTS)):
            clip, m = render_phoneme(key, mn, v)
            rel = f"phonemes/{key}_{v}.wav"
            write_wav(os.path.join(OUT, rel), clip)
            entry["files"].append({"file": rel, **m})
            manifest["phonemes"].setdefault(key, []).append(rel)
            manifest.setdefault("sources", {})[key] = m.get("source", "espeak-ng")
            # mechanical checks
            if m["peak"] < 1500:
                report["problems"].append(f"/{key}/ v{v}: SILENT (peak {m['peak']}) FAILED")
            if m.get("self_check_ok") is False:
                report["problems"].append(f"/{key}/ v{v}: formant self-check failed: {m['self_check']}")
            if key in VOICELESS_STOPS and m["voiced_fraction"] > 0.25:
                report["problems"].append(f"/{key}/ v{v}: {m['voiced_fraction']:.0%} voiced after trimming, vowel tail likely")
            if key not in STOPS and m["ms"] < 150:
                report["problems"].append(f"/{key}/ v{v}: only {m['ms']} ms, too short to hear as a held sound")
            if key in STOPS and m["ms"] < 50:
                report["problems"].append(f"/{key}/ v{v}: only {m['ms']} ms, may be inaudible (needs a human listen)")
            if key in STOPS and m["ms"] > 150:
                report["problems"].append(f"/{key}/ v{v}: {m['ms']} ms is too long for a stop")
        report["phonemes"][key] = entry

    # ---- 2. words: audited against the taught grapheme->sound map ------------------
    E.set_voice(pitch=56, rate=115)
    removed = []
    for w in bank["words"]:
        text, gr = w["text"], w["graphemes"]
        expected = norm_ipa("".join(GRAPHEME_IPA[g] for g in gr))
        engine = norm_ipa(E.trace(text))
        entry = {"graphemes": gr, "expected_ipa": expected, "engine_ipa_for_text": engine}
        if text in ACCENT_CLASHES and engine != expected:
            entry["status"] = "excluded: accent clash"
            report["problems"].append(f'word "{text}": RP says {engine!r} but the taught sounds give {expected!r}; excluded (decision needed)')
            removed.append(text)
            report["words"][text] = entry
            continue
        if engine == expected:
            samples, entry["status"] = E.synth(text), "ok (rendered from text)"
        else:
            # function words ("an", "it") get weak forms; build the word from its taught phonemes instead, then re-verify
            mn_seq, vowel_done = "", False
            for g in gr:
                key = {"c": "k", "ck": "k", "ff": "f", "ll": "l", "ss": "s", "gg": "g"}.get(g, g)
                m = PHONEMES[key][0]
                if key in VOWELS and not vowel_done:
                    m, vowel_done = "'" + m, True
                mn_seq += m
            built = norm_ipa(E.trace(f"[[{mn_seq}]]"))
            if built == expected:
                samples, entry["status"] = E.synth(f"[[{mn_seq}]]"), f"ok (built from phonemes [[{mn_seq}]]; text said {engine!r})"
            else:
                entry["status"] = f"FAILED: text {engine!r}, built {built!r}, expected {expected!r}"
                report["problems"].append(f'word "{text}": {entry["status"]}')
                report["words"][text] = entry
                continue
        samples = level(fade(trim_lead(samples), 30), 3000.0)
        rel = f"words/{text}.wav"
        write_wav(os.path.join(OUT, rel), samples)
        manifest["words"][text] = rel
        entry["ms"] = round(len(samples) / SR * 1000)
        report["words"][text] = entry

    # ---- 3. fixed phrases (dynamic text such as the child's nickname cannot be pre-rendered) ----
    E.set_voice(pitch=56, rate=135)
    for k, t in PHRASES.items():
        samples = level(fade(trim_lead(E.synth(t)), 40), 3000.0)
        rel = f"phrases/{k}.wav"
        write_wav(os.path.join(OUT, rel), samples)
        manifest["phrases"][k] = rel
        report["phrases"][k] = {"text": t, "ms": round(len(samples) / SR * 1000)}

    manifest["removed_words"] = removed
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(HERE, "audit.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(OUT, "audit.json"), "w"), indent=1, ensure_ascii=False)  # served to the audition page

    n_w = len(manifest["words"])
    print(f"phoneme sets: {len(manifest['phonemes'])}/{len(PHONEMES)}  words: {n_w}/{len(bank['words'])}  phrases: {len(manifest['phrases'])}")
    print(f"removed (accent clash): {removed}")
    print("PROBLEMS:" if report["problems"] else "no mechanical problems")
    for p in report["problems"]:
        print("  -", p)
    return 1 if any("NOT written" in p or "FAILED" in p or "self-check failed" in p for p in report["problems"]) else 0


if __name__ == "__main__":
    sys.exit(main())
