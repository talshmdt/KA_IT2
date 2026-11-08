
 // Erstellt die Variablen für die Bilder der Landschaft
let wolkenBild;
let sonnenBild;
let bergeBild;
let huegelBild;
let wasserBild;
let baeumeHintenBild;
let wiesenBild;
let vordergrundBild;

// Lädt alle Bilder, bevor das Programm startet
function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  baeumeHintenBild = loadImage("1baeumehinten.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("1vordergrund.svg");
}

// Erstellt die Variablen für das Mikrofon
let mikrofon;
let lautstaerke;
let startKnopf;

// Variablen für die Frequenzen und die Baumbewegung
let fft;
let baumWinkel = 0;
let baumZeit = 0;

let wolken = []; // Liste für alle Wolken
let regler; // Regler für die Anzahl der Wolken

// Erstellt eine Klasse für alle Wolken
class Wolke {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.geschwindigkeit = random(0.5, 2);
  }

  // Bewegt die Wolke nach rechts
  bewegen() {
    this.x = this.x + this.geschwindigkeit;

    if (this.x > width) {
      this.x = -100;
      this.y = random(0, 100);
      this.geschwindigkeit = random(0.5, 2);
    }
  }

  // Zeigt die Wolke an
  anzeigen() {
    image(wolkenBild, this.x, this.y, 100, 60);
  }
}

// Wird einmal beim Start ausgeführt
function setup() {
  createCanvas(750, 500);

  // Erstellt 100 Wolken
  for (let i = 0; i < 100; i++) {
    let x = random(-100, 800);
    let y = random(0, 100);

    wolken.push(new Wolke(x, y));
  }

  // Regler für die Anzahl der Wolken
  regler = createSlider(0, 100, 30, 1);

  // Button zum Starten des Mikrofons
  startKnopf = createButton("Mikrofon starten");
  startKnopf.mousePressed(starteMikrofon);
}

// Startet das Mikrofon
async function starteMikrofon() {
  await userStartAudio();

  mikrofon = new p5.AudioIn();
  mikrofon.start();

  // Analysiert die verschiedenen Frequenzen
  fft = new p5.FFT();
  fft.setInput(mikrofon);

  startKnopf.html("Mikrofon gestartet");
}

// Wird ständig wiederholt
function draw() {
  background(135, 206, 235);

  lautstaerke = 0;

  // Misst die Lautstärke
  if (mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();
  }

  // Zeichnet die Sonne
  image(sonnenBild, 50, 30, 120, 120);

  // Berechnet die Helligkeit der Wolken
  let helligkeit = map(lautstaerke, 0, 0.2, 255, 60);
  helligkeit = constrain(helligkeit, 60, 255);

  tint(helligkeit);

  // Bewegt und zeichnet die Wolken
  for (let i = 0; i < regler.value(); i++) {
    wolken[i].bewegen();
    wolken[i].anzeigen();
  }

  noTint();

  // Zeichnet die Landschaft
  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);

  // NEU: Bäume reagieren auf verschiedene Frequenzen
  if (fft) {
    fft.analyze();

    let tief = fft.getEnergy("bass");
    let hoch = fft.getEnergy("treble");

    // Tiefe Frequenzen = schnelle Bewegung
    // Hohe Frequenzen = langsame Bewegung
    let geschwindigkeit = map(
      tief - hoch, -255, 255, 0.01, 0.2
    );

    baumZeit += geschwindigkeit;

    // Berechnet das Hin- und Herwackeln
    baumWinkel = sin(baumZeit) * 0.03;
  }

  // Zeichnet die wackelnden Bäume
  push();
  translate(375, 500);
  rotate(baumWinkel);
  image(baeumeHintenBild, -375, -500, 750, 500);
  pop();

  // Zeichnet die restliche Landschaft
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
}
