let wolkenBild, sonnenBild, bergeBild, huegelBild, wasserBild, wiesenBild, vordergrundBild;
let einzelBaumBild; // Bild für die neue Baumreihe

let mikrofon, fft, lautstaerke = 0;
let wolken = [], baeume = [], hintergrundBaeume = [];
let regentropfen = [];

let wolkenRegler, wolkenSchwelle, baumSchwelle, hintergrundRegler;
let startKnopf, stoppKnopf, demoKnopf, statusText;

// Legt fest, welcher Modus gerade aktiv ist
// "aus" = kein Audio, "audio" = echtes Audiosignal, "demo" = Demo- Modus
let modus = "aus";
let demoZeit = 0;


// Lädt alle Bilder vor dem Programmstart
function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("vordergrund_ohne_baeume.svg");

  // Lädt das Bild für die neue Baumreihe
  einzelBaumBild = loadImage("baum_einzeln.svg");

  // Erstellt die bisherigen sechs Baumgruppen
  // Jede Baumgruppe reagiert auf einen eigenen Frequenzbereich
  baeume = [
    new Baum("baum_hinten_1.svg", true, 39, 235, 60, 180, 0.35),
    new Baum("baum_hinten_2.svg", true, 735, 220, 180, 350, 0.29),
    new Baum("baum_vorne_1.svg", false, 639, 330, 350, 700, 0.23),
    new Baum("baum_vorne_2.svg", false, 660, 495, 700, 1300, 0.17),
    new Baum("baum_vorne_3.svg", false, 119, 265, 1300, 2600, 0.12),
    new Baum("baum_vorne_4.svg", false, 125, 495, 2600, 5000, 0.08)
  ];

  // Erstellt acht zusätzliche Bäume hinter der Wasserfläche
  // Jeder Baum bekommt eine eigene Position und einen Frequenzbereich
  hintergrundBaeume = [
    new Baum(einzelBaumBild, true, 80, 255, 60, 150, 0.35, true),
    new Baum(einzelBaumBild, true, 165, 253, 150, 300, 0.31, true),
    new Baum(einzelBaumBild, true, 250, 253, 300, 500, 0.27, true),
    new Baum(einzelBaumBild, true, 335, 255, 500, 800, 0.23, true),
    new Baum(einzelBaumBild, true, 420, 250, 800, 1200, 0.19, true),
    new Baum(einzelBaumBild, true, 505, 247, 1200, 2000, 0.15, true),
    new Baum(einzelBaumBild, true, 590, 250, 2000, 3200, 0.11, true),
    new Baum(einzelBaumBild, true, 675, 252, 3200, 5000, 0.08, true)
  ];
}


// Erstellung einer Klasse für alle Wolken
class Wolke {

  // Legt die Anfangswerte einer Wolke fest
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.geschwindigkeit = random(0.5, 2);
  }

  // Methode zum Bewegen der Wolke
  bewegen() {
    this.x += this.geschwindigkeit;

    // Setzt die Wolke wieder an den linken Rand
    if (this.x > width) {
      this.x = -100;
      this.y = random(0, 100);
      this.geschwindigkeit = random(0.5, 2);
    }
  }

  // Methode zum Anzeigen der Wolke
  anzeigen() {
    image(wolkenBild, this.x, this.y, 100, 60);
  }
}


// Erstellung einer Klasse für alle Bäume
class Baum {

  // Legt die Anfangswerte eines Baumes fest
  constructor(bild, hinten, x, y, tief, hoch, tempo, einzeln = false) {
    // Lädt die bisherigen SVG-Dateien oder verwendet das bereits geladene Einzelbild
    this.bild = einzeln ? bild : loadImage(bild);
    this.hinten = hinten;
    this.x = x;
    this.y = y;
    this.tief = tief;
    this.hoch = hoch;
    this.tempo = tempo;
    this.winkel = 0;
    this.einzeln = einzeln;
  }

  // Methode zum Bewegen des Baumes
  bewegen(nummer) {
    let energie = baumEnergie(this, nummer);
    let zielWinkel = 0;

    // Der Baum wackelt, wenn genügend Energie vorhanden ist
    if (energie > baumSchwelle.value()) {
      zielWinkel = sin(frameCount * this.tempo) * 0.035;
    }

    // Sorgt für eine weiche Bewegung
    this.winkel = lerp(this.winkel, zielWinkel, 0.2);
  }

