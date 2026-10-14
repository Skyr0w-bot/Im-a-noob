# TikTok "What if…" Videos

Hinweis für jede neue Claude-Session: Lies diese Datei zuerst.

## Qualitäts-Maßstab (ab Video 3): Referenz "What if all women disappeared?"
- Weiches, realistisches Licht statt flacher Klötzchen: Umgebungsverdeckung (AO), Tiefenunschärfe bei Nahaufnahmen, Glow für Bildschirme/Feuer, Dunst in der Ferne, gedeckte Farben
- Figuren als glatte Schaufensterpuppen (Kapseln, Kugelkopf), keine Würfel
- Typografie: Serifenschrift (Source Serif 4) für Titel, große Zahl und kursive Untertitel; kleine, gesperrte Sans-Labels (Inter) in Akzentfarbe
- Layout: Titel mittig oben mit Icon; Zeit-Box links ("WITHOUT X" / "+1 WEEK" / kurze Fakt-Zeile); große Statistik oben mittig in Akzentfarbe ("90%"); kursiver Untertitel bei ca. 68 % Höhe
- Rhythmus: alle ~3 s ein neuer Zeitsprung (+10 SEC, +1 MIN, +1 HOUR, +1 DAY … +1 MONTH/YEARS), jedes Mal ein neues Set
- Finale: Erde aus dem All, Lichter gehen aus; danach Endkarte "PART 2 / What if …? / WHICH WOULD BE WORSE? TELL US IN THE COMMENTS"

## Format (Video 1 und 2: "What if every bee on Earth vanished?")
- Hochformat 1080×1920, 30 fps, Länge 60 bis 105 s
- 3D-Blockwelt im Minecraft-Stil (Three.js), flache Farben, weiche Schatten
- Aufbau als **Zeitstrahl**: Hook-Frage → Stunde/Tag/Monat/Jahr → Wende ("Rewind" in die echte Geschichte) → Erkenntnis → Schlussfrage, die zum Anfang zurückführt (Loop)
- **Info-Box** links (Inter): kleines Label (z. B. "HOUR 24"), große Zahl ("0.10 %"), kleine Erklärung
- **Untertitel** mittig unten (Montserrat Black, weiß mit schwarzer Kontur, Schlüsselwort gelb `#ffd23f`), ruhig ein- und ausgeblendet, ein Satz pro Szene, keine schnellen Wort-für-Wort-Untertitel
- **Keine Stimme.** Selbst erzeugte Musik (Pads, Arpeggio) und sparsame Soundeffekte: jeder Effekt nur dort, wo etwas passiert, nichts dauerhaft wiederholt

## Wichtigste Regel: Das Ende muss krass sein (Feedback von Luke)
- **Kein Rewind und kein "zum Glück ist das nie passiert".** Das nimmt dem Video die Spannung.
- Die Leute wollen **mehr und mehr** und wissen, **wie extrem das Ausmaß wirklich ist**. Jede Szene muss schlimmer sein als die davor (Eskalation), und die **letzte Szene ist die extremste und größte**.
- Die Zahlen und Folgen steigen von lokal (Person, Stadt) zu global (Land, Welt, Jahrzehnte). Das Finale zeigt das Endergebnis in Zahlen (Opfer, Prozent, Jahre) und lässt den Zuschauer mit einem harten Satz zurück.
- Schluss nicht mit "also schlaf schön", sondern mit der größten Konsequenz. Eine Schlussfrage oder ein offener Cliffhanger, der zum Anfang zurückführt, ist erlaubt.
- Fakten bleiben echt und belegbar. Extrem heißt nicht erfunden: Wenn die Wissenschaft unsicher ist, steht "Forscher schätzen" oder die Spanne im Text.
- Luke erlaubt, "ein bisschen zu übertreiben, um es spannend zu halten". Übertreibungen stehen dann als Möglichkeit im Text ("Maybe…", "In this timeline…"), die großen Zahlen bleiben echt.
- Technik-Lehren: Personen in einer Set-Gruppe immer mit lokalen Koordinaten platzieren (sonst doppelt verschoben). Lichter auf der Erde einzeln und weich ausblenden, nicht in Blöcken. Figuren brauchen Ellbogen, Knie und eine Ruhebewegung (`idle`). Höchstens 2 Render-Prozesse parallel.

## Videos
| # | Thema | Ordner | Status |
|---|---|---|---|
| 1 | What if every bee on Earth vanished? | (in einer alten Session erstellt, Quellcode nicht vorhanden) | fertig, gepostet |
| 2 | What if you never slept again? | `sleep/` | fertig, aber Ende zu schwach (Rewind, "heute schlafen 1 von 3 zu wenig"). Abgeschlossen, nicht überarbeitet |
| 3 | What if the internet shut off? | `internet/` | im neuen Qualitäts-Stil; Endkarte kündigt Part 2 an: "What if GPS stopped working?" |
| 4 | What if Roblox never existed? | `roblox/` | Alternative Geschichte 2004 → heute, Dinge werden "gelöscht"; Endkarte: "What if Minecraft never existed?" |

## Ideen-Liste für weitere Videos
What if the Moon vanished? · What if all trees disappeared? · What if all ants vanished? · What if the ocean rose 1 meter? · What if the sun went dark for 8 minutes? · What if everyone jumped at once? · What if all insects disappeared? · What if humans disappeared?

## So wird ein Video gebaut (Beispiel `sleep/`, `internet/` genauso)
```
cd sleep
node render.mjs --stills /tmp/st 1 20 40        # einzelne Testbilder
node render.mjs /tmp/frames 30 0 76             # alle Bilder (ca. 2 s pro Bild, parallel in 4 Bereichen starten)
python3 audio.py /tmp/audio.wav                 # Musik + Soundeffekte (braucht numpy, scipy)
ffmpeg -framerate 30 -i /tmp/frames/f%05d.jpg -i /tmp/audio.wav \
  -af loudnorm=I=-14:TP=-1.5 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4
```
- `timeline.js`: Szenen, Untertitel, Zeitpunkte der Soundeffekte (eine Quelle für alles)
- `index.html`: 3D-Welt (Stadt + Zimmer), Figur, Kameras pro Szene, Info-Box und Effekte
- Benötigt: Node + Playwright (Chromium), ffmpeg, Python mit numpy/scipy
- `internet/`: `engine.js` (Renderer, AO/DOF/Bloom, Lichtstimmungen), `lib.js` (Figuren, Autos, Bäume, Texturen), `city.js` (Stadt), `sets.js` (Innenräume, Hafen, Tankstelle, Erde), `main.js` (Szenen + Overlays). 3D wird in 720×1280 gerendert, Text in 1080×1920. Ca. 3,5 s pro Bild
