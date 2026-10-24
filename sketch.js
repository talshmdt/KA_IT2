// Erstellt die Variablen für die Bilder der Landschaft
let wolkenBild;
let sonnenBild;
let bergeBild;
let huegelBild;
let wasserBild;
let baeumeHintenBild;
let wiesenBild;
let vordergrundBild;

// Lädt alle Bilder, bevor das Programm startet
function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  baeumeHintenBild = loadImage("1baeumehinten.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("1vordergrund.svg");}

// Erstellt die Variablen für das Mikrofon und die Bedingung
let mikrofon;
let lautstaerke;
let startKnopf;

let wolken = []; // Erstellt ein Array (Liste), in dem alle Wolken gespeichert werden
let regler; // Erstellt einen Regler für die Anzahl der Wolken

// Erstellt eine Klasse (Bauplan) für alle Wolken
class Wolke {
	
  // Festlegung der Anfangswerte (Position und Geschwindigkeit) einer Wolke
  constructor(x, y) {
    this.x = x; // waagerechte Position
    this.y = y; // senkrechte Position
    this.geschwindigkeit = random(0.5, 2);} // jede Wolke bekommt eine zufällige Geschwindigkeit

// Methode zum Bewegen der Wolke (Methode beschreibt, was ein Objekt tun kann)
  bewegen() {
    this.x = this.x + this.geschwindigkeit; // Die Wolke bewegt sich nach rechts

    if (this.x > width) { // Wenn die Wolke rechts aus dem Bildschirm verschwindet...
        this.x = -100; // ...beginnt sie wieder links
        this.y = random(0, 100); // ...bekommt sie eine zufällige Höhe
        this.geschwindigkeit = random(0.5, 2);}} // ...bekommt sie eine neue zufällige Geschwindigkeit

// Methode zum Anzeigen der Wolke
  anzeigen() {
    image(wolkenBild, this.x, this.y, 100, 60);}} // Zeichnet die Wolke an ihrer Position und mit einer Größe von 100 x 60 Pixeln 

// Funktion wird einmal am Start des Programms ausgeführt (Funktion: führt einen bestimmten Aufgabenblock aus)
function setup() {
  createCanvas(750, 500); // Erstellt eine Zeichnfläche mit 750 x 500 Pixeln

// For-Schleife, die 100 Wolken erstellt
for (let i = 0; i < 100; i++) {
	
	// zufällige Position der Wolke
    let x = random(-100, 800);
    let y = random(0, 100);
    
    wolken.push(new Wolke(x, y));} // Erstellt eine neue Wolke (Objekt) und speichert sie im Array
    regler = createSlider(0, 100, 30, 1); // Erstellt einen Regler für 0 bis 100 Wolken (beim Start werden 30 Wolken angezeigt)
    startKnopf = createButton("Mikrofon starten"); // Erstellt einen Button zum Starten des Mikrofons
    startKnopf.mousePressed(starteMikrofon);} // Beim Klicken wird die Funktion "starteMikrofon" ausgeführt

// Funktion zum Starten des Mikrofons
async function starteMikrofon() {
  await userStartAudio(); // Startet die Audioverarbeitung im Browser
  mikrofon = new p5.AudioIn(); // Erstellt einen Mikrofoneingang
  mikrofon.start(); // Startet das Mikrofon
  startKnopf.html("Mikrofon gestartet");} // Ändert die Beschriftung des Buttons zu "Mikrofon gestartet"

// Funktion, die ständig wiederholt wird (normalerweise 60-mal in der Sekunde)
function draw() {
  background(135, 206, 235); // Zeichnet den blauen Himmel (R=135 G=206 B=235)
  lautstaerke = 0; // Setzt die Lautstärke zunächst auf 0
	
  // Überprüft, ob das Mikrofon vorhanden und aktiv ist
  if (mikrofon && mikrofon.enabled) {
    lautstaerke = mikrofon.getLevel();} // Misst die aktuelle Lautstärke

  image(sonnenBild, 50, 30, 120, 120); // Zeichnet die Sonne
  let helligkeit = map(lautstaerke, 0, 0.2, 255, 60); // Berechnet die Helligkeit anhand der Lautstärke (0 und 0,02 bestimmen den Lautstärkebereich, 255 und 60 betimmen wie dunkel/hell die Wolken werden)
  helligkeit = constrain(helligkeit, 60, 255); // Begrenzt die Helligkeit auf Werte zwischen 60 und 255
  tint(helligkeit); // Verändert die Helligkeit der Wolkenbilder

// For-Schleife zum Bewegen und Anzeigen der Wolken (Ein Regler bestimmt, wie viele Wolken sichtbar sind)
for (let i = 0; i < regler.value(); i++) {
    wolken[i].bewegen(); // Bewegt die jeweilige Wolke
    wolken[i].anzeigen();} // Zeichnet die jeweilige Wolke
    noTint(); // Beendet die Einfärbung (dadurch bleiben die anderen Landschaftsbilder unverändert)

    // Zeichnet die restlichen Landschaftselemente (die Reihenfolge bestimmt, welche Bilder vorne liegen)
    image(bergeBild, 0, 0, 750, 500);
    image(huegelBild, 0, 0, 750, 500);
    image(wasserBild, 0, 0, 750, 500);
    image(baeumeHintenBild, 0, 0, 750, 500);
    image(wiesenBild, 0, 0, 750, 500);
    image(vordergrundBild, 0, 0, 750, 500);}