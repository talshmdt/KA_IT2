let wolkenBild, sonnenBild, bergeBild, huegelBild, wasserBild, wiesenBild, vordergrundBild; // Erstellung der Variablen für die Bilder der Landschaft
let mikrofon, fft, lautstaerke = 0; // Erstellung der Variablen für den Audioeingang und die Lautstärke
let wolken = [], baeume = []; // Erstellung zwei Arrays (Listen), in denen die Wolken und Bäume gespeichert werden
let wolkenRegler, wolkenSchwelle, baumSchwelle; // Erstellung der Variablen für die drei Regler
let startKnopf, stoppKnopf, demoKnopf, statusText; // Erstellung der Variablen für die Buttons und den Statustext
// Legt fest, welcher Modus gerade aktiv ist
// "aus"= keine Audio, "audio"= echtes Audiosignal, "demo"= Demo-Modus
let modus = "aus"; 
let demoZeit = 0; // Zählt die Zeit im Demo-Modus

// Lädt alle Bilder (bevor das Programm startet)
function preload() {
  wolkenBild = loadImage("wolke.svg");
  sonnenBild = loadImage("sonne.svg");
  bergeBild = loadImage("1berge.svg");
  huegelBild = loadImage("1huegel.svg");
  wasserBild = loadImage("1wasser.svg");
  wiesenBild = loadImage("1wiesen.svg");
  vordergrundBild = loadImage("vordergrund_ohne_baeume.svg");

// Jede Baumgruppe hat eine eigene SVG-Datei und einen Frequenzbereich in Hz.
// Tiefe Frequenzen führen zu schnellerem Wackeln.
// tief = niedrigste Frequenz, auf die der Baum reagiert (in Hertz)
// hoch = höchste Frequenz, auf die der Baum reagiert (in Hertz)
// tempo = Geschwindigkeit, mit der der Baum wackelt
  baeume = [
    {bild: loadImage("baum_hinten_1.svg"), hinten: true, x: 39, y: 235, tief: 60, hoch: 180, tempo: 0.35, winkel: 0},
    {bild: loadImage("baum_hinten_2.svg"), hinten: true, x: 735, y: 220, tief: 180, hoch: 350, tempo: 0.29, winkel: 0},
    {bild: loadImage("baum_vorne_1.svg"), hinten: false, x: 639, y: 330, tief: 350, hoch: 700, tempo: 0.23, winkel: 0},
    {bild: loadImage("baum_vorne_2.svg"), hinten: false, x: 660, y: 495, tief: 700, hoch: 1300, tempo: 0.17, winkel: 0},
    {bild: loadImage("baum_vorne_3.svg"), hinten: false, x: 119, y: 265, tief: 1300, hoch: 2600, tempo: 0.12, winkel: 0},
    {bild: loadImage("baum_vorne_4.svg"), hinten: false, x: 125, y: 495, tief: 2600, hoch: 5000, tempo: 0.08, winkel: 0}];}

// Erstellung einer Klasse (Bauplan) für alle Wolken
class Wolke {
  // Legt die Anfangswerte einer Wolke fest
  constructor(x, y) {
    this.x = x; // Waagerechte Position
    this.y = y; // Senkrechte Position
    this.geschwindigkeit = random(0.5, 2);} // Zufällige Geschwindigkeit
	
  // Methode zum Bewegen der Wolke
  bewegen() {
    this.x += this.geschwindigkeit; // Bewegt die Wolke nach rechts
	// Prüft, ob die Wolke den rechten Rand verlassen hat
    if (this.x > width) {
      this.x = -100; // Setzt die Wolke wieder an den linken Rand
      this.y = random(0, 100); // Gibt ihr eine neue zufällige Höhe
      this.geschwindigkeit = random(0.5, 2);}} // Gibt ihr eine neue Geschwindigkeit
	
  // Methode zum Anzeigen der Wolke
  anzeigen() {
    image(wolkenBild, this.x, this.y, 100, 60);}} // Zeichnet die Wolke mit 100 x 60 Pixeln