  // Methode zum Anzeigen des Baumes
  anzeigen() {
    push();
    translate(this.x, this.y);
    rotate(this.winkel);

    if (this.einzeln) {
      // Zeichnet den einzelnen Baum mit dem Drehpunkt unten am Stamm
      image(this.bild, -35, -75, 70, 75);
    } else {
      // Zeichnet die bisherigen Baumgruppen
      image(this.bild, -this.x, -this.y, 750, 500);
    }

    pop();
  }
}


// Erstellung einer Klasse für alle Regentropfen
class Regentropfen {

  constructor() {
    this.x = random(0, 750);
    this.y = random(50, 100);
    this.zielY = random(270, 400);
    this.kreis = 0;
  }

  bewegen() {
    // Regentropfen fällt nach unten
    if (this.y < this.zielY) {
      this.y += 10;
    } else {
      // Kreis wird größer
      this.kreis += 0.5;
    }

    // Regentropfen startet erneut
    if (this.kreis > 40) {
      this.x = random(0, 750);
      this.y = random(50, 100);
      this.kreis = 0;
    }
  }

  anzeigen() {
    push();

    if (this.y < this.zielY) {
      // Regentropfen zeichnen
      stroke(200, 230, 255);
      line(this.x, this.y - 10, this.x, this.y);
    } else {
      // Kreis zeichnen und ausblenden
      noFill();
      stroke(255, 255, 255, 255 - this.kreis * 6);
      ellipse(this.x, this.zielY, this.kreis, this.kreis / 3);
    }

    pop();
  }
}


// Wird einmal beim Start des Programms ausgeführt
function setup() {
  let zeichenflaeche = createCanvas(750, 500);
  zeichenflaeche.parent("zeichenflaeche");

  // Erstellt 100 Wolken mit zufälligen Positionen
  for (let i = 0; i < 100; i++) {
    wolken.push(new Wolke(random(-100, 800), random(0, 100)));
  }

  // Erstellt 30 Regentropfen
  for (let i = 0; i < 30; i++) {
    regentropfen.push(new Regentropfen());
  }

  let steuerung = select("#steuerung");
  let knoepfe = createDiv();
  knoepfe.class("knopfreihe");
  knoepfe.parent(steuerung);

  // Button zum Starten des Audiosignals
  startKnopf = createButton("Audio starten");
  startKnopf.parent(knoepfe);
  startKnopf.mousePressed(starteMikrofon);

  // Button zum Stoppen
  stoppKnopf = createButton("Audio / Demo stoppen");
  stoppKnopf.parent(knoepfe);
  stoppKnopf.mousePressed(stoppeAlles);

  // Button für den Demo-Modus
  demoKnopf = createButton("Demo-Modus starten");
  demoKnopf.parent(knoepfe);
  demoKnopf.mousePressed(starteDemo);

  // Erstellt den Bereich für die Regler
  let reglerZeile = createDiv();
  reglerZeile.class("reglerreihe");
  reglerZeile.parent(steuerung);

  // Regler für die Wolkenanzahl
  wolkenRegler = erstelleRegler(reglerZeile, "Anzahl der Wolken", 0, 100, 30, 1);

  // Gemeinsamer Regler für Wolken und Regen
  wolkenSchwelle = erstelleRegler(reglerZeile, "Wolken- und Regenempfindlichkeit", 1, 100, 50, 1);

  // Regler für die Baumbewegung
  baumSchwelle = erstelleRegler(reglerZeile, "Baum-Schwellenwert", 0, 255, 100, 1);

  // Regler für die Anzahl der Hintergrundbäume
  hintergrundRegler = erstelleRegler(reglerZeile, "Anzahl der Bäume", 0, 8, 4, 1);

  // Zeigt den aktuellen Status an
  statusText = createP("Status: Audio aus");
  statusText.id("status");
  statusText.parent(steuerung);
}


// Erstellt einen Regler mit einer Beschriftung
function erstelleRegler(eltern, name, min, max, wert, schritt) {
  let gruppe = createDiv();
  gruppe.class("reglergruppe");
  gruppe.parent(eltern);

  let beschriftung = createSpan(name + ": " + wert);
  beschriftung.parent(gruppe);

  let regler = createSlider(min, max, wert, schritt);
  regler.parent(gruppe);

  // Aktualisiert die Beschriftung beim Bewegen des Reglers
  regler.input(() => beschriftung.html(name + ": " + regler.value()));

  return regler;
}


