
let mikrofon;
let lautstaerke;
let startKnopf;
let wolke1;

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

  wolke1 = new Wolke(100, 100);

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

  wolke1.bewegen();
  wolke1.anzeigen();
}
