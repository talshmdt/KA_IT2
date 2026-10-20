
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

  ellipse(this.x, this.y, 60, 35);
  ellipse(this.x + 30, this.y, 60, 35);
  ellipse(this.x + 15, this.y - 12, 60, 35);
}
}

function setup() {
  createCanvas(800, 500);

  for (let i = 0; i < 50; i++) {
  let x = (i % 10) * 100;
  let y = 35 + Math.floor(i / 10) * 25;

  wolken.push(new Wolke(x, y));
}

regler = createSlider(0, 50, 10, 1);

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
