
let mikrofon;
let lautstaerke;
let startKnopf;
let wolken = [];
let regler;

class Wolke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  bewegen() {
    this.x = this.x + 1;

    if (this.x > 850) {
      this.x = -150;
    }
  }

  anzeigen() {
    fill(255);
    noStroke();

    ellipse(this.x, this.y, 100, 60);
    ellipse(this.x + 50, this.y, 100, 60);
    ellipse(this.x + 25, this.y - 20, 100, 60);
  }
}

function setup() {
  createCanvas(800, 500);

  for (let i = 0; i < 10; i++) {
  wolken.push(new Wolke(i * 100, random(50, 200)));
}

regler = createSlider(0, 10, 3, 1);

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

for (let i = 0; i < regler.value(); i++) {
  wolken[i].bewegen();
  wolken[i].anzeigen();
}
}