// Funktion wird einmal beim Start des Programms ausgeführt
function setup() {
  let zeichenflaeche = createCanvas(750, 500); // Erstellt eine Zeichenfläche mit 750 x 500 Pixeln
  zeichenflaeche.parent("zeichenflaeche"); // Fügt die Zeichenfläche an der richtigen Stelle auf der Webseite ein
  // Erstellt mit einer For-Schleife 100 Wolken
  // Jede Wolke bekommt eine zufällige Position
  // Die neue Wolke wird im Array gespeichert
  for (let i = 0; i < 100; i++) { 
    wolken.push(new Wolke(random(-100, 800), random(0, 100)));}

  let steuerung = select("#steuerung"); // Sucht den Bereich für die Steuerung in der HTML-Datei
  let knoepfe = createDiv(); // Erstellt einen Bereich für die Buttons
  knoepfe.class("knopfreihe"); // Verwendet das Aussehen aus der CSS-Datei
  knoepfe.parent(steuerung); // Fügt den Bereich zur Steuerung hinzu
	
  // Erstellt den Button zum Starten des Audiosignals
  startKnopf = createButton("Audio starten");
  startKnopf.parent(knoepfe);
  startKnopf.mousePressed(starteMikrofon); // Führt beim Klicken die Startfunktion aus
	
  // Erstellt den Button zum Stoppen von Audio und Demo
  stoppKnopf = createButton("Audio / Demo stoppen");
  stoppKnopf.parent(knoepfe);
  stoppKnopf.mousePressed(stoppeAlles); // Führt beim Klicken die Stoppfunktion aus
	
  // Erstellt den Button für den Demo-Modus
  demoKnopf = createButton("Demo-Modus starten");
  demoKnopf.parent(knoepfe);
  demoKnopf.mousePressed(starteDemo); // Startet die Demo ohne angeschlossenen Synthesizer

  // Erstellt einen Bereich für die drei Regler
  let reglerZeile = createDiv();
  reglerZeile.class("reglerreihe");
  reglerZeile.parent(steuerung);
  wolkenRegler = erstelleRegler(reglerZeile, "Anzahl der Wolken", 0, 100, 30, 1); // Regler für die Anzahl der sichtbaren Wolken (Werte von 0 bis 100, Startwert 30, Schrittgröße 1)
  wolkenSchwelle = erstelleRegler(reglerZeile, "Wolken-Empfindlichkeit", 1, 100, 50, 1); // Regler für die Empfindlichkeit der Wolken (Je höher der Wert, desto stärker reagieren die Wolken auf leise Signale)
  baumSchwelle = erstelleRegler(reglerZeile, "Baum-Schwellenwert", 0, 255, 100, 1); // Regler für den Schwellenwert der Bäume (Je niedriger der Wert, desto leichter beginnen die Bäume zu wackeln)
  statusText = createP("Status: Audio aus"); // Erstellt einen Text, der den aktuellen Zustand des Programms anzeigt
  statusText.id("status"); // Verbindet den Text mit der CSS-Gestaltung
  statusText.parent(steuerung);}

// Erstellt einen Regler mit einer Beschriftung, dadurch muss nicht jeder Regler einzeln programmiert werden
function erstelleRegler(eltern, name, min, max, wert, schritt) {
  // Erstellt einen Bereich für den Regler
  let gruppe = createDiv();
  gruppe.class("reglergruppe");
  gruppe.parent(eltern);
  // Erstellt die Beschriftung mit dem aktuellen Wert
  let beschriftung = createSpan(name + ": " + wert);
  beschriftung.parent(gruppe);

  // Erstellt den Regler
  // min = kleinster Wert
  // max = größter Wert
  // wert = Startwert
  // schritt = Abstand zwischen den möglichen Werten
  let regler = createSlider(min, max, wert, schritt);
  regler.parent(gruppe);
  regler.input(() => beschriftung.html(name + ": " + regler.value())); // Aktualisiert die Beschriftung, wenn der Regler bewegt wird
  return regler;} // Gibt den fertigen Regler zurück

// Startet den Audioeingang des Computers
// Das Audiosignal soll vom Synthesizer über das Audio-Interface kommen
async function starteMikrofon() {
  stoppeAlles(); // Stoppt zuerst eine möglicherweise laufende Audioanalyse oder Demo
  statusText.html("Status: Audio wird gestartet ...");  // Zeigt an, dass das Audiosignal gestartet wird
  try {
    // Der Browser fragt erst nach dem Klick nach der Audiofreigabe
    await userStartAudio(); // Fordert die Erlaubnis für den Audiozugriff an
	// Erstellt einen neuen Audioeingang
    let neuesMikrofon = new p5.AudioIn();
    mikrofon = neuesMikrofon;
    neuesMikrofon.start(() => { // Startet den Audioeingang
	// Prüft, ob dieser Audioeingang noch verwendet werden soll
      if (mikrofon !== neuesMikrofon) {
        neuesMikrofon.stop();
        return;} // Beendet diesen Teil der Funktion
		
	  // Erstellt die Frequenzanalyse
      // FFT untersucht, welche Frequenzen im Audiosignal vorkommen
      fft = new p5.FFT(0.8, 1024);
      fft.setInput(mikrofon); // Verbindet die Frequenzanalyse mit dem Audioeingang
      modus = "audio"; // Schaltet den Audio-Modus ein
      statusText.html("Status: Audio aktiv – Synthesizer spielen");}, // Zeigt an, dass das Audiosignal aktiv ist
	
	  // Wird ausgeführt, wenn der Audioeingang nicht gestartet werden kann
	  (fehler) => {
      if (mikrofon !== neuesMikrofon) return; // Prüft, ob der Fehler zum aktuellen Audioeingang gehört
      mikrofon = undefined; // Entfernt den Audioeingang
      fft = undefined; // Entfernt die Frequenzanalyse
      modus = "aus"; // Schaltet den Audio-Modus aus
      statusText.html("Fehler: Audioeingang nicht verfügbar oder Zugriff verweigert."); // Zeigt eine Fehlermeldung auf der Webseite an
      console.error(fehler);});} // Zeigt den Fehler in der Browserkonsole
	
	// Fängt weitere Fehler beim Starten des Audios ab
	catch (fehler) {
    modus = "aus";
    statusText.html("Fehler: Audio konnte nicht gestartet werden."); // Zeigt eine Fehlermeldung an
    console.error(fehler);}} // Zeigt den Fehler in der Browserkonsole

// Stoppt den Audio-Modus und den Demo-Modus
function stoppeAlles() {
  modus = "aus"; // Schaltet den aktuellen Modus aus
  fft = undefined; // Beendet die Verwendung der Frequenzanalyse
  if (mikrofon) mikrofon.stop(); // Stoppt den Audioeingang, falls einer vorhanden ist
  mikrofon = undefined; // Entfernt den Audioeingang
  lautstaerke = 0; // Setzt die gemessene Lautstärke auf 0
  if (statusText) statusText.html("Status: Audio und Demo gestoppt");} // Aktualisiert den Statustext

// Startet den Demo-Modus ohne Synthesizer und Audio-Interface
function starteDemo() {
  stoppeAlles(); // Stoppt zuerst den bisherigen Modus 
  demoZeit = 0; // Setzt die Demo-Zeit zurück 
  modus = "demo"; // Schaltet den Demo-Modus ein
  statusText.html("Status: Demo-Modus aktiv (ohne Mikrofon)");}  // Zeigt an, dass die Demo läuft

// Bestimmt, wie viel Energie im Frequenzbereich eines Baumes vorhanden ist
function baumEnergie(baum, nummer) {
  // Im Audio-Modus wird die echte Energie des Audiosignals gemessen
  // Jeder Baum hat dafür einen eigenen Frequenzbereich
  if (modus === "audio" && fft) return fft.getEnergy(baum.tief, baum.hoch);

  // Im Demo-Modus werden die Frequenzen nur nachgestellt
  if (modus === "demo") {
	// Berechnet, wann die jeweilige Baumgruppe reagieren soll
    // nummer sorgt dafür, dass nicht alle Bäume gleichzeitig wackeln
    let phase = (demoZeit / 55 + nummer * 0.85) % 6;
	// Gibt für eine bestimmte Zeit eine hohe Energie zurück
    // Danach ist die Energie wieder 0 und der Baum bleibt stehen
    return phase < 1.5 ? 190 : 0;}
	return 0;} // Ohne Audio und Demo gibt es keine Energie

