# Gyógytorna edző

Böngészőben futó edzésvezető app a `gyógytorna_gyakorlatok.txt` gyakorlataiból.

**Élő változat:** https://gyozo-terplan.github.io/gyogytorna-edzo/

## Indítás

- **Windows:** dupla kattintás a `start.bat`-ra (helyi szervert indít, és megnyitja a `http://localhost:8765` címet).
- Vagy kézzel: `python -m http.server 8765`, majd böngészőben `http://localhost:8765`.
- Az `index.html` közvetlenül is megnyitható. A 3D motor (Three.js) CDN-ről töltődik, ezért internet kell hozzá.

Telefonon: ha a gép és a telefon ugyanazon a Wi-Fi-n van, a `http://<a-gép-IP-címe>:8765` címen is elérhető.

## Funkciók

| Kérés | Megvalósítás |
|---|---|
| Edzésterv a fájl gyakorlataiból | **Edzésterv** fül: időtartam (~15/25/40 perc), intenzitás (normál = a fájl ismétlésszámai, vagy kímélő), fókusz (has, far, hát, egyensúly, mobilitás, lazítás). A tervben a gyakorlatok cserélhetők és törölhetők, a sorrend testhelyzet szerint rendeződik (kevesebb fel-le fekvés). |
| Eszközös / eszköz nélküli edzés | „Eszköz nélkül” csak matracot igényel (a csúszkát zokni is kiválthatja). „Eszközökkel” módban bejelölöd, mi van otthon (kislabda, jógatégla, fitball, miniband, gumikötél), és ezek a gyakorlatok előnyt kapnak. |
| Bemelegítés és lenyújtás | Minden terv három részből áll: bemelegítés → fő rész → lenyújtás. |
| Lépésről lépésre, hanggal | Minden gyakorlatnál elhangzik a kiinduló helyzet, az első ismétlésnél a teljes lépésenkénti leírás, utána **minden ismétlésnél** rövid utasítás (pl. „Kilégzés, láb és ellentétes kar fel.” „Tartsd! Öt, négy…”), az ismétlésszám és az oldal. A Beállításokban kérhető a teljes leírás minden ismétlésnél. |
| 3D báb | Wireframe báb mutatja a mozdulatot. Kiemeli a dolgozó testrészeket, megjeleníti a kellékeket (labda, tégla, fitball, szalag, bordásfal, csúszka). Egérrel/ujjal forgatható és nagyítható. |
| Élethű hang | Előre generált **neurális** magyar hang (Microsoft „Noémi”) mp3-ban, az `audio/` mappában. Ha hiányzik, a böngésző legjobb magyar hangja szól (Edge-ben a természetes „Noémi Online (Natural)”). |

Vezérlés edzés közben: szünet/folytatás (szóköz), előző/következő gyakorlat (←/→), gyakorlat újrakezdése, leállítás; a „Következik” listában bármelyik gyakorlatra ugorhatsz.

## Hangfájlok újragenerálása

Ha módosítod a `js/data.js` szövegeit, vagy másik hangot szeretnél:

```bash
pip install edge-tts
python tools/generate_audio.py                            # Noémi (női hang)
python tools/generate_audio.py --voice hu-HU-TamasNeural  # Tamás (férfi hang)
python tools/generate_audio.py --rate -10%                # lassabb beszéd
```

A szkript csak a hiányzó fájlokat készíti el, és frissíti az `audio/manifest.js`-t. A generáláshoz a szövegek a Microsoft online beszédszolgáltatásához kerülnek; maga az app futás közben nem küld adatot sehová.

## Felépítés

```
index.html            felület
css/style.css         stílusok (világos/sötét téma, mobilra is)
js/data.js            gyakorlatok: leírás, lépések, ismétlések, hangutasítások, időzítés (JSON)
js/poses.js           a báb kulcspózai gyakorlatonként
js/figure.js          3D báb és kellékek (Three.js)
js/stage.js           3D jelenet, kamera, pózanimáció
js/voice.js           hangmotor (neurális mp3 → böngészős TTS tartalék)
js/planner.js         edzéstervező
js/player.js          edzésvezető (ismétlések, oldalak, kitartások, pihenők)
js/app.js             nézetek és beállítások
tools/generate_audio.py  neurális hangfájlok előállítása
dev/poses.html        fejlesztői pózböngésző (?sheet=all: minden póz egy lapon)
```

## Megjegyzések

- A 29 gyakorlat szövege a fájlból származik (a hangos felolvasáshoz kissé átfogalmazva, tegező formában). A **Kiegészítő** jelölésű bemelegítő/levezető gyakorlatok (hasi légzés, térdkidöntögetés, medencebillentés, macska–tehén, gyermekpóz, térdek mellkashoz, fekvő csavarás) nem a fájlból valók.
- A „5–10 db” jellegű tartományoknál a középértéket használja (pl. 8), a „5–10 mp” kitartásoknál 7 mp-et, az „ameddig bírod” kitartásoknál 6–8 mp-et.
- Az app nem helyettesíti a gyógytornászt; fájdalom esetén hagyd ki a gyakorlatot.
