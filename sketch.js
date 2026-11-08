// Frequenz-Landschaft: Wolken reagieren auf Lautstärke, Bäume auf Frequenzen.
let wolkenBild, sonnenBild, bergeBild, huegelBild, wasserBild, wiesenBild, vordergrundBild;
let mikrofon, fft, lautstaerke = 0;
let wolken = [], baeume = [];
let wolkenRegler, wolkenSchwelle, baumSchwelle;
let startKnopf, stoppKnopf, demoKnopf, statusText;
let modus = "aus"; // "aus", "audio" oder "demo"
let demoZeit = 0;

function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("vordergrund_ohne_baeume.svg");

  // Jede Baumgruppe hat eine eigene SVG-Datei und einen Frequenzbereich in Hz.
  // Tiefe Frequenzen führen zu schnellerem Wackeln.
  baeume = [
    {bild: loadImage("baum_hinten_1.svg"), hinten: true, x: 39, y: 235, tief: 60, hoch: 180, tempo: 0.35, winkel: 0},
    {bild: loadImage("baum_hinten_2.svg"), hinten: true, x: 735, y: 220, tief: 180, hoch: 350, tempo: 0.29, winkel: 0},
    {bild: loadImage("baum_vorne_1.svg"), hinten: false, x: 639, y: 330, tief: 350, hoch: 700, tempo: 0.23, winkel: 0},
    {bild: loadImage("baum_vorne_2.svg"), hinten: false, x: 660, y: 495, tief: 700, hoch: 1300, tempo: 0.17, winkel: 0},
    {bild: loadImage("baum_vorne_3.svg"), hinten: false, x: 119, y: 265, tief: 1300, hoch: 2600, tempo: 0.12, winkel: 0},
    {bild: loadImage("baum_vorne_4.svg"), hinten: false, x: 125, y: 495, tief: 2600, hoch: 5000, tempo: 0.08, winkel: 0}
  ];
}

// Eigene Klasse mit Konstruktor, Eigenschaften und Methoden.
class Wolke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.geschwindigkeit = random(0.5, 2);
  }
  bewegen() {
    this.x += this.geschwindigkeit;
    if (this.x > width) {
      this.x = -100;
      this.y = random(0, 100);
      this.geschwindigkeit = random(0.5, 2);
    }
  }
  anzeigen() {
    image(wolkenBild, this.x, this.y, 100, 60);
  }
}

function setup() {
  let zeichenflaeche = createCanvas(750, 500);
  zeichenflaeche.parent("zeichenflaeche");
  for (let i = 0; i < 100; i++) {
    wolken.push(new Wolke(random(-100, 800), random(0, 100)));
  }

  let steuerung = select("#steuerung");
  let knoepfe = createDiv();
  knoepfe.class("knopfreihe");
  knoepfe.parent(steuerung);
  startKnopf = createButton("Audio starten");
  startKnopf.parent(knoepfe);
  startKnopf.mousePressed(starteMikrofon);
  stoppKnopf = createButton("Audio / Demo stoppen");
  stoppKnopf.parent(knoepfe);
  stoppKnopf.mousePressed(stoppeAlles);
  demoKnopf = createButton("Demo-Modus starten");
  demoKnopf.parent(knoepfe);
  demoKnopf.mousePressed(starteDemo);

  let reglerZeile = createDiv();
  reglerZeile.class("reglerreihe");
  reglerZeile.parent(steuerung);
  wolkenRegler = erstelleRegler(reglerZeile, "Anzahl der Wolken", 0, 100, 30, 1);
  wolkenSchwelle = erstelleRegler(reglerZeile, "Wolken-Empfindlichkeit", 1, 100, 50, 1);
  baumSchwelle = erstelleRegler(reglerZeile, "Baum-Schwellenwert", 0, 255, 100, 1);
  statusText = createP("Status: Audio aus");
  statusText.id("status");
  statusText.parent(steuerung);
}

