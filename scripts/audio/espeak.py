"""Minimal ctypes wrapper around espeak-ng (bundled by the `espeakng-loader` wheel).

Gives us: synth(text) -> int16 samples, and phonemes(text) -> espeak's own phoneme transcription,
which is how generated word audio is audited programmatically (see gen_audio.py).
"""
import ctypes as C
import os
import espeakng_loader
import numpy as np

AUDIO_OUTPUT_SYNCHRONOUS = 2
EE_OK = 0
CHARS_UTF8 = 1
PHONEMES = 0x100

_lib = C.CDLL(espeakng_loader.get_library_path())
_lib.espeak_Initialize.restype = C.c_int
_lib.espeak_Initialize.argtypes = [C.c_int, C.c_int, C.c_char_p, C.c_int]
_lib.espeak_SetVoiceByName.argtypes = [C.c_char_p]
_lib.espeak_Synth.argtypes = [C.c_void_p, C.c_size_t, C.c_uint, C.c_int, C.c_uint, C.c_uint, C.c_void_p, C.c_void_p]
_lib.espeak_TextToPhonemes.restype = C.c_char_p
_lib.espeak_TextToPhonemes.argtypes = [C.POINTER(C.c_char_p), C.c_int, C.c_int]
_lib.espeak_SetParameter.argtypes = [C.c_int, C.c_int, C.c_int]

CB = C.CFUNCTYPE(C.c_int, C.POINTER(C.c_short), C.c_int, C.c_void_p)
_buf: list[np.ndarray] = []


@CB
def _on_audio(wav, n, _events):
    if wav and n > 0:
        _buf.append(np.ctypeslib.as_array(wav, shape=(n,)).copy())
    return 0


RATE = _lib.espeak_Initialize(AUDIO_OUTPUT_SYNCHRONOUS, 0, os.path.dirname(espeakng_loader.get_data_path()).encode(), 0)
_lib.espeak_SetSynthCallback(_on_audio)
PARAM_RATE, PARAM_PITCH, PARAM_RANGE = 1, 3, 4


def set_voice(name: str = "en-GB-x-rp", rate: int | None = None, pitch: int | None = None) -> None:
    if _lib.espeak_SetVoiceByName(name.encode()) != EE_OK:
        raise RuntimeError(f"voice {name} not found")
    if rate is not None:
        _lib.espeak_SetParameter(PARAM_RATE, rate, 0)
    if pitch is not None:
        _lib.espeak_SetParameter(PARAM_PITCH, pitch, 0)


def synth(text: str) -> np.ndarray:
    _buf.clear()
    data = text.encode()
    _lib.espeak_Synth(data, len(data) + 1, 0, 1, 0, CHARS_UTF8 | PHONEMES, None, None)
    _lib.espeak_Synchronize()
    return np.concatenate(_buf) if _buf else np.zeros(0, dtype=np.int16)


def phonemes(text: str) -> str:
    """espeak's phoneme mnemonics for ordinary text (bit 1 = ASCII mnemonics, not IPA)."""
    p = C.c_char_p(text.encode())
    out = _lib.espeak_TextToPhonemes(C.byref(p), CHARS_UTF8, 2)
    return (out or b"").decode()


# --- phoneme trace: ask the engine which phonemes it ACTUALLY synthesised (IPA) ---
_libc = C.CDLL(None)
_libc.fopen.restype = C.c_void_p
_libc.fopen.argtypes = [C.c_char_p, C.c_char_p]
_libc.fclose.argtypes = [C.c_void_p]
_lib.espeak_SetPhonemeTrace.argtypes = [C.c_int, C.c_void_p]


def trace(text: str) -> str:
    """IPA phonemes the engine synthesises for `text` (works for `[[...]]` phoneme input too)."""
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as t:
        path = t.name
    f = _libc.fopen(path.encode(), b"w")
    _lib.espeak_SetPhonemeTrace(2, f)
    synth(text)
    _lib.espeak_SetPhonemeTrace(0, None)
    _libc.fclose(f)
    out = open(path, encoding="utf-8").read()
    os.unlink(path)
    return out.strip()
