
let wolkenBild;
let sonnenBild;
let bergeBild;
let huegelBild;
let wasserBild;
let baeumeHintenBild;
let wiesenBild;
let vordergrundBild;

let mikrofon;
let startKnopf;
let wolken = [];
let regler;

let wolkenHelligkeit = 255;

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
    let x = random(-100, width);
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

  startKnopf.html("Mikrofon gestartet");
}

function tonhoeheErkennen() {
  let signal = mikrofon.getValue();
  let abtastrate = sampleRate();

  let besteFrequenz = 0;
  let besteUebereinstimmung = 0;

  let kleinsterAbstand = floor(abtastrate / 400);
  let groessterAbstand = floor(abtastrate / 80);

  for (let abstand = kleinsterAbstand; abstand <= groessterAbstand; abstand++) {
    let uebereinstimmung = 0;
    let energie = 0;

    for (let i = 0; i < signal.length - abstand; i++) {
      uebereinstimmung += signal[i] * signal[i + abstand];
      energie += signal[i] * signal[i];
    }

    if (energie > 0) {
      uebereinstimmung = uebereinstimmung / energie;
    }

    if (uebereinstimmung > besteUebereinstimmung) {
      besteUebereinstimmung = uebereinstimmung;
      besteFrequenz = abtastrate / abstand;
    }
  }

  if (besteUebereinstimmung > 0.8) {
    return besteFrequenz;
  }

  return 0;
}

function draw() {
  background(135, 206, 235);

  let helligkeit = 255;

  if (mikrofon && mikrofon.enabled) {
    let lautstaerke = mikrofon.getLevel();

    if (lautstaerke > 0.01) {
      let frequenz = tonhoeheErkennen();

      if (frequenz > 0) {
        helligkeit = map(frequenz, 80, 400, 60, 255);
        helligkeit = constrain(helligkeit, 60, 255);
      }
    }
  }

  image(sonnenBild, 50, 30, 120, 120);

  wolkenHelligkeit = lerp(wolkenHelligkeit, helligkeit, 0.05);

  tint(wolkenHelligkeit);

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
