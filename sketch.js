let mikrofon;
let lautstaerke;
let startKnopf;

function setup() {
  createCanvas(600, 400);

  startKnopf = createButton("Mikrofon starten");
  startKnopf.mousePressed(starteMikrofon);
}

function starteMikrofon() {
  userStartAudio();

  mikrofon = new p5.AudioIn();
  mikrofon.start();

  startKnopf.html("Mikrofon gestartet");
}

function draw() {
  background(20);

  lautstaerke = 0;

  if (mikrofon) {
    lautstaerke = mikrofon.getLevel();}

  let groesse = 100 + lautstaerke * 1000;

  fill(2, 20, 200);
  circle(300, 200, groesse);
}// JavaScript Document
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

let wolke1;

function setup() {
  createCanvas(800, 500);
  wolke1 = new Wolke(100, 100);
}

function draw() {
  background(135, 206, 235);

  wolke1.bewegen();
  wolke1.anzeigen();
}
	}