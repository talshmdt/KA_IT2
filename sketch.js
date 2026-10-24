
let wolkenBild;
let sonnenBild;
let bergeBild;
let huegelBild;
let wasserBild;
let baeumeHintenBild;
let wiesenBild;
let vordergrundBild;
let fft;

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

let mikrofon;
let lautstaerke;
let startKnopf;
let wolken = [];
let regler;

class Wolke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.geschwindigkeit = random(0.5, 2);
  }

  bewegen() {
    this.x = this.x + this.geschwindigkeit;

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
    let x = random(-100, 800);
    let y = random(0, 100);

    wolken.push(new Wolke(x, y));
  }

  regler = createSlider(0, 100, 30, 1);

  startKnopf = createButton("Mikrofon starten");
  startKnopf.mousePressed(starteMikrofon);
}

async function starteMikrofon() {
  await userStartAudio();

  mikrofon = new p5.AudioIn();
  mikrofon.start();

  fft = new p5.FFT();
  fft.setInput(mikrofon);

  startKnopf.html("Mikrofon gestartet");
}

function draw() {
  background(135, 206, 235);

  let helligkeit = 255;

  if (fft) {
    fft.analyze();

    let tief = fft.getEnergy(60, 130);

    if (tief > 160) {
      helligkeit = 70;
    } else if (tief > 100) {
      helligkeit = 170;
    } else {
      helligkeit = 255;
    }
  }

  lautstaerke = 0;

  if (mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();
  }

  image(sonnenBild, 50, 30, 120, 120);

  tint(helligkeit);

  for (let i = 0; i < regler.value(); i++) {
    wolken[i].bewegen();
    wolken[i].anzeigen();
  }

  noTint();

  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);
  image(baeumeHintenBild, 0, 0, 750, 500);
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
}
