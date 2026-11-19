"""Tiny Azure AI Speech REST client for the audio generator.

SECURITY: this file never reads, sets, prints or stores a subscription key. The environment's network proxy injects the key
for the Speech host, so a plain POST is enough. If you run this elsewhere, put the key in the environment of the proxy / your own
secret store, never in this file or in the repo.

Features: on-disk cache keyed by sha256(voice, output format, ssml) so reruns cost nothing; request budget counter; at most
`workers` requests in flight; retry with exponential backoff on 429/5xx; stop at once on repeated 401/403.
"""
import hashlib, json, os, threading, time
import requests

REGION_HOST = os.environ.get("AZURE_SPEECH_HOST", "uksouth.tts.speech.microsoft.com")
URL = f"https://{REGION_HOST}/cognitiveservices/v1"
UA = "soundling-audio"
DEFAULT_FMT = "riff-48khz-16bit-mono-pcm"


class AuthStop(RuntimeError):
    pass


class BudgetStop(RuntimeError):
    pass


class Client:
    def __init__(self, cache_dir, budget=1500, workers=3, min_interval=0.4, fmt=DEFAULT_FMT):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.budget = budget
        self.fmt = fmt
        self.sem = threading.Semaphore(workers)
        self.lock = threading.Lock()
        self.interval = min_interval  # seconds between request starts; grows on 429 (a free F0 resource allows 20 per minute)
        self.next_start = 0.0
        self.counter_path = os.path.join(cache_dir, "_requests.json")
        self.stats = {"http_attempts": 0, "synth_ok": 0, "cache_hits": 0, "retries_429": 0, "retries_5xx": 0, "auth_fail": 0, "billed_chars": 0}
        self.total_before = 0
        if os.path.exists(self.counter_path):
            self.total_before = json.load(open(self.counter_path)).get("http_attempts", 0)
        self.auth_fails = 0
        self.stop = False

    def key(self, voice, ssml):
        return hashlib.sha256(f"{voice}\n{self.fmt}\n{ssml}".encode("utf-8")).hexdigest()

    def path(self, voice, ssml):
        return os.path.join(self.cache_dir, self.key(voice, ssml)[:40] + ".wav")

    def total_requests(self):
        return self.total_before + self.stats["http_attempts"]

    def _save_counter(self):
        json.dump({"http_attempts": self.total_requests()}, open(self.counter_path, "w"))

    def synth(self, voice, ssml):
        """Return WAV bytes (cached). `ssml` is the full <speak> document."""
        p = self.path(voice, ssml)
        if os.path.exists(p) and os.path.getsize(p) > 44:
            with self.lock:
                self.stats["cache_hits"] += 1
            return open(p, "rb").read()
        backoff = 2.0
        for attempt in range(8):
            if self.stop:
                raise AuthStop("stopped after repeated 401/403")
            with self.sem:
                with self.lock:
                    if self.total_requests() >= self.budget:
                        raise BudgetStop(f"request budget {self.budget} reached")
                    now = time.time()
                    wait = max(0.0, self.next_start - now)
                    self.next_start = max(now, self.next_start) + self.interval
                    self.stats["http_attempts"] += 1
                    self._save_counter()
                if wait:
                    time.sleep(wait)
                try:
                    r = requests.post(URL, data=ssml.encode("utf-8"), timeout=60, headers={
                        "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": self.fmt, "User-Agent": UA})
                except requests.RequestException:
                    time.sleep(backoff); backoff = min(backoff * 2, 60)
                    continue
            if r.status_code == 200 and len(r.content) > 44:
                with open(p + ".tmp", "wb") as f:
                    f.write(r.content)
                os.replace(p + ".tmp", p)
                with self.lock:
                    self.stats["synth_ok"] += 1
                    self.stats["billed_chars"] += len(ssml) - ssml.count("<speak") * 0  # upper bound (the speak/voice tags are not billed)
                return r.content
            if r.status_code in (401, 403):
                with self.lock:
                    self.auth_fails += 1
                    self.stats["auth_fail"] += 1
                    if self.auth_fails >= 2:
                        self.stop = True
                raise AuthStop(f"HTTP {r.status_code} (repeated)" if self.stop else f"HTTP {r.status_code}")
            if r.status_code == 429 or r.status_code >= 500:
                ra = r.headers.get("Retry-After")
                delay = max(backoff, float(ra)) if ra and ra.replace(".", "", 1).isdigit() else backoff
                with self.lock:
                    key = "retries_429" if r.status_code == 429 else "retries_5xx"
                    self.stats[key] += 1
                    if r.status_code == 429:
                        self.interval = min(self.interval * 1.6, 3.2)  # slow down for everyone
                time.sleep(delay); backoff = min(backoff * 2, 60)
                continue
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:200]}")
        raise RuntimeError("gave up after retries")


def ssml_doc(voice, inner, lang="en-GB"):
    return (f"<speak version='1.0' xml:lang='{lang}' xmlns='http://www.w3.org/2001/10/synthesis'>"
            f"<voice name='{voice}'>{inner}</voice></speak>")


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
