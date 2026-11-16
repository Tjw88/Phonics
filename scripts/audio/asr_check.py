import numpy as np, soundfile as sf
from faster_whisper import WhisperModel
_m=None
def model():
    global _m
    if _m is None: _m=WhisperModel('base.en', device='cpu', compute_type='int8')
    return _m
def to16k(a, sr):
    a=np.asarray(a,dtype=np.float32).reshape(-1)
    if sr!=16000: a=np.interp(np.linspace(0,len(a)-1,int(len(a)*16000/sr)), np.arange(len(a)), a).astype(np.float32)
    return a
def transcribe(a, sr):
    a=to16k(a,sr); pad=np.zeros(8000,dtype=np.float32); a=np.concatenate([pad,a,pad])
    segs,_=model().transcribe(a, language='en', beam_size=5, condition_on_previous_text=False, vad_filter=False)
    return ' '.join(s.text for s in segs).strip().lower().strip('.,!? ')
if __name__=='__main__':
    for w in ['sat','cup','dog','pack','pass']:
        a,sr=sf.read(f'out_en_GB-cori-medium_{w}.wav'); print('cori',w,'->',repr(transcribe(a,sr)))
    for w in ['sat','cup','dog','pack']:
        a,sr=sf.read(f'out_en_GB-northern_english_male-medium_{w}.wav'); print('north',w,'->',repr(transcribe(a,sr)))
