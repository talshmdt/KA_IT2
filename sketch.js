
let wolkenBild;
let sonnenBild;
let bergeBild;
let umgebungBild;
let wasserBild;
let baeumeBild;

function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("berge.svg");
  umgebungBild = loadImage("umgebung.svg");
  wasserBild = loadImage("wasser.svg");
  baeumeBild = loadImage("baeume.svg");
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

    if (this.x > 800) {
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
  createCanvas(800, 500);

 
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

  startKnopf.html("Mikrofon gestartet");
}

function draw() {
  background(135, 206, 235);

  lautstaerke = 0;

  if (mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();
  }

image(bergeBild, 0,0, 800, 500);
image(wasserBild, 0, 0, 800, 500);
image(umgebungBild, 0, 0, 800, 500);
image(baeumeBild, 0, 0, 800, 500);
image(sonnenBild, 50, 30, 120, 120);
	
for (let i = 0; i < regler.value(); i++) {
  wolken[i].bewegen();
  wolken[i].anzeigen();
}
}
