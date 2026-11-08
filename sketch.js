// Bilder der Landschaft
let wolkenBild, sonnenBild, bergeBild, huegelBild, wasserBild, wiesenBild, vordergrundBild;
let mikrofon, lautstaerke = 0, startKnopf, fft;
let wolken = [], regler, baeume = [];

function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("vordergrund_ohne_baeume.svg");

  // Jeder Baum hat sein eigenes Bild, einen Frequenzbereich und ein Tempo.
  // Tiefe Frequenzen = schnelles Wackeln, hohe Frequenzen = langsames Wackeln.
  baeume = [
    {bild: loadImage("baum_hinten_1.svg"), hinten: true, x: 39, y: 235, tief: 60, hoch: 180, tempo: 0.35},
    {bild: loadImage("baum_hinten_2.svg"), hinten: true, x: 735, y: 220, tief: 180, hoch: 350, tempo: 0.29},
    {bild: loadImage("baum_vorne_1.svg"), hinten: false, x: 639, y: 330, tief: 350, hoch: 700, tempo: 0.23},
    {bild: loadImage("baum_vorne_2.svg"), hinten: false, x: 660, y: 495, tief: 700, hoch: 1300, tempo: 0.17},
    {bild: loadImage("baum_vorne_3.svg"), hinten: false, x: 119, y: 265, tief: 1300, hoch: 2600, tempo: 0.12},
    {bild: loadImage("baum_vorne_4.svg"), hinten: false, x: 125, y: 495, tief: 2600, hoch: 5000, tempo: 0.08}
  ];
}

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
  createCanvas(750, 500);
  for (let i = 0; i < 100; i++) {
    wolken.push(new Wolke(random(-100, 800), random(0, 100)));
  }
  regler = createSlider(0, 100, 30, 1);
  startKnopf = createButton("Mikrofon starten");
  startKnopf.mousePressed(starteMikrofon);
}

async function starteMikrofon() {
  await userStartAudio();
  mikrofon = new p5.AudioIn();
  mikrofon.start(() => {
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mikrofon);
    startKnopf.html("Mikrofon gestartet");
  });
}

// Zeichnet die Bäume einer Landschaftsebene.
function zeichneBaeume(hinten) {
  for (let baum of baeume) {
    if (baum.hinten !== hinten) continue;

    let winkel = 0;
    if (fft) {
      let energie = fft.getEnergy(baum.tief, baum.hoch);
      // Nur bei hörbarem Signal im eigenen Frequenzbereich wackeln.
      if (energie > 100) {
        winkel = sin(frameCount * baum.tempo) * 0.035;
      }
    }

    push();
    translate(baum.x, baum.y); // Drehpunkt nahe dem Stamm
    rotate(winkel);
    image(baum.bild, -baum.x, -baum.y, 750, 500);
    pop();
  }
}

function draw() {
  background(135, 206, 235);
  lautstaerke = 0;
  if (mikrofon && mikrofon.enabled) lautstaerke = mikrofon.getLevel();
  if (fft) fft.analyze(); // Einmal pro Bild alle Frequenzen messen

  image(sonnenBild, 50, 30, 120, 120);
  let helligkeit = constrain(map(lautstaerke, 0, 0.2, 255, 60), 60, 255);
  tint(helligkeit);
  for (let i = 0; i < regler.value(); i++) {
    wolken[i].bewegen();
    wolken[i].anzeigen();
  }
  noTint();

  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);
  zeichneBaeume(true); // Hintere Bäume
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500); // Steine und Sträucher bleiben stehen
  zeichneBaeume(false); // Vordere Bäume
}