// Zeichnet die Bäume und lässt sie bei passenden Frequenzen wackeln
function zeichneBaeume(hinten) {

  // Geht mit einer For-Schleife alle Bäume im Array durch
  for (let i = 0; i < baeume.length; i++) {
    let baum = baeume[i]; // Wählt den aktuellen Baum aus
    if (baum.hinten !== hinten) continue; // Prüft, ob der Baum im Hintergrund oder Vordergrund steht (Nicht passende Bäume werden in diesem Durchlauf übersprungen)
    let energie = baumEnergie(baum, i); // Ermittelt die Energie im Frequenzbereich des Baumes
    let zielWinkel = 0; // Der Baum soll zunächst gerade stehen
    if (energie > baumSchwelle.value()) { // Prüft, ob die Energie größer als der eingestellte Schwellenwert ist
	  // Berechnet die Wackelbewegung mit einer Sinuskurve
      // frameCount zählt, wie oft die Zeichnung bereits aktualisiert wurde
      // baum.tempo bestimmt, wie schnell der Baum wackelt
      // 0.035 bestimmt, wie weit sich der Baum dreht
      zielWinkel = sin(frameCount * baum.tempo) * 0.035;}
    
	// Verändert den Winkel langsam, damit die Bewegung weicher aussieht
    // Bei zu wenig Energie bewegt sich der Baum zurück in seine Ausgangsposition
    baum.winkel = lerp(baum.winkel, zielWinkel, 0.2);
    push(); // Speichert die bisherigen Zeicheneinstellungen
    translate(baum.x, baum.y); // Verschiebt den Drehpunkt an die Position des Baumes
    rotate(baum.winkel); // Dreht den Baum um den berechneten Winkel
	  
	// Zeichnet das SVG-Bild an der richtigen Stelle
    // Die negative Position gleicht die Verschiebung des Drehpunktes aus
    image(baum.bild, -baum.x, -baum.y, 750, 500);
    pop();}} // Stellt die ursprünglichen Zeicheneinstellungen wieder her

// Diese Funktion wird ständig wiederholt (ca. 60-mal pro Sekunde)
function draw() {
  background(135, 206, 235); // Zeichnet den blauen Himmel als Hintergrund
  lautstaerke = 0; // Setzt die Lautstärke zu Beginn jedes Durchlaufs auf 0
  if (modus === "audio" && mikrofon && mikrofon.enabled) { // Prüft, ob der Audio-Modus aktiv ist und ein Audiosignal vorhanden ist
    lautstaerke = mikrofon.getLevel(); // Misst die aktuelle Lautstärke des eingehenden Audiosignals
    if (fft) fft.analyze();}  // Untersucht die Frequenzen des Audiosignals
	
  if (modus === "demo") { // Prüft, ob der Demo-Modus aktiv ist
    demoZeit++; // Zählt die Demo-Zeit weiter
	
	// Erzeugt eine künstliche Lautstärke, die regelmäßig steigt und sinkt
    // Dadurch werden die Wolken auch ohne Audiosignal heller und dunkler
    lautstaerke = (sin(demoZeit * 0.06) + 1) * 0.07;}

// Zeichnet die Sonne an der Position x=50 und y=30 (120 x 120 Pixel)
image(sonnenBild, 50, 30, 120, 120);
  
  // Berechnet die Empfindlichkeit der Wolken anhand des Reglers (Ein höherer Reglerwert bedeutet eine stärkere Reaktion auf leise Töne)
  let empfindlichkeit = map(wolkenSchwelle.value(), 1, 100, 0.3, 0.03);
	
  // Berechnet die Helligkeit der Wolken anhand der Lautstärke
  // 255 = hell und 60 = dunkel
  // constrain begrenzt die Helligkeit auf Werte zwischen 60 und 255
  let helligkeit = constrain(map(lautstaerke, 0, empfindlichkeit, 255, 60), 60, 255);
  tint(helligkeit); // Verändert die Helligkeit der Wolkenbilder
	
  // Bewegt und zeichnet die Wolken
  // Der Wolkenregler bestimmt, wie viele Wolken angezeigt werden
  for (let i = 0; i < wolkenRegler.value(); i++) {
    wolken[i].bewegen(); // Bewegt die jeweilige Wolke
    wolken[i].anzeigen();} // Zeichnet die jeweilige Wolke
	
  // Beendet die Veränderung der Helligkeit
  // Dadurch behalten die anderen Landschaftsbilder ihre ursprünglichen Farben
  noTint();

  // Zeichnet die weiteren Lanschaftselemente
  image(bergeBild, 0, 0, 750, 500);
  image(huegelBild, 0, 0, 750, 500);
  image(wasserBild, 0, 0, 750, 500);
  zeichneBaeume(true);
  image(wiesenBild, 0, 0, 750, 500);
  image(vordergrundBild, 0, 0, 750, 500);
  zeichneBaeume(false);}
