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
    lautstaerke = mikrofon.getLevel();
  }

  let groesse = 100 + lautstaerke * 1000;

  fill(2, 20, 200);
  circle(300, 200, groesse);
}// JavaScript Document