
let wolkenBild, sonnenBild, bergeBild, huegelBild;
let wasserBild, baeumeHintenBild, wiesenBild, vordergrundBild;

let mikrofon, fft, startKnopf, regler;
let wolken = [];
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

function setup() {
  createCanvas(750, 500);

  for (let i = 0; i < 100; i++) {
    wolken.push({
      x: random(-100, 750),
      y: random(0, 100),
      tempo: random(0.5, 2)
    });
  }

  regler = createSlider(0, 100, 30);

  startKnopf = createButton("Mikrofon starten");
  startKnopf.mousePressed(starteMikrofon);
}

async function starteMikrofon() {
  await userStartAudio();

  mikrofon = new p5.AudioIn();
  mikrofon.start();

  fft = new p5.FFT(0.8, 2048);
  fft.setInput(mikrofon);

  startKnopf.html("Mikrofon gestartet");
}

function draw() {
  background(135, 206, 235);

  let helligkeit = 255;

  if (fft && mikrofon.getLevel() > 0.005) {
    let spektrum = fft.analyze();
    let frequenz = 0;
    let staerke = 0;

    for (let i = 4; i < 19; i++) {
      if (spektrum[i] > staerke) {
        staerke = spektrum[i];
        frequenz = i * sampleRate() / 2048;
      }
    }

    if (staerke > 15) {
      helligkeit = map(frequenz, 80, 400, 60, 255);
      helligkeit = constrain(helligkeit, 60, 255);
    }
  }

  image(sonnenBild, 50, 30, 120, 120);

  wolkenHelligkeit = lerp(wolkenHelligkeit, helligkeit, 0.05);
  tint(wolkenHelligkeit);

  for (let i = 0; i < regler.value(); i++) {
    let wolke = wolken[i];

    wolke.x += wolke.tempo;

    if (wolke.x > width) {
      wolke.x = -100;
      wolke.y = random(0, 100);
    }

    image(wolkenBild, wolke.x, wolke.y, 100, 60);
  }

  noTint();

  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);
  image(baeumeHintenBild, 0, 0, 750, 500);
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
}
