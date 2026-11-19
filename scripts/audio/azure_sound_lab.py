#!/usr/bin/env python3
"""Sound lab: SHORT, natural versions of isolated letter sounds from Azure, to A/B against the current (long) azure-rp pack.

The first Azure pack was built to a spec I wrote: sounds 380-900 ms, lone phonemes at rate x-slow, loops and granular lengthening.
The owner heard them as 'trilling, elongated, drawn out'. This lab makes the opposite: normal speaking rate, short caps.
Variants per sound: cur (the shipped pack), nat (lone IPA phoneme, normal rate, capped), car (cut from a syllable at normal rate), short.
Writes public/sound-lab/*.mp3 + public/sound-lab/index.json. No key anywhere: the cloud proxy adds it (see azure_client.py).
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import gen_azure as GA
from azure_client import Client

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "sound-lab")
SR = GA.SR
VOICE = os.environ.get("LAB_VOICE", "en-GB-SoniaNeural")
CACHE = os.environ.get("AZURE_TTS_CACHE", os.path.join(os.path.expanduser("~"), ".cache", "soundling-azure-tts"))
# sound -> (ipa, class, carrier syllable for the 'car' variant: consonants CV, vowels bVd)
SOUNDS = {
    "s": ("s", "fric", "sɑ"), "f": ("f", "fric", "fɑ"), "sh": ("ʃ", "fric", "ʃɑ"), "th": ("θ", "fric", "θɑ"),
    "m": ("m", "sonor", "mɑ"), "n": ("n", "sonor", "nɑ"), "l": ("l", "sonor", "lɑ"), "r": ("ɹ", "sonor", "ɹɑ"),
    "p": ("p", "stop", "pɑ"), "t": ("t", "stop", "tɑ"), "k": ("k", "stop", "kɑ"), "d": ("d", "stop", "dɑ"), "g": ("ɡ", "stop", "ɡɑ"),
    "ch": ("tʃ", "affr", "tʃɑ"),
    "a": ("æ", "vowel", "bæd"), "e": ("ɛ", "vowel", "bɛd"), "i": ("ɪ", "vowel", "bɪd"), "o": ("ɒ", "vowel", "bɒd"), "u": ("ʌ", "vowel", "bʌd"),
    "ee": ("iː", "diph", "biːd"), "ai": ("eɪ", "diph", "beɪd"),
}
CAP = {  # ms: nat / short
    "fric": (320, 200), "sonor": (300, 190), "stop": (170, 110), "affr": (200, 130), "vowel": (280, 180), "diph": (380, 260),
}


def synth(client, ph, rate="medium", pitch="+0%"):
    return GA.decode(client.synth(VOICE, GA.ipa_ssml(VOICE, ph, pitch, rate)))


def finish(a, kind, ms, fin=6, fout=40):
    a = a[: int(SR * ms / 1000)]
    a = GA.fade_out(GA.fade_in(a, fin), min(fout, max(10, int(len(a) / SR * 1000 / 3))))
    return GA.normalise(a, 0.12)


def nat(client, key, cap_idx):
    ph, kind, _ = SOUNDS[key]
    raw = synth(client, ph)
    a = GA._strongest(raw)
    if kind in ("sonor", "fric", "vowel", "diph"):
        # skip the onset ramp: take the steadiest part (start 20 ms in)
        a = a[int(SR * 0.02):] if len(a) > int(SR * 0.3) else a
    return finish(a, kind, CAP[kind][cap_idx], fin=6 if kind in ("stop", "affr") else 12, fout=30 if kind in ("stop", "affr") else 45)


def car(client, key):
    ph, kind, carrier = SOUNDS[key]
    raw = synth(client, carrier)
    a = GA.trim(raw, merge_ms=1000, pad_ms=0)
    if kind in ("vowel", "diph"):
        db, w = GA.frames_db(a, 10)
        peak = db.max()
        idx = np.where(db > peak - 14)[0]
        mid = int(np.median(idx)) if len(idx) else len(db) // 2
        want = int(CAP[kind][0] / 1000 * SR)
        start = max(0, mid * w - want // 2)
        a = a[start: start + want]
        return finish(a, kind, CAP[kind][0], fin=25, fout=60)
    on = GA.vowel_onset(a)
    part = a[: max(int(SR * 0.04), on - int(SR * 0.006))]
    if kind in ("sonor",):
        part = a[int(SR * 0.0): max(int(SR * 0.12), on)]
    return finish(part, kind, CAP[kind][0], fin=4 if kind in ("stop", "affr") else 12, fout=20 if kind in ("stop", "affr") else 40)


def mp3(a, path):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, a.astype(np.float32), SR, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f.name, "-b:a", "80k", "-ac", "1", path], check=True)
        os.unlink(f.name)


def main():
    os.makedirs(OUT, exist_ok=True)
    client = Client(CACHE, budget=200, workers=3)
    index = {}
    for key in SOUNDS:
        kind = SOUNDS[key][1]
        row = {}
        cur_path = os.path.join(ROOT, "public", "audio", "azure-rp", "phonemes", f"{key}_0.wav")
        if os.path.exists(cur_path):
            d, sr = sf.read(cur_path); row["cur"] = (d.astype(np.float32), None)
        try:
            row["nat"] = (nat(client, key, 0), None)
            row["car"] = (car(client, key), None)
            row["short"] = (nat(client, key, 1), None)
        except Exception as e:  # report, keep going
            print("FAILED", key, e, file=sys.stderr)
        index[key] = {}
        for v, (a, _) in row.items():
            name = f"{key}_{v}.mp3"
            mp3(a, os.path.join(OUT, name)); index[key][v] = {"file": name, "ms": round(len(a) / SR * 1000)}
        print(key, {v: i["ms"] for v, i in index[key].items()}, flush=True)
    json.dump({"voice": VOICE, "sounds": index, "labels": {k: v[0] for k, v in SOUNDS.items()}}, open(os.path.join(OUT, "index.json"), "w"), indent=1, ensure_ascii=False)
    print("requests this run", client.stats)


if __name__ == "__main__":
    main()
