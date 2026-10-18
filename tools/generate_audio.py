"""Élethű (neurális) magyar hangfájlok előállítása az app összes kimondott szövegéhez.

Használat:
    pip install edge-tts
    python tools/generate_audio.py                      # alapértelmezett: hu-HU-NoemiNeural (női hang)
    python tools/generate_audio.py --voice hu-HU-TamasNeural   # férfi hang
    python tools/generate_audio.py --rate -5%           # kicsit lassabb beszéd

A szkript a js/data.js-ből gyűjti ki a szövegeket, az audio/ mappába menti az mp3-akat,
és megírja az audio/manifest.js-t (szöveg → fájl). A már meglévő fájlokat nem generálja újra.
"""
import argparse
import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "js" / "data.js"
OUT = ROOT / "audio"


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def load_data() -> dict:
    src = DATA.read_text(encoding="utf-8")
    m = re.search(r"^window\.GYT_DATA\s*=", src, re.M)
    body = src[m.end():].strip()
    body = body[: body.rindex("}") + 1]
    return json.loads(body)


def collect(data: dict) -> list:
    texts = []

    def add(t):
        if isinstance(t, str) and norm(t):
            texts.append(norm(t))
        elif isinstance(t, list):
            for x in t:
                add(x)

    for v in data["phrases"].values():
        add(v)
    for ex in data["exercises"]:
        add(ex.get("sayName"))
        add(ex.get("setup"))
        add(ex.get("steps"))
        add(ex.get("sideText"))
        for key in ("seq", "prep", "post"):
            for it in ex.get(key, []) or []:
                add(it.get("cue"))
    seen, out = set(), []
    for t in texts:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


async def synth(text: str, path: Path, voice: str, rate: str, sem: asyncio.Semaphore) -> bool:
    import edge_tts

    async with sem:
        for attempt in range(4):
            try:
                tmp = path.with_suffix(".part")
                await edge_tts.Communicate(text, voice, rate=rate).save(str(tmp))
                tmp.replace(path)
                return True
            except Exception as e:  # hálózati hiba esetén újrapróbálkozás
                if attempt == 3:
                    print(f"  HIBA: {text[:50]}… ({e})", file=sys.stderr)
                    return False
                await asyncio.sleep(1.5 * (attempt + 1))
    return False


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="hu-HU-NoemiNeural")
    ap.add_argument("--rate", default="-4%")
    ap.add_argument("--concurrency", type=int, default=4)
    args = ap.parse_args()

    try:
        import edge_tts  # noqa: F401
    except ImportError:
        sys.exit("Az edge-tts csomag hiányzik. Telepítés: pip install edge-tts")

    texts = collect(load_data())
    OUT.mkdir(exist_ok=True)
    files, jobs = {}, []
    sem = asyncio.Semaphore(args.concurrency)
    for t in texts:
        h = hashlib.sha1(f"{args.voice}|{args.rate}|{t}".encode("utf-8")).hexdigest()[:16]
        name = f"{h}.mp3"
        files[t] = name
        p = OUT / name
        if not p.exists() or p.stat().st_size == 0:
            jobs.append((t, p))

    print(f"{len(texts)} szöveg, ebből {len(jobs)} új hangfájl készül ({args.voice}, tempó {args.rate})…")
    done = 0
    ok_all = True

    async def run(t, p):
        nonlocal done, ok_all
        ok = await synth(t, p, args.voice, args.rate, sem)
        ok_all &= ok
        done += 1
        if done % 25 == 0 or done == len(jobs):
            print(f"  {done}/{len(jobs)}")

    await asyncio.gather(*(run(t, p) for t, p in jobs))

    present = {t: f for t, f in files.items() if (OUT / f).exists()}
    manifest = {"voice": args.voice.replace("Neural", " (neurális)").replace("hu-HU-", ""), "files": present}
    (OUT / "manifest.js").write_text(
        "/* Automatikusan generálva: tools/generate_audio.py */\nwindow.GYT_AUDIO = "
        + json.dumps(manifest, ensure_ascii=False, indent=0)
        + ";\n",
        encoding="utf-8",
    )
    # régi, már nem használt fájlok törlése
    used = set(present.values())
    removed = 0
    for f in OUT.glob("*.mp3"):
        if f.name not in used:
            f.unlink()
            removed += 1
    print(f"Kész: {len(present)}/{len(texts)} hangfájl a manifestben" + (f", {removed} régi fájl törölve." if removed else "."))
    if not ok_all:
        print("Néhány fájl nem készült el – futtasd újra a szkriptet, a hiányzókat pótolja.")


if __name__ == "__main__":
    asyncio.run(main())