function erstelleRegler(eltern, name, min, max, wert, schritt) {
  let gruppe = createDiv();
  gruppe.class("reglergruppe");
  gruppe.parent(eltern);
  let beschriftung = createSpan(name + ": " + wert);
  beschriftung.parent(gruppe);
  let regler = createSlider(min, max, wert, schritt);
  regler.parent(gruppe);
  regler.input(() => beschriftung.html(name + ": " + regler.value()));
  return regler;
}

async function starteMikrofon() {
  stoppeAlles();
  statusText.html("Status: Audio wird gestartet ...");
  try {
    // Der Browser fragt erst nach dem Klick nach der Audiofreigabe.
    await userStartAudio();
    let neuesMikrofon = new p5.AudioIn();
    mikrofon = neuesMikrofon;
    neuesMikrofon.start(() => {
      if (mikrofon !== neuesMikrofon) {
        neuesMikrofon.stop();
        return;
      }
      fft = new p5.FFT(0.8, 1024);
      fft.setInput(mikrofon);
      modus = "audio";
      statusText.html("Status: Audio aktiv – Synthesizer spielen");
    }, (fehler) => {
      if (mikrofon !== neuesMikrofon) return;
      mikrofon = undefined;
      fft = undefined;
      modus = "aus";
      statusText.html("Fehler: Audioeingang nicht verfügbar oder Zugriff verweigert. Browserfreigabe und Interface prüfen.");
      console.error(fehler);
    });
  } catch (fehler) {
    modus = "aus";
    statusText.html("Fehler: Audio konnte nicht gestartet werden. Seite über localhost/HTTPS öffnen und Zugriff erlauben.");
    console.error(fehler);
  }
}

function stoppeAlles() {
  modus = "aus";
  fft = undefined;
  if (mikrofon) mikrofon.stop();
  mikrofon = undefined;
  lautstaerke = 0;
  if (statusText) statusText.html("Status: Audio und Demo gestoppt");
}

function starteDemo() {
  stoppeAlles();
  demoZeit = 0;
  modus = "demo";
  statusText.html("Status: Demo-Modus aktiv (ohne Mikrofon)");
}

// Energie eines Baumes: entweder gemessener Wert oder simulierter Demo-Wert.
function baumEnergie(baum, nummer) {
  if (modus === "audio" && fft) return fft.getEnergy(baum.tief, baum.hoch);
  if (modus === "demo") {
    // Jede Baumgruppe bekommt zeitversetzt einen eigenen Frequenz-Impuls.
    let phase = (demoZeit / 55 + nummer * 0.85) % 6;
    return phase < 1.5 ? 190 : 0;
  }
  return 0;
}

function zeichneBaeume(hinten) {
  for (let i = 0; i < baeume.length; i++) {
    let baum = baeume[i];
    if (baum.hinten !== hinten) continue;
    let energie = baumEnergie(baum, i);
    let zielWinkel = 0;
    if (energie > baumSchwelle.value()) {
      zielWinkel = sin(frameCount * baum.tempo) * 0.035;
    }
    // Bei Stille kehrt der Baum sanft in die Ausgangsposition zurück.
    baum.winkel = lerp(baum.winkel, zielWinkel, 0.2);
    push();
    translate(baum.x, baum.y);
    rotate(baum.winkel);
    image(baum.bild, -baum.x, -baum.y, 750, 500);
    pop();
  }
}

function draw() {
  background(135, 206, 235);
  lautstaerke = 0;
  if (modus === "audio" && mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();
    if (fft) fft.analyze();
  }
  if (modus === "demo") {
    demoZeit++;
    lautstaerke = (sin(demoZeit * 0.06) + 1) * 0.07;
  }

  image(sonnenBild, 50, 30, 120, 120);
  // Der Wolkenregler steuert, ab welcher Lautstärke die Wolken dunkler werden.
  let empfindlichkeit = map(wolkenSchwelle.value(), 1, 100, 0.3, 0.03);
  let helligkeit = constrain(map(lautstaerke, 0, empfindlichkeit, 255, 60), 60, 255);
  tint(helligkeit);
  for (let i = 0; i < wolkenRegler.value(); i++) {
    wolken[i].bewegen();
    wolken[i].anzeigen();
  }
  noTint();

  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);
  zeichneBaeume(true);
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
  zeichneBaeume(false);
}
