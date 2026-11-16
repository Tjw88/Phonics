"""Tiny Klatt-style source-filter synthesiser for the sounds espeak-ng cannot render in isolation.

espeak-ng renders a lone voiced stop (/b/ /d/ /g/) as SILENCE and a lone nasal/liquid as ~40 ms. So those seven
sounds are built here: a glottal pulse train through formant resonators (and a nasal anti-resonance), plus
band-limited noise bursts for the stops. Formant targets are textbook values for British English; they are
checked numerically (spectral peaks) in `check()`. Nothing here has been listened to: it needs a human ear.
"""
import numpy as np

SR = 22050


def resonator(x, f, bw):
    """2-pole digital resonator (Klatt 1980), unity gain at DC."""
    t = 1.0 / SR
    c = -np.exp(-2 * np.pi * bw * t)
    b = 2 * np.exp(-np.pi * bw * t) * np.cos(2 * np.pi * f * t)
    a = 1 - b - c
    y = np.zeros(len(x))
    y1 = y2 = 0.0
    for i, v in enumerate(x):
        y0 = a * v + b * y1 + c * y2
        y[i] = y0
        y2, y1 = y1, y0
    return y


def antiresonator(x, f, bw):
    """FIR zero pair at f (Klatt anti-resonator) for the nasal side-branch."""
    t = 1.0 / SR
    c = -np.exp(-2 * np.pi * bw * t)
    b = 2 * np.exp(-np.pi * bw * t) * np.cos(2 * np.pi * f * t)
    a = 1 - b - c
    A, B, C = 1.0 / a, -b / a, -c / a
    y = np.zeros(len(x))
    for i in range(len(x)):
        y[i] = A * x[i] + (B * x[i - 1] if i >= 1 else 0) + (C * x[i - 2] if i >= 2 else 0)
    return y


def glottal(n, f0, seed=0):
    """Pulse train with a gentle spectral tilt and light jitter (so it is not a perfect buzz)."""
    rng = np.random.default_rng(seed)
    x = np.zeros(n)
    pos = 0.0
    while pos < n:
        x[int(pos)] = 1.0
        pos += SR / f0 * (1 + rng.normal(0, 0.004))
    # tilt: two cascaded one-pole low-passes (~ -12 dB/oct above ~400 Hz)
    for fc in (400.0, 400.0):
        a = np.exp(-2 * np.pi * fc / SR)
        y = np.zeros(n)
        for i in range(n):
            y[i] = (1 - a) * x[i] + a * (y[i - 1] if i else 0)
        x = y
    return x


def env(n, attack_ms, release_ms):
    e = np.ones(n)
    a, r = int(SR * attack_ms / 1000), int(SR * release_ms / 1000)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return e


def cascade(src, formants):
    y = src
    for f, bw in formants:
        y = resonator(y, f, bw)
    return y


def noise_band(n, lo, hi, seed=1):
    """Band-limited noise via FFT masking."""
    rng = np.random.default_rng(seed)
    spec = np.fft.rfft(rng.normal(size=n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(spec, n)


# (formants[(F, BW)...], nasal antiresonance (F, BW) or None)  - textbook-ish values for British English
SUSTAINED = {
    "m": ([(270, 50), (1100, 250), (2200, 250), (3000, 300)], (1000, 150)),
    "n": ([(270, 50), (1500, 250), (2400, 250), (3200, 300)], (1900, 150)),
    "l": ([(360, 70), (1300, 120), (2700, 200), (3400, 250)], None),
    "r": ([(400, 80), (1200, 120), (1600, 120), (3300, 250)], None),
}
F1_TARGET = {"m": 270, "n": 270, "l": 360, "r": 400}


def sustained(key, ms=380, f0=200):
    n = int(SR * ms / 1000)
    formants, anti = SUSTAINED[key]
    y = cascade(glottal(n, f0), formants)
    if anti:
        y = antiresonator(y, *anti)
    y = y - np.convolve(y, np.ones(int(SR / 60)) / int(SR / 60), mode="same")  # remove DC / sub-60 Hz rumble
    y = y * env(n, 25, 45)
    return y / (np.abs(y).max() or 1)


# stops: (burst noise band Hz, burst ms, release formants for the short voiced release)
STOP_MODEL = {
    "b": ((200, 1500), 8, [(480, 90), (1100, 120), (2400, 200)]),
    "d": ((3200, 6500), 8, [(480, 90), (1700, 120), (2600, 200)]),
    "g": ((1500, 3200), 10, [(480, 90), (1500, 120), (2300, 200)]),
}


def voiced_stop(key, f0=200):
    (lo, hi), burst_ms, rel = STOP_MODEL[key]
    bar = int(SR * 0.030)  # voice bar before the release
    nb = int(SR * burst_ms / 1000)
    nr = int(SR * 0.045)  # short voiced release (vowel-ish), kept very brief on purpose
    bar_sig = cascade(glottal(bar, f0, seed=3), [(250, 60), (2000, 400)]) * 0.35 * np.linspace(0.3, 1, bar)
    burst = noise_band(nb, lo, hi) * np.hanning(nb)
    burst = burst / (np.abs(burst).max() or 1) * 0.9
    rel_sig = cascade(glottal(nr, f0, seed=4), rel) * env(nr, 4, 25)
    rel_sig = rel_sig / (np.abs(rel_sig).max() or 1) * 0.6
    y = np.concatenate([bar_sig / (np.abs(bar_sig).max() or 1) * 0.25, burst, rel_sig])
    return y / (np.abs(y).max() or 1)


def lpc_formants(x, order=14, fmax=4000):
    """Formant estimates from an LPC spectral envelope (autocorrelation method + Levinson-Durbin)."""
    x = np.asarray(x, dtype=np.float64)
    x = x[int(len(x) * 0.25) : int(len(x) * 0.8)]
    x = np.append(x[0], x[1:] - 0.95 * x[:-1]) * np.hamming(len(x))  # pre-emphasis keeps F1 visible on low-pass sounds
    r = np.correlate(x, x, "full")[len(x) - 1 : len(x) + order]
    a = np.zeros(order + 1)
    a[0], e = 1.0, r[0]
    for i in range(1, order + 1):
        k = -(r[i] + np.dot(a[1:i], r[i - 1 : 0 : -1])) / e
        a[1 : i + 1] = np.append(a[1:i] + k * a[i - 1 : 0 : -1], k)
        e *= 1 - k * k
    roots = [z for z in np.roots(a) if z.imag > 0]
    out = []
    for z in roots:
        f = np.angle(z) * SR / (2 * np.pi)
        bw = -np.log(abs(z)) * SR / np.pi
        if 90 < f < fmax and bw < 500:
            out.append(float(f))
    return sorted(out)


def check(key, x):
    """Numeric self-check. Returns (ok, detail). It cannot tell you it SOUNDS right."""
    if key in F1_TARGET:
        fm = lpc_formants(x)
        f1 = fm[0] if fm else 0
        tgt = F1_TARGET[key]
        ok = abs(f1 - tgt) / tgt < 0.2
        return ok, f"LPC F1 {f1:.0f} Hz vs target {tgt} Hz (formants {[round(f) for f in fm[:4]]})"
    # stops: burst energy must sit in the expected band
    (lo, hi), *_ = STOP_MODEL[key]
    spec = np.abs(np.fft.rfft(x)) ** 2
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    band = spec[(fr >= lo) & (fr <= hi)].sum() / (spec.sum() or 1)
    return band > 0.15, f"{band:.0%} of energy in the {lo}-{hi} Hz burst band"
