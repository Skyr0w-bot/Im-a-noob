# TikTok "What if…" Videos

Hinweis für jede neue Claude-Session: Lies diese Datei zuerst.

## Format (Vorbild: "What if every bee on Earth vanished?")
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

## Videos
| # | Thema | Ordner | Status |
|---|---|---|---|
| 1 | What if every bee on Earth vanished? | (in einer alten Session erstellt, Quellcode nicht vorhanden) | fertig, gepostet |
| 2 | What if you never slept again? | `sleep/` | fertig, aber Ende zu schwach (Rewind, "heute schlafen 1 von 3 zu wenig"). Abgeschlossen, nicht überarbeitet |

## Ideen-Liste für weitere Videos
What if the Moon vanished? · What if all trees disappeared? · What if the internet shut off for 24 hours? · What if all ants vanished? · What if the ocean rose 1 meter? · What if the sun went dark for 8 minutes? · What if everyone jumped at once? · What if all insects disappeared? · What if humans disappeared?

## So wird ein Video gebaut (Beispiel `sleep/`)
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
