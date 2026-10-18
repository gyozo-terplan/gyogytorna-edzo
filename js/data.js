/* Gyógytorna gyakorlatok adatai.
 * FONTOS: a "window.GYT_DATA =" utáni rész szigorú JSON (a tools/generate_audio.py ebből gyűjti ki a kimondandó szövegeket).
 * Kimondott mezők: phrases.*, sayName, setup, steps[], sideText[], seq[].cue, prep[].cue, post[].cue
 * seq elemek: pose = póz neve (js/poses.js), t = mozdulat ideje (mp), st = lépés indexe (vagy tömb), cue = rövid hangutasítás,
 *             hold = kitartás (mp), once = csak az első ismétlésnél, nw = nem várja meg a beszéd végét
 */
window.GYT_DATA = {
  "phrases": {
    "workout_start": "Szia! Indul az edzés. Teríts le egy matracot, és helyezkedj el kényelmesen.",
    "workout_end": "Az edzésnek vége. Szép munka volt, köszönöm, hogy velem tornáztál!",
    "phase_warmup": "Kezdjük a bemelegítéssel. Lassan, kényelmes tempóban mozogj.",
    "phase_main": "Jöjjön az edzés fő része.",
    "phase_cooldown": "Végül következik a lenyújtás és a lazítás.",
    "next_exercise": "Következő gyakorlat:",
    "start_position": "Kiinduló helyzet:",
    "get_ready": "Helyezkedj el a kiinduló helyzetben.",
    "go": "Rajta!",
    "rest": "Pihenő.",
    "rest_sets": "Pihenj egy kicsit, utána jön a következő sorozat.",
    "continue": "Folytatjuk.",
    "hold": "Tartsd!",
    "release": "Engedd.",
    "well_done": "Szép volt!",
    "exercise_done": "Ez a gyakorlat kész.",
    "last_rep": "Utolsó ismétlés.",
    "last_round": "Utolsó kör.",
    "left": "Bal oldal.",
    "right": "Jobb oldal.",
    "left_short": "Bal.",
    "right_short": "Jobb.",
    "switch_side": "Most jöjjön a másik oldal.",
    "breath_in": "Belégzés.",
    "breath_out": "Kilégzés.",
    "voice_test": "Szia! Így hangzik a hangom. Ha készen állsz, kezdhetjük az edzést.",
    "rep": ["Első ismétlés.", "Második ismétlés.", "Harmadik ismétlés.", "Negyedik ismétlés.", "Ötödik ismétlés.", "Hatodik ismétlés.", "Hetedik ismétlés.", "Nyolcadik ismétlés.", "Kilencedik ismétlés.", "Tizedik ismétlés.", "Tizenegyedik ismétlés.", "Tizenkettedik ismétlés."],
    "round": ["Első kör.", "Második kör.", "Harmadik kör.", "Negyedik kör.", "Ötödik kör.", "Hatodik kör.", "Hetedik kör.", "Nyolcadik kör.", "Kilencedik kör.", "Tizedik kör."],
    "breath": ["Első légzés.", "Második légzés.", "Harmadik légzés.", "Negyedik légzés.", "Ötödik légzés.", "Hatodik légzés.", "Hetedik légzés.", "Nyolcadik légzés."],
    "cycle": ["Első ciklus.", "Második ciklus.", "Harmadik ciklus.", "Negyedik ciklus.", "Ötödik ciklus.", "Hatodik ciklus."],
    "set": ["Első sorozat.", "Második sorozat.", "Harmadik sorozat."],
    "num": ["Egy.", "Kettő.", "Három.", "Négy.", "Öt.", "Hat.", "Hét.", "Nyolc.", "Kilenc.", "Tíz."]
  },

  "equipment": {
    "labda": { "name": "Puha kislabda (overball)", "household": false },
    "jogategla": { "name": "Jógatégla", "household": false },
    "fitball": { "name": "Fitball (nagylabda)", "household": false },
    "miniband": { "name": "Mini gumiszalag", "household": false },
    "gumikotel": { "name": "Gumikötél + bordásfal / rögzítési pont", "household": false },
    "csuszka": { "name": "Csúszka (zokni vagy papírlap is jó)", "household": true }
  },

  "focus": {
    "mobilitas": "Mobilitás",
    "has": "Has / törzs",
    "far": "Far / medence",
    "hat": "Hát / lapocka",
    "egyensuly": "Egyensúly / stabilitás",
    "lazitas": "Lazítás"
  },

  "positions": {
    "supine": "Hanyattfekvés",
    "side": "Oldalfekvés",
    "quad": "Négykézláb",
    "prone": "Hasonfekvés",
    "kneel": "Térdelés"
  },

  "exercises": [
    {
      "id": "e01", "num": 1, "source": "file", "group": "Idegmobilizáció, mellkasnyitás, oldalfekvés",
      "name": "Ülőideg mobilizáció (Sciatic nerve glide)", "sayName": "Ülőideg mobilizáció.",
      "phases": ["warmup", "main"], "position": "supine", "equipment": [], "focus": ["mobilitas"],
      "setup": "Feküdj hanyatt. Az egyik lábad lazán kinyújtva pihen a talajon. A másik láb térdét két kézzel átkulcsolva húzd fel az azonos oldali vállad irányába.",
      "steps": [
        "Felhúzott helyzetben feszítsd vissza a lábfejed: pipa.",
        "A combot megtartva nyújtsd ki a lábszárad felfelé, a plafon felé, ameddig a térd egyenes tud maradni. Közben spiccelj a lábfejjel.",
        "Hajlítsd vissza a térdet a váll felé, közben újra pipálj a lábfejjel.",
        "Végig folyamatos, ritmikus mozdulattal végezd a láb kinyújtását és visszahajlítását."
      ],
      "repsText": "3 × 10 db oldalanként",
      "reps": { "sets": 3, "count": 10, "sides": "each", "unit": "rep" },
      "seq": [
        { "pose": "pipa", "t": 1.0, "st": 0, "cue": "Pipa." },
        { "pose": "nyujt", "t": 1.4, "st": 1, "cue": "Nyújts, spicc." },
        { "pose": "pipa", "t": 1.4, "st": 2, "cue": "Hajlíts, pipa." },
        { "st": 3, "t": 0.2, "once": true }
      ]
    },
    {
      "id": "e02", "num": 2, "source": "file", "group": "Idegmobilizáció, mellkasnyitás, oldalfekvés",
      "name": "Mellkasnyitás / háti nyújtózás kislabdán", "sayName": "Mellkasnyitás kislabdán.",
      "phases": ["main", "cooldown"], "position": "supine", "equipment": ["labda"], "focus": ["mobilitas", "hat", "lazitas"],
      "setup": "Feküdj hanyatt úgy, hogy a hátad közepe alatt, a lapockák alsó csúcsánál egy puha kislabda legyen. A fejed alatt jógatégla vagy párna van. A karjaid a tested mellett.",
      "steps": [
        "Engedd rá teljesen a testsúlyodat a labdára.",
        "Mindkét nyújtott karoddal nyújtózz hosszan hátra, a füled mellé, a talaj felé.",
        "Tartsd meg a nyújtást egy rövid ideig a fül magasságában.",
        "Lassan engedd vissza a karokat a törzs mellé."
      ],
      "repsText": "5 – 10 db",
      "reps": { "sets": 1, "count": 8, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "start", "t": 1.2, "st": 0, "cue": "Lazíts rá a labdára." },
        { "pose": "up", "t": 3.0, "st": 1, "cue": "Karok hátra, a fül mellé." },
        { "hold": 3, "st": 2, "cue": "Tartsd." },
        { "pose": "start", "t": 3.0, "st": 3, "cue": "Lassan vissza." }
      ]
    },
    {
      "id": "e03", "num": 3, "source": "file", "group": "Idegmobilizáció, mellkasnyitás, oldalfekvés",
      "name": "Karemelés plafon felé oldalfekvésben", "sayName": "Karemelés oldalfekvésben.",
      "phases": ["main"], "position": "side", "equipment": ["labda"], "focus": ["hat", "egyensuly", "has"],
      "setup": "Feküdj az oldaladra egyenes vonalban. A lábaid nyújtva, a törzs folytatásában, a térdek nem hajlanak be. Egy puha labdát szoríts a két bokád közé. Az alsó karod nyújtva a fejed alatt, csak a kisujjéle támaszkodik a talajon. A medencéd stabil: egy teli pohár víz sem löttyenhetne ki róla.",
      "sideText": ["Feküdj a jobb oldaladra.", "Fordulj át a bal oldaladra."],
      "steps": [
        "Vegyél egy nagy levegőt, és lazíts el.",
        "Kilégzésre húzd be a köldököd, és feszítsd meg a farizmaidat a törzs stabilizálásához.",
        "Lassan emeld fel a felül lévő nyújtott karodat függőlegesig, a mennyezet felé.",
        "Ugyanarra a kilégzésre, vagy egy új levegővétel utáni kilégzésre lassan engedd vissza a tested mellé. A medence mozdulatlan marad."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "rep" },
      "seq": [
        { "pose": "start", "t": 1.5, "st": 0, "cue": "Belégzés." },
        { "t": 1.0, "st": 1, "cue": "Kilégzés, köldök be, far feszít." },
        { "pose": "up", "t": 2.5, "st": 2, "cue": "Kar fel, a plafon felé." },
        { "pose": "start", "t": 2.5, "st": 3, "cue": "Lassan vissza. A medence nem mozdul." }
      ]
    },
    {
      "id": "e04", "num": 4, "source": "file", "group": "Idegmobilizáció, mellkasnyitás, oldalfekvés",
      "name": "Karkörzés a plafon felé nyújtott karral", "sayName": "Karkörzés oldalfekvésben.",
      "phases": ["main"], "position": "side", "equipment": ["labda"], "focus": ["hat", "egyensuly", "mobilitas"],
      "setup": "Ugyanaz a stabil, nyújtott oldalfekvés, labdával a bokák között, mint az előzőnél, de a felül lévő karod már eleve függőlegesen a plafon felé mutat.",
      "sideText": ["Feküdj a jobb oldaladra, a felső kar a plafon felé.", "Fordulj át a bal oldaladra, a felső kar a plafon felé."],
      "steps": [
        "Kilégzésre a stabil központot, a hasat és a fenekedet megtartva, indíts egy nagy kört a nyújtott karral a levegőben.",
        "A kör végén állj meg, vegyél levegőt, majd a következő kilégzésre az ellenkező irányba rajzolj egy kört.",
        "Ügyelj rá, hogy a törzsed egyáltalán ne forogjon, és ne billegjen el közben."
      ],
      "repsText": "Összesen 6 kilégzés (3 kör előre, 3 kör hátra)",
      "reps": { "sets": 1, "count": 3, "sides": "each", "unit": "round" },
      "prep": [ { "pose": "up", "t": 1.5 } ],
      "seq": [
        { "pose": "up", "t": 0.6, "st": 0, "cue": "Kilégzés, kör előre." },
        { "pose": "cA", "t": 0.9, "nw": true },
        { "pose": "cB", "t": 0.9, "nw": true },
        { "pose": "cC", "t": 0.9, "nw": true },
        { "pose": "cD", "t": 0.9, "nw": true },
        { "pose": "up", "t": 0.9 },
        { "t": 1.5, "st": 1, "cue": "Belégzés." },
        { "t": 0.4, "cue": "Kilégzés, kör visszafelé." },
        { "pose": "cD", "t": 0.9, "nw": true },
        { "pose": "cC", "t": 0.9, "nw": true },
        { "pose": "cB", "t": 0.9, "nw": true },
        { "pose": "cA", "t": 0.9, "nw": true },
        { "pose": "up", "t": 0.9 },
        { "st": 2, "t": 0.2, "once": true }
      ],
      "post": [ { "pose": "start", "t": 1.5 } ]
    },
    {
      "id": "e05", "num": 5, "source": "file", "group": "Négykézláb és térdelőtámaszos gyakorlatok",
      "name": "Ellentétes kar- és lábemelés (Bird-Dog)", "sayName": "Ellentétes kar- és lábemelés, más néven Bird-Dog.",
      "phases": ["main"], "position": "quad", "equipment": [], "focus": ["has", "hat", "egyensuly"],
      "setup": "Helyezkedj el négykézláb: a tenyereid vállszélességben, a térdeid csípőszélességben. A mellkasod finoman leengedve, a nyakad egyenes, a deréknál természetes kis homorulat.",
      "steps": [
        "Az egyik lábadat csúsztasd hátra a talajon lábujjhegyre. Ellenőrizd, hogy a két csípőlapát párhuzamos maradjon a talajjal.",
        "Kilégzésre húzd be a köldököd, és emeld fel a nyújtott lábadat a törzs vonaláig. Sarokkal nyújtózz hátra, a lábfej pipa.",
        "Ezzel egyszerre emeld fel az ellentétes karodat előre, a füled mellé nyújtózva.",
        "Tartsd meg a feszítést öt másodpercig.",
        "Lassan engedd vissza, majd végezd el a másik oldalra."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "slide", "t": 1.5, "st": 0, "cue": "Láb hátra, lábujjhegyre." },
        { "pose": "lift", "t": 2.0, "st": [1, 2], "cue": "Kilégzés, láb és ellentétes kar fel." },
        { "hold": 5, "st": 3, "cue": "Tartsd!" },
        { "pose": "start", "t": 2.0, "st": 4, "cue": "Lassan vissza." }
      ]
    },
    {
      "id": "e06", "num": 6, "source": "file", "group": "Négykézláb és térdelőtámaszos gyakorlatok",
      "name": "Bird-Dog kislabdás instabilitással", "sayName": "Bird-Dog kislabdával.",
      "phases": ["main"], "position": "quad", "equipment": ["labda"], "focus": ["has", "egyensuly"],
      "setup": "Helyezkedj el négykézláb úgy, hogy a támaszkodó lábfejed és lábszárad alatt egy puha kislabda legyen. Ez megnehezíti az egyensúlyozást.",
      "steps": [
        "A szabad lábadat nyújtsd hátra a talajra.",
        "Kilégzésre emeld a lábadat a törzs folytatásába, sarokkal hátra nyújtózva.",
        "Emeld az ellentétes karodat előre, a füled mellé.",
        "Tartsd ki a pózt egyensúlyozva, öt-tíz másodpercig.",
        "Lassan engedd le, tedd át a labdát a másik lábfejed alá, és ismételd."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "slide", "t": 1.5, "st": 0, "cue": "Szabad láb hátra." },
        { "pose": "lift", "t": 2.0, "st": [1, 2], "cue": "Kilégzés, láb és ellentétes kar fel." },
        { "hold": 7, "st": 3, "cue": "Egyensúlyozz, tartsd!" },
        { "pose": "start", "t": 2.0, "st": 4, "cue": "Lassan le, labda át a másik láb alá." }
      ]
    },
    {
      "id": "e07", "num": 7, "source": "file", "group": "Négykézláb és térdelőtámaszos gyakorlatok",
      "name": "Medenceszintezés térdelőtámaszban jógatéglán", "sayName": "Medenceszintezés jógatéglán.",
      "phases": ["main"], "position": "quad", "equipment": ["jogategla"], "focus": ["far", "egyensuly"],
      "setup": "Négykézláb állásban az egyik térded egy jógatéglán van, a másik térded a levegőben lóg a tégla mellett. A lábujjaid visszafeszítve, a csípőd a lógó oldalon lejjebb süllyed.",
      "steps": [
        "Vegyél levegőt a kiinduló helyzetben.",
        "Kilégzésre feszítsd meg a hasad, és emeld fel a lebillent csípőfeledet pontosan vízszintbe a másikkal.",
        "Ügyelj rá, hogy a törzsed és a medencéd ne dőljön ki oldalra, mintha egy fal mellett lennél.",
        "Lassan engedd vissza lebillenni."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "rep" },
      "seq": [
        { "pose": "start", "t": 1.5, "st": 0, "cue": "Belégzés." },
        { "pose": "level", "t": 2.0, "st": [1, 2], "cue": "Kilégzés, has feszít, csípő vízszintbe." },
        { "pose": "start", "t": 2.0, "st": 3, "cue": "Lassan vissza." }
      ]
    },
    {
      "id": "e08", "num": 8, "source": "file", "group": "Hasonfekvő lapocka- és hátizomgyakorlatok",
      "name": "„I” betű karkiemelés hasonfekvésben", "sayName": "I betű karkiemelés hasonfekvésben.",
      "phases": ["main"], "position": "prone", "equipment": [], "focus": ["hat"],
      "setup": "Feküdj hasra, a homlokod alá tegyél egy kis törölközőt vagy párnát. A karjaid a tested mellett hátra nyújtva, a tenyereid egymás felé néznek, a hüvelykujjaid lefelé mutatnak.",
      "steps": [
        "Húzd hátra és felfelé a vállaidat a plafon irányába, és zárd egymáshoz a lapockák alsó csücskeit, mintha ráncolnád a bőrt a lapockák között.",
        "Emeld fel a két nyújtott karodat a talajról, és nyújtózz hátra, a bokáid felé.",
        "Tartsd meg három-öt másodpercig.",
        "Lassan engedd vissza a talajra."
      ],
      "repsText": "10 db",
      "reps": { "sets": 1, "count": 10, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "squeeze", "t": 1.5, "st": 0, "cue": "Vállak hátra, lapockák össze." },
        { "pose": "lift", "t": 1.5, "st": 1, "cue": "Karok fel, nyújtózz a bokák felé." },
        { "hold": 4, "st": 2, "cue": "Tartsd!" },
        { "pose": "start", "t": 2.0, "st": 3, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e09", "num": 9, "source": "file", "group": "Hasonfekvő lapocka- és hátizomgyakorlatok",
      "name": "„W” betű karhúzás hasonfekvésben", "sayName": "W betű karhúzás hasonfekvésben.",
      "phases": ["main"], "position": "prone", "equipment": [], "focus": ["hat"],
      "setup": "Feküdj hasra, homloktámasszal. Mindkét kezed a tarkódon, a könyökeid a talajon.",
      "steps": [
        "Emeld fel a könyököket a talajról a plafon felé, és tartsd meg ezt a magasságot.",
        "Húzd hátra a karokat W formába a levegőben: az alkarok párhuzamosak a talajjal, a lapockák zárnak.",
        "Érintsd vissza a kezed a tarkódhoz úgy, hogy a könyökök nem esnek le.",
        "Engedd le a karokat a talajra."
      ],
      "repsText": "10 db",
      "reps": { "sets": 1, "count": 10, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "elbows", "t": 1.5, "st": 0, "cue": "Könyökök fel." },
        { "pose": "w", "t": 1.5, "st": 1, "cue": "Karok hátra, W forma, lapockák zárnak." },
        { "pose": "elbows", "t": 1.5, "st": 2, "cue": "Kéz vissza a tarkóra." },
        { "pose": "start", "t": 1.5, "st": 3, "cue": "Karok le." }
      ]
    },
    {
      "id": "e10", "num": 10, "source": "file", "group": "Hasonfekvő lapocka- és hátizomgyakorlatok",
      "name": "Összetett „I – W – Y – W – I” gyakorlat", "sayName": "Összetett I, W, Y, W, I gyakorlat.",
      "phases": ["main"], "position": "prone", "equipment": [], "focus": ["hat"],
      "setup": "Feküdj hasra, a homlokod alátámasztva.",
      "steps": [
        "Emeld a karokat hátra, I betűbe.",
        "Húzd fel a karokat W betűbe, a levegőben tartva.",
        "Nyújtsd ki mindkét karodat rézsútosan előre, Y betűbe. A lapockák feszesek, a váll nem esik le.",
        "Húzd vissza a karokat W helyzetbe.",
        "Nyújtsd vissza őket a tested mellé, I betűbe, majd engedd le a talajra."
      ],
      "repsText": "5 összetett ciklus",
      "reps": { "sets": 1, "count": 5, "sides": "none", "unit": "cycle" },
      "seq": [
        { "pose": "i", "t": 1.5, "st": 0, "cue": "I." },
        { "pose": "w", "t": 1.8, "st": 1, "cue": "W." },
        { "pose": "y", "t": 1.8, "st": 2, "cue": "Y, nyújtózz előre." },
        { "pose": "w", "t": 1.8, "st": 3, "cue": "Vissza W." },
        { "pose": "i", "t": 1.8, "st": 4, "cue": "I." },
        { "pose": "start", "t": 1.5, "cue": "Le." }
      ]
    },
    {
      "id": "e11", "num": 11, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Felfelé irányuló hasprés statikus térdnyújtással", "sayName": "Hasprés statikus térdnyújtással.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["has"],
      "setup": "Feküdj hanyatt, a lábaidat húzd talpra. A kezeid a tarkódon, a könyökeid oldalra nyitva.",
      "steps": [
        "Végezz egy nagyon finom, apró hasprést: a felsőtestedet és az arcodat egyenesen a plafon felé emeld. Az arcod maradjon párhuzamos a mennyezettel, a könyökök nyitva.",
        "Ezzel egy időben az egyik térdedet nyújtsd ki ferdén felfelé.",
        "Tartsd ki a feszítést tíz másodpercig.",
        "Engedd le, majd ismételd meg a másik lábbal. Nehezítésként a lábat lejjebb is nyújthatod."
      ],
      "repsText": "5 – 5 db oldalanként (közben pihentető térdkidöntögetés)",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "crunch", "t": 2.0, "st": [0, 1], "cue": "Felsőtest fel, térd nyújt." },
        { "hold": 10, "st": 2, "cue": "Tartsd tíz másodpercig!" },
        { "pose": "start", "t": 2.0, "st": 3, "cue": "Engedd le." }
      ]
    },
    {
      "id": "e12", "num": 12, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Oldalsó félplank medenceemeléssel (téglán)", "sayName": "Oldalsó félplank medenceemeléssel.",
      "phases": ["main"], "position": "side", "equipment": ["jogategla"], "focus": ["has", "far"],
      "setup": "Feküdj az oldaladra, az alkarod egy jógatéglán támaszkodik, a könyököd a vállad alatt. Told ki a mellkasodat a vállból, ne lógj bele. A térdeid behajlítva egymáson, a felső kezed a csípődön.",
      "sideText": ["Feküdj a jobb oldaladra, jobb alkar a téglán.", "Fordulj át a bal oldaladra, bal alkar a téglán."],
      "steps": [
        "Vegyél mély levegőt.",
        "Kilégzésre húzd be a köldököd, szorítsd meg a farizmod, és emeld fel a medencédet, hogy a combod és a törzsed egy vonalba kerüljön.",
        "Folyamatos kilégzés mellett tartsd ki a pózt, ameddig fújni tudod a levegőt, majd lassan engedd le. Nehezítésként medenceemelés közben a felül lévő hajlított lábadat is emeld fel."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "rep" },
      "seq": [
        { "pose": "start", "t": 1.5, "st": 0, "cue": "Mély belégzés." },
        { "pose": "up", "t": 2.0, "st": 1, "cue": "Kilégzés, köldök be, medence fel." },
        { "hold": 6, "st": 2, "cue": "Fújd a levegőt, tartsd!" },
        { "pose": "start", "t": 2.0, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e13", "num": 13, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Döglött bogár 1. – Talpérintés lefelé", "sayName": "Döglött bogár, első változat: sarokérintés.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["has"],
      "setup": "Feküdj hanyatt. Mindkét karod függőlegesen a plafon felé nyújtva. A csípőd és a térded kilencven fokban hajlítva, a lábszárad vízszintes. A derekadat finoman simítsd le a matracra.",
      "steps": [
        "Kilégzésre húzd be a köldököd, a hasizom aktív.",
        "A térd kilencven fokos szögét megtartva, csak csípőből mozogva engedd le az egyik sarkadat, hogy érintse a talajt. A derekad nem emelkedhet fel, a láb súlyát a hasizom tartja.",
        "Húzd vissza a kiinduló helyzetbe, majd cserélj lábat."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "t": 0.8, "st": 0, "cue": "Kilégzés, köldök be." },
        { "pose": "tap", "t": 2.0, "st": 1, "cue": "Sarok le, a derék marad." },
        { "pose": "start", "t": 2.0, "st": 2, "cue": "Vissza." }
      ]
    },
    {
      "id": "e14", "num": 14, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Döglött bogár 2. – Lábnyújtás előre", "sayName": "Döglött bogár, második változat: lábnyújtás.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["has"],
      "setup": "Ugyanaz a döglött bogár kiinduló helyzet: karok fent, lábak kilencven fokban, a derék stabil.",
      "steps": [
        "Kilégzésre feszítsd meg a hasad.",
        "Az egyik lábadat nyújtsd ki laposan előre a levegőben. A sarok körülbelül tíz centire a talaj felett megáll, nem ér le.",
        "Húzd vissza kilencven fokos helyzetbe, majd válts a másik lábra."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "t": 0.8, "st": 0, "cue": "Kilégzés, has feszít." },
        { "pose": "ext", "t": 2.2, "st": 1, "cue": "Láb előre, nem ér le." },
        { "pose": "start", "t": 2.0, "st": 2, "cue": "Vissza." }
      ]
    },
    {
      "id": "e15", "num": 15, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Döglött bogár 3. – Ellentétes kar és láb nyújtása", "sayName": "Döglött bogár, harmadik változat: ellentétes kar és láb.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["has", "egyensuly"],
      "setup": "Döglött bogár kiinduló helyzet: karok a plafon felé, csípő és térd kilencven fokban, a derék lesimítva.",
      "steps": [
        "Kilégzésre húzd be a köldököd.",
        "Egyszerre nyújtsd ki az egyik lábadat laposan előre, és az ellentétes nyújtott karodat hátra, a füled mellé, a levegőben.",
        "A derekad mozdulatlanul lesimítva marad.",
        "Húzd vissza kiinduló helyzetbe, majd cserélj a másik párra."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "t": 0.8, "st": 0, "cue": "Kilégzés, köldök be." },
        { "pose": "ext", "t": 2.4, "st": [1, 2], "cue": "Láb előre, ellentétes kar hátra." },
        { "pose": "start", "t": 2.2, "st": 3, "cue": "Vissza." }
      ]
    },
    {
      "id": "e16", "num": 16, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Szfinx póz (lazítás / homorítás)", "sayName": "Szfinx póz.",
      "phases": ["cooldown"], "position": "prone", "equipment": [], "focus": ["lazitas", "mobilitas"],
      "setup": "Feküdj hasra, és támaszkodj az alkarjaidon a mellkasod előtt.",
      "steps": [
        "Engedd bele a medencédet és a hasadat a matracba, lazítsd el a derekad.",
        "Mély kilégzéssel hagyd, hogy a köldököd még mélyebbre süllyedjen a talaj felé, finom homorítást adva a derekadnak."
      ],
      "repsText": "Néhány mély lélegzetvétel lazításképp",
      "reps": { "sets": 1, "count": 5, "sides": "none", "unit": "breath" },
      "seq": [
        { "pose": "in", "t": 3.0, "st": 0, "cue": "Belégzés." },
        { "pose": "out", "t": 4.0, "st": 1, "cue": "Kilégzés, lazíts, süllyedj." }
      ]
    },
    {
      "id": "e17", "num": 17, "source": "file", "group": "Hasizom- és törzsstabilizációs gyakorlatok",
      "name": "Döglött bogár 4. – Lábnyitás oldalra", "sayName": "Döglött bogár, negyedik változat: térdnyitás oldalra.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["has", "far"],
      "setup": "Döglött bogár kiinduló helyzet: karok a plafon felé, csípő és térd kilencven fokban, a derék lesimítva.",
      "steps": [
        "Kilégzésre az egyik térdedet nyisd ki oldalra, de csak addig, amíg a túloldali csípőd teljesen a talajon marad, és nem billen el a medence.",
        "Húzd vissza középre, majd ismételd a másik oldallal."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "open", "t": 2.2, "st": 0, "cue": "Kilégzés, térd oldalra, a medence marad." },
        { "pose": "start", "t": 2.0, "st": 1, "cue": "Vissza középre." }
      ]
    },
    {
      "id": "e18", "num": 18, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Alap medenceemelés (Híd)", "sayName": "Alap medenceemelés, híd.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["far"],
      "setup": "Feküdj hanyatt, a talpaid párhuzamosan a talajon, a térdeid hajlítva, csípőszélességben. A karjaid a tested mellett.",
      "steps": [
        "Erősen szorítsd össze a farizmaidat, mintha egy pénzérmét fognál közöttük.",
        "Emeld ki a medencédet addig, amíg a combod és a törzsed egy vonalba nem kerül.",
        "Tartsd meg fent, szorítva, öt másodpercig.",
        "Lassan engedd vissza a talajra, és lent lazíts el."
      ],
      "repsText": "5 db (közben pihentető térdkidöntögetés)",
      "reps": { "sets": 1, "count": 5, "sides": "none", "unit": "rep" },
      "seq": [
        { "t": 0.8, "st": 0, "cue": "Far szorít." },
        { "pose": "up", "t": 2.2, "st": 1, "cue": "Medence fel." },
        { "hold": 5, "st": 2, "cue": "Tartsd!" },
        { "pose": "start", "t": 2.5, "st": 3, "cue": "Lassan le, lazíts." }
      ]
    },
    {
      "id": "e19", "num": 19, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Medenceemelés emelt karokkal", "sayName": "Medenceemelés emelt karokkal.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["far", "egyensuly"],
      "setup": "Feküdj hanyatt talptámasszal, mindkét karod függőlegesen a plafon felé nyújtva.",
      "steps": [
        "Szorítsd a farizmod, majd emeld ki a medencédet a magasba. A térdek nem nyílhatnak szét oldalra.",
        "Tartsd meg fent öt másodpercig.",
        "Lassan engedd vissza."
      ],
      "repsText": "kb. 10 db",
      "reps": { "sets": 1, "count": 10, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "up", "t": 2.2, "st": 0, "cue": "Far szorít, medence fel." },
        { "hold": 5, "st": 1, "cue": "Tartsd!" },
        { "pose": "start", "t": 2.2, "st": 2, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e20", "num": 20, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Híd váltott térdhúzással mellkashoz", "sayName": "Híd váltott térdhúzással.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["far", "has", "egyensuly"],
      "setup": "Feküdj hanyatt talptámasszal, a karjaid a plafon felé nyújtva. Minden kör elején a medencét híd tartásba emeled, a két csípőlapát teljesen egy magasságban.",
      "steps": [
        "Fent tartott medencével húzd fel az egyik térdedet a hasadhoz. A támaszkodó oldali farizom keményen tart.",
        "Tedd vissza a talpad, majd húzd fel a másikat.",
        "Folyamatosan fent tartod a csípőt a lépések alatt."
      ],
      "repsText": "3 kör (körönként 2-2 lépés oldalanként)",
      "reps": { "sets": 1, "count": 3, "sides": "none", "unit": "round" },
      "seq": [
        { "pose": "bridge", "t": 2.2, "cue": "Medence fel, híd." },
        { "pose": "kneeL", "t": 1.5, "st": 0, "cue": "Bal térd fel." },
        { "pose": "bridge", "t": 1.2, "st": 1, "cue": "Le." },
        { "pose": "kneeR", "t": 1.5, "cue": "Jobb térd fel." },
        { "pose": "bridge", "t": 1.2, "st": 2, "cue": "Le, a csípő fent marad." },
        { "pose": "kneeL", "t": 1.5, "cue": "Bal." },
        { "pose": "bridge", "t": 1.2 },
        { "pose": "kneeR", "t": 1.5, "cue": "Jobb." },
        { "pose": "bridge", "t": 1.2 },
        { "pose": "start", "t": 2.2, "cue": "Medence le, pihenj." }
      ]
    },
    {
      "id": "e21", "num": 21, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Híd váltott lábnyújtással előre", "sayName": "Híd váltott lábnyújtással.",
      "phases": ["main"], "position": "supine", "equipment": [], "focus": ["far", "has", "egyensuly"],
      "setup": "Feküdj hanyatt talptámasszal, a karjaid a plafon felé nyújtva. Minden kör elején a medencét híd tartásba emeled.",
      "steps": [
        "Fent tartott medencével nyújtsd ki az egyik térdedet rézsútosan előre úgy, hogy a két combod párhuzamos maradjon.",
        "Tedd vissza a talpad, majd nyújtsd a másik lábad.",
        "A csípő nem süllyedhet le a mozdulat közben."
      ],
      "repsText": "3 kör (körönként 2-2 nyújtás oldalanként)",
      "reps": { "sets": 1, "count": 3, "sides": "none", "unit": "round" },
      "seq": [
        { "pose": "bridge", "t": 2.2, "cue": "Medence fel, híd." },
        { "pose": "extL", "t": 1.5, "st": 0, "cue": "Bal láb nyújt." },
        { "pose": "bridge", "t": 1.2, "st": 1, "cue": "Le." },
        { "pose": "extR", "t": 1.5, "cue": "Jobb láb nyújt." },
        { "pose": "bridge", "t": 1.2, "st": 2, "cue": "Le, a csípő nem süllyed." },
        { "pose": "extL", "t": 1.5, "cue": "Bal." },
        { "pose": "bridge", "t": 1.2 },
        { "pose": "extR", "t": 1.5, "cue": "Jobb." },
        { "pose": "bridge", "t": 1.2 },
        { "pose": "start", "t": 2.2, "cue": "Medence le, pihenj." }
      ]
    },
    {
      "id": "e22", "num": 22, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Medenceemelés fitballon (saroktámasszal)", "sayName": "Medenceemelés fitballon.",
      "phases": ["main"], "position": "supine", "equipment": ["fitball"], "focus": ["far", "egyensuly"],
      "setup": "Feküdj hanyatt, a sarkaid és a lábszáraid a nagylabda tetején támaszkodnak. A karjaid a törzsed mellett, a talajon.",
      "steps": [
        "A farizom szorításával emeld ki a medencédet egyenes vonalig, egyensúlyozva a labdán.",
        "Fent tartsd meg öt másodpercig.",
        "Lassan engedd le."
      ],
      "repsText": "5 – 10 db",
      "reps": { "sets": 1, "count": 8, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "up", "t": 2.2, "st": 0, "cue": "Far szorít, medence fel." },
        { "hold": 5, "st": 1, "cue": "Egyensúlyozz, tartsd!" },
        { "pose": "start", "t": 2.2, "st": 2, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e23", "num": 23, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Medenceemelés fitballon emelt karokkal", "sayName": "Medenceemelés fitballon, emelt karokkal.",
      "phases": ["main"], "position": "supine", "equipment": ["fitball"], "focus": ["far", "egyensuly"],
      "setup": "Feküdj hanyatt, a sarkaid a fitballon, de mindkét karod függőlegesen a plafon felé nyújtva.",
      "steps": [
        "A farizom maximális szorításával lassan emeld fel a medencédet egyenes vonalig.",
        "Egyensúlyozz, és tartsd meg fent öt másodpercig.",
        "Lassan engedd vissza a matracra."
      ],
      "repsText": "5 – 10 db",
      "reps": { "sets": 1, "count": 8, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "up", "t": 2.4, "st": 0, "cue": "Far maximálisan szorít, medence fel." },
        { "hold": 5, "st": 1, "cue": "Egyensúlyozz, tartsd!" },
        { "pose": "start", "t": 2.2, "st": 2, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e24", "num": 24, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Medenceemelés gumiszalaggal, fenti térdnyitással", "sayName": "Medenceemelés gumiszalaggal, térdnyitással.",
      "phases": ["main"], "position": "supine", "equipment": ["miniband"], "focus": ["far"],
      "setup": "Feküdj hanyatt talptámasszal, a térdeid köré helyezz egy mini gumiszalagot. A karjaid fent, a plafon felé nyújtva.",
      "steps": [
        "Szorítsd a farizmod, és emeld ki a medencédet híd helyzetbe.",
        "A fenti helyzetet végig megtartva nyisd szét a térdeidet háromszor a szalag ellenállásával szemben, majd zárd vissza párhuzamosig.",
        "A harmadik nyitás után engedd le a medencét."
      ],
      "repsText": "3 kör (körönként 3 térdnyitással)",
      "reps": { "sets": 1, "count": 3, "sides": "none", "unit": "round" },
      "seq": [
        { "pose": "bridge", "t": 2.2, "st": 0, "cue": "Far szorít, medence fel." },
        { "pose": "open", "t": 1.0, "st": 1, "cue": "Nyit." },
        { "pose": "bridge", "t": 1.0, "cue": "Zár." },
        { "pose": "open", "t": 1.0, "cue": "Nyit." },
        { "pose": "bridge", "t": 1.0, "cue": "Zár." },
        { "pose": "open", "t": 1.0, "cue": "Nyit." },
        { "pose": "bridge", "t": 1.0, "cue": "Zár." },
        { "pose": "start", "t": 2.2, "st": 2, "cue": "Medence le." }
      ]
    },
    {
      "id": "e25", "num": 25, "source": "file", "group": "Medenceemelés (Híd) és variációi",
      "name": "Medenceemelés gumikötél-lehúzással bordásfalnál", "sayName": "Medenceemelés gumikötél-lehúzással.",
      "phases": ["main"], "position": "supine", "equipment": ["gumikotel"], "focus": ["far", "hat"],
      "setup": "Feküdj hanyatt talptámasszal a bordásfal előtt, a fejed a bordásfal felé. A kezedben a felül rögzített gumiszalag végei.",
      "steps": [
        "Szorítsd a farizmod, és emeld ki a medencédet hídba.",
        "A medencét fent tartva húzd le a gumiszalagot mindkét kezeddel a combjaid mellé, a talajra, majd engedd vissza a fejed fölé.",
        "Ezt a karlehúzást végezd el háromszor egymás után, fent tartott csípővel.",
        "Engedd le a medencét."
      ],
      "repsText": "3 kör (körönként 3 karlehúzással)",
      "reps": { "sets": 1, "count": 3, "sides": "none", "unit": "round" },
      "seq": [
        { "pose": "bridge", "t": 2.2, "st": 0, "cue": "Far szorít, medence fel." },
        { "pose": "pull", "t": 1.6, "st": 1, "cue": "Húzd le." },
        { "pose": "bridge", "t": 1.6, "st": 2, "cue": "Vissza." },
        { "pose": "pull", "t": 1.6, "cue": "Húzd le." },
        { "pose": "bridge", "t": 1.6, "cue": "Vissza." },
        { "pose": "pull", "t": 1.6, "cue": "Húzd le." },
        { "pose": "bridge", "t": 1.6, "cue": "Vissza." },
        { "pose": "start", "t": 2.2, "st": 3, "cue": "Medence le." }
      ]
    },
    {
      "id": "e26", "num": 26, "source": "file", "group": "Lebegő térdelőtámasz („Tigris” póz) és csúszkás gyakorlatok",
      "name": "Statikus „Tigris” póz (lebegő térdelőtámasz)", "sayName": "Statikus tigris póz.",
      "phases": ["main"], "position": "quad", "equipment": [], "focus": ["has"],
      "setup": "Helyezkedj el négykézláb: a térdeid csípőszélességben, a tenyereid vállszélességben, finom derékhomorulattal. A lábujjaid visszafeszítve a talajon.",
      "steps": [
        "Vegyél nagy levegőt.",
        "Kilégzésre húzd be a köldököd, a hasizom maximálisan aktiválódik.",
        "Mindkét térdedet pontosan egy centire, egy ujjnyira emeld fel a talajtól.",
        "Tartsd meg a lebegő helyzetet folyamatos kilégzés mellett, ameddig bírod fújni a levegőt.",
        "Lassan tedd le a térdeidet."
      ],
      "repsText": "3 – 5 db",
      "reps": { "sets": 1, "count": 4, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "start", "t": 1.5, "st": 0, "cue": "Nagy belégzés." },
        { "pose": "hover", "t": 1.5, "st": [1, 2], "cue": "Kilégzés, köldök be, térdek egy centire fel." },
        { "hold": 8, "st": 3, "cue": "Fújd a levegőt, lebegj!" },
        { "pose": "start", "t": 1.5, "st": 4, "cue": "Lassan le." }
      ]
    },
    {
      "id": "e27", "num": 27, "source": "file", "group": "Lebegő térdelőtámasz („Tigris” póz) és csúszkás gyakorlatok",
      "name": "Tigris póz lábcsúsztatással hátra", "sayName": "Tigris póz lábcsúsztatással hátra.",
      "phases": ["main"], "position": "quad", "equipment": ["csuszka"], "focus": ["has", "far", "egyensuly"],
      "setup": "Lebegő tigris póz: mindkét térded egy centire a talaj felett, az egyik lábfejed alatt egy csúszka, zokni vagy papírlap.",
      "steps": [
        "A medencét és a törzset teljesen stabilan tartva csúsztasd hátra a csúszkás lábadat teljesen egyenesre.",
        "Kilégzéssel húzd vissza a lábat a másik mellé úgy, hogy a térd mindvégig egy centire a talaj felett marad.",
        "A támaszkodó térd nem emelkedhet feljebb."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "rep" },
      "prep": [ { "pose": "hover", "t": 1.8, "cue": "Térdek fel, lebegj." } ],
      "seq": [
        { "pose": "back", "t": 2.0, "st": 0, "cue": "Láb hátra csúszik." },
        { "pose": "hover", "t": 2.0, "st": 1, "cue": "Kilégzés, húzd vissza." },
        { "st": 2, "t": 0.2, "once": true }
      ],
      "post": [ { "pose": "start", "t": 1.5, "cue": "Térdek le, pihenj." } ]
    },
    {
      "id": "e28", "num": 28, "source": "file", "group": "Lebegő térdelőtámasz („Tigris” póz) és csúszkás gyakorlatok",
      "name": "Tigris póz lábcsúsztatással oldalra", "sayName": "Tigris póz lábcsúsztatással oldalra.",
      "phases": ["main"], "position": "quad", "equipment": ["csuszka"], "focus": ["has", "far", "egyensuly"],
      "setup": "Lebegő tigris póz, az egyik lábfejed alatt csúszkával, a térdek egy centire elemelve.",
      "steps": [
        "Kilégzésre a csúszkás lábadat egyenes vonalban csúsztasd ki oldalra.",
        "Ügyelj rá, hogy a medencéd és a derekad ne forduljon el közben.",
        "Lassan húzd vissza a lebegő kiinduló helyzetbe."
      ],
      "repsText": "5 – 5 db oldalanként",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "rep" },
      "prep": [ { "pose": "hover", "t": 1.8, "cue": "Térdek fel, lebegj." } ],
      "seq": [
        { "pose": "side", "t": 2.0, "st": [0, 1], "cue": "Kilégzés, láb ki oldalra." },
        { "pose": "hover", "t": 2.0, "st": 2, "cue": "Lassan vissza." }
      ],
      "post": [ { "pose": "start", "t": 1.5, "cue": "Térdek le, pihenj." } ]
    },
    {
      "id": "e29", "num": 29, "source": "file", "group": "Lebegő térdelőtámasz („Tigris” póz) és csúszkás gyakorlatok",
      "name": "Tigris póz lábkörzéssel csúszkán", "sayName": "Tigris póz lábkörzéssel.",
      "phases": ["main"], "position": "quad", "equipment": ["csuszka"], "focus": ["has", "far", "egyensuly"],
      "setup": "Lebegő tigris póz, az egyik lábfejed alatt csúszkával.",
      "steps": [
        "Első irány: csúsztasd hátra a lábad egyenesen, onnan nagy ívben hozd oldalra, majd húzd vissza a támasz alá.",
        "Második irány: csúsztasd a lábad egyenesen oldalra, onnan nagy ívben kanyarítsd hátra, majd hátulról egyenesen húzd vissza.",
        "A másik térded végig stabilan, egy centire lebeg a talaj felett."
      ],
      "repsText": "5 – 5 kör mindkét irányba, mindkét lábbal",
      "reps": { "sets": 1, "count": 5, "sides": "each", "unit": "round" },
      "prep": [ { "pose": "hover", "t": 1.8, "cue": "Térdek fel, lebegj." } ],
      "seq": [
        { "pose": "back", "t": 1.6, "st": 0, "cue": "Hátra, ívben oldalra, vissza." },
        { "pose": "arc", "t": 1.0, "nw": true },
        { "pose": "side", "t": 1.0, "nw": true },
        { "pose": "hover", "t": 1.4 },
        { "pose": "side", "t": 1.6, "st": 1, "cue": "Oldalra, ívben hátra, vissza." },
        { "pose": "arc", "t": 1.0, "nw": true },
        { "pose": "back", "t": 1.0, "nw": true },
        { "pose": "hover", "t": 1.4 },
        { "st": 2, "t": 0.2, "once": true }
      ],
      "post": [ { "pose": "start", "t": 1.5, "cue": "Térdek le, pihenj." } ]
    },

    {
      "id": "w01", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Hasi légzés", "sayName": "Hasi légzés.",
      "phases": ["warmup", "cooldown"], "position": "supine", "equipment": [], "focus": ["lazitas"],
      "setup": "Feküdj hanyatt, a térdeid hajlítva, a talpad a talajon. Tedd a kezeidet a hasadra.",
      "steps": [
        "Orron át lassan lélegezz be, és engedd, hogy a hasad megemelkedjen a kezed alatt.",
        "Szájon át lassan fújd ki a levegőt. A hasad lesüllyed, a köldököd finoman befelé húzódik."
      ],
      "repsText": "6 lassú légzés",
      "reps": { "sets": 1, "count": 6, "sides": "none", "unit": "breath" },
      "seq": [
        { "pose": "in", "t": 3.5, "st": 0, "cue": "Lassú belégzés orron át." },
        { "pose": "start", "t": 4.5, "st": 1, "cue": "Kilégzés szájon át, köldök be." }
      ]
    },
    {
      "id": "w02", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Térdkidöntögetés", "sayName": "Térdkidöntögetés.",
      "phases": ["warmup"], "position": "supine", "equipment": [], "focus": ["mobilitas", "lazitas"],
      "setup": "Feküdj hanyatt, a térdeid hajlítva, a talpaid a talajon, a karjaid kissé oldalra nyitva.",
      "steps": [
        "Lassan, lazán döntsd mindkét térdedet az egyik oldalra, csak addig, amíg kényelmes.",
        "Hozd vissza középre, majd döntsd a másik oldalra.",
        "A vállaid végig a talajon maradnak."
      ],
      "repsText": "8 – 8 db oldalanként",
      "reps": { "sets": 1, "count": 8, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "tilt", "t": 2.0, "st": 0, "cue": "Térdek oldalra." },
        { "pose": "start", "t": 1.8, "st": 1, "cue": "Vissza középre." },
        { "st": 2, "t": 0.2, "once": true }
      ]
    },
    {
      "id": "w03", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Medencebillentés hanyattfekvésben", "sayName": "Medencebillentés.",
      "phases": ["warmup"], "position": "supine", "equipment": [], "focus": ["mobilitas", "has"],
      "setup": "Feküdj hanyatt, a térdeid hajlítva, a talpaid a talajon, a karjaid a tested mellett.",
      "steps": [
        "Kilégzésre simítsd a derekadat a talajhoz, a szeméremcsontodat finoman billentsd a köldököd felé.",
        "Belégzésre engedd vissza, a derekad alatt egy kis homorulat keletkezik."
      ],
      "repsText": "10 db",
      "reps": { "sets": 1, "count": 10, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "tilt", "t": 2.0, "st": 0, "cue": "Kilégzés, derék le." },
        { "pose": "arch", "t": 2.0, "st": 1, "cue": "Belégzés, enged." }
      ]
    },
    {
      "id": "w04", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Macska – tehén (gerincmobilizálás)", "sayName": "Macska, tehén.",
      "phases": ["warmup"], "position": "quad", "equipment": [], "focus": ["mobilitas"],
      "setup": "Helyezkedj el négykézláb: a tenyereid a vállad alatt, a térdeid a csípőd alatt.",
      "steps": [
        "Kilégzésre gömbölyítsd a hátadat a plafon felé, az állad a mellkasod felé, a farkcsontod lefelé.",
        "Belégzésre lassan homoríts: a mellkasod előre nyílik, a tekinteted előre néz."
      ],
      "repsText": "8 db",
      "reps": { "sets": 1, "count": 8, "sides": "none", "unit": "rep" },
      "seq": [
        { "pose": "cat", "t": 2.5, "st": 0, "cue": "Kilégzés, gömbölyíts." },
        { "pose": "cow", "t": 2.5, "st": 1, "cue": "Belégzés, homoríts." }
      ]
    },
    {
      "id": "c01", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Gyermekpóz", "sayName": "Gyermekpóz.",
      "phases": ["cooldown"], "position": "kneel", "equipment": [], "focus": ["lazitas", "mobilitas"],
      "setup": "Térdelj le, ülj a sarkadra, majd hajolj előre, és nyújtsd a karjaidat előre a talajon. A homlokod pihenjen a talajon.",
      "steps": [
        "Lélegezz mélyen a hátad felé, a bordáid tágulnak.",
        "Minden kilégzéssel engedj egy kicsit mélyebbre, a csípőd a sarkad felé süllyed."
      ],
      "repsText": "5 mély légzés",
      "reps": { "sets": 1, "count": 5, "sides": "none", "unit": "breath" },
      "seq": [
        { "pose": "in", "t": 3.5, "st": 0, "cue": "Belégzés a hát felé." },
        { "pose": "start", "t": 4.5, "st": 1, "cue": "Kilégzés, engedj mélyebbre." }
      ]
    },
    {
      "id": "c02", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Térdek mellkashoz húzása", "sayName": "Térdek mellkashoz.",
      "phases": ["cooldown"], "position": "supine", "equipment": [], "focus": ["lazitas"],
      "setup": "Feküdj hanyatt, húzd fel mindkét térdedet, és kulcsold át őket a karjaiddal.",
      "steps": [
        "Kilégzésre finoman húzd a térdeidet a mellkasod felé, érezd, ahogy a derekad nyúlik.",
        "Belégzésre engedj egy kicsit."
      ],
      "repsText": "6 légzés",
      "reps": { "sets": 1, "count": 6, "sides": "none", "unit": "breath" },
      "seq": [
        { "pose": "pull", "t": 3.0, "st": 0, "cue": "Kilégzés, húzd a térdeket." },
        { "pose": "start", "t": 3.0, "st": 1, "cue": "Belégzés, engedj." }
      ]
    },
    {
      "id": "c03", "num": null, "source": "added", "group": "Kiegészítő bemelegítő / levezető gyakorlatok",
      "name": "Fekvő törzscsavarás", "sayName": "Fekvő törzscsavarás.",
      "phases": ["cooldown"], "position": "supine", "equipment": [], "focus": ["lazitas", "mobilitas"],
      "setup": "Feküdj hanyatt, a térdeid hajlítva, a karjaidat nyisd ki oldalra, vállmagasságban.",
      "steps": [
        "Döntsd mindkét térdedet az egyik oldalra, a fejedet fordítsd a másik irányba.",
        "Maradj így néhány nyugodt légzésen át, a vállaid a talajon maradnak.",
        "Hozd vissza a térdeidet középre."
      ],
      "repsText": "2 × 15 mp oldalanként",
      "reps": { "sets": 1, "count": 2, "sides": "alternate", "unit": "rep" },
      "seq": [
        { "pose": "twist", "t": 3.0, "st": 0, "cue": "Térdek oldalra, fej a másik irányba." },
        { "hold": 15, "st": 1, "cue": "Lélegezz nyugodtan." },
        { "pose": "start", "t": 2.5, "st": 2, "cue": "Vissza középre." }
      ]
    }
  ]
};