// Startet den Audioeingang des Computers
async function starteMikrofon() {
  stoppeAlles();
  statusText.html("Status: Audio wird gestartet...");

  try {
    // Fordert die Erlaubnis für den Audiozugriff an
    await userStartAudio();

    let neuesMikrofon = new p5.AudioIn();
    mikrofon = neuesMikrofon;

    neuesMikrofon.start(() => {

      // Prüft, ob dieser Audioeingang noch verwendet werden soll
      if (mikrofon !== neuesMikrofon) {
        neuesMikrofon.stop();
        return;
      }

      // Erstellt die Frequenzanalyse
      fft = new p5.FFT(0.8, 1024);
      fft.setInput(mikrofon);

      modus = "audio";
      statusText.html("Status: Audio aktiv – Synthesizer spielen");
    },

    // Wird bei einem Fehler ausgeführt
    (fehler) => {
      if (mikrofon !== neuesMikrofon) return;

      mikrofon = undefined;
      fft = undefined;
      modus = "aus";

      statusText.html("Fehler: Audioeingang nicht verfügbar oder Zugriff verweigert.");
      console.error(fehler);
    });

  } catch (fehler) {
    modus = "aus";
    statusText.html("Fehler: Audio konnte nicht gestartet werden.");
    console.error(fehler);
  }
}


// Stoppt Audio und Demo
function stoppeAlles() {
  modus = "aus";
  fft = undefined;

  if (mikrofon) mikrofon.stop();

  mikrofon = undefined;
  lautstaerke = 0;

  if (statusText) {
    statusText.html("Status: Audio und Demo gestoppt");
  }
}


// Startet den Demo-Modus ohne Mikrofon
function starteDemo() {
  stoppeAlles();
  demoZeit = 0;
  modus = "demo";

  statusText.html("Status: Demo-Modus aktiv (ohne Mikrofon)");
}


// Bestimmt die Energie im Frequenzbereich eines Baumes
function baumEnergie(baum, nummer) {

  // Misst die echte Energie im Audio-Modus
  if (modus === "audio" && fft) {
    return fft.getEnergy(baum.tief, baum.hoch);
  }

  // Erzeugt künstliche Energie im Demo-Modus
  if (modus === "demo") {
    let phase = (demoZeit / 55 + nummer * 0.85) % 6;

    return phase < 1.5 ? 190 : 0;
  }

  return 0;
}


// Zeichnet die bisherigen Bäume
function zeichneBaeume(hinten) {
  for (let i = 0; i < baeume.length; i++) {
    if (baeume[i].hinten === hinten) {
      baeume[i].bewegen(i);
      baeume[i].anzeigen();
    }
  }
}


// Zeichnet die neue Baumreihe hinter der Wasserfläche
function zeichneHintergrundBaeume() {
  for (let i = 0; i < hintergrundRegler.value(); i++) {
    hintergrundBaeume[i].bewegen(i + baeume.length);
    hintergrundBaeume[i].anzeigen();
  }
}


// Wird ständig wiederholt (ca. 60-mal pro Sekunde)
function draw() {
  background(135, 206, 235);
  lautstaerke = 0;

  // Misst die Lautstärke und analysiert die Frequenzen
  if (modus === "audio" && mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();

    if (fft) fft.analyze();
  }

  // Erzeugt eine künstliche Lautstärke im Demo-Modus
  if (modus === "demo") {
    demoZeit++;
    lautstaerke = (sin(demoZeit * 0.06) + 1) * 0.07;
  }

  // Zeichnet die Sonne
  image(sonnenBild, 50, 30, 120, 120);

  // Berechnet die Empfindlichkeit und Helligkeit der Wolken
  let empfindlichkeit = map(wolkenSchwelle.value(), 1, 100, 0.3, 0.03);
  let helligkeit = constrain(map(lautstaerke, 0, empfindlichkeit, 255, 60), 60, 255);

  tint(helligkeit);

  // Bewegt und zeichnet die Wolken
  for (let i = 0; i < wolkenRegler.value(); i++) {
    wolken[i].bewegen();
    wolken[i].anzeigen();
  }

  noTint();

  // Zeichnet die Landschaft in der richtigen Reihenfolge
  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);

  // Neue Baumreihe hinter dem Wasser
  zeichneHintergrundBaeume();

  // Wasser und bisherige Baumgruppen
  image(wasserBild, 0, 0, 750, 500);
  zeichneBaeume(true);

  // Berechnet die Anzahl der Regentropfen anhand der Lautstärke
  let regenAnzahl = floor(constrain(map(lautstaerke, 0, empfindlichkeit, 0, 30), 0, 30));

  // Bewegt und zeichnet die Regentropfen
  for (let i = 0; i < regenAnzahl; i++) {
    regentropfen[i].bewegen();
    regentropfen[i].anzeigen();
  }

  // Vordergrund
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
  zeichneBaeume(false);
}