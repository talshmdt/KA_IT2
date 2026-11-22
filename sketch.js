  // Variablen (Behälter, in dem etwas gespeichert wird) für die Bilder
  let wolkenBild, sonnenBild, bergeBild, huegelBild, wasserBild, wiesenBild, vordergrundBild, einzelBaumBild; 

  // Variablen für die Audioanalyse
  let audio; // empfängt das Audiosignal (ermöglicht die Messung der Lautstärke)
  let fft;   // analysiert die Frequenzen des Audiosignals

  let wolken = [], baeume = [], hintergrundBaeume = [], regentropfen = []; // erstellt 4 Arrays (Listen) in denen Objekte gespeichert werden

  let wolkenRegler, wolkenSchwelle, baumSchwelle, hintergrundRegler; // Variablen für die Regler

  let statusText; // Variable für die Statusanzeige (zum speichern der Textelemente)
  let modus = "aus"; // Variable für den aktuellen Modus (Startwert=aus) modi: aus, audio, demo
  let demoZeit = 0; // Zähler für die Durchläufe von draw() im Demo-Modus, beginnt bei 0

  function preload() { // wird automatisch vor setup() ausgeführt
	// lädt die Bilder und speichert sie in den Variablen
    wolkenBild = loadImage("wolke.svg");
    sonnenBild = loadImage("sonne.svg");
    bergeBild = loadImage("1berge.svg");
    huegelBild = loadImage("1huegel.svg");
    wasserBild = loadImage("1wasser.svg");
    wiesenBild = loadImage("1wiesen.svg");
    vordergrundBild = loadImage("vordergrund_ohne_baeume.svg");
    einzelBaumBild = loadImage("baum_einzeln.svg");

    baeume = [ // neue Objekte werden im Array gespeichert
	  // neues Objekt "Baum"("Bilddatei"), für die Ebenen: Vordergrund (false) / Hintergrund (true), x-Position, y-Position, untere Frequenzgrenze (in Hz), obere Frequenzgrenze (in Hz), Bewegeungsgeschwindigkeit 
      new Baum("baum_hinten_1.svg", true, 39, 235, 60, 180, 0.35),
      new Baum("baum_hinten_2.svg", true, 735, 220, 180, 350, 0.29),
      new Baum("baum_vorne_1.svg", false, 639, 330, 350, 700, 0.23),
      new Baum("baum_vorne_2.svg", false, 660, 495, 700, 1300, 0.17),
      new Baum("baum_vorne_3.svg", false, 119, 265, 1300, 2600, 0.12),
      new Baum("baum_vorne_4.svg", false, 125, 495, 2600, 5000, 0.08)];

    hintergrundBaeume = [ // neue Objekte werden im Array gespeichert 
	  // neues Objekt "Baum" (Variable, in der die Bilddatei gespeichert ist), für die Ebenen: Hintergrund (true), x-Position, y-Position, untere Frequenzgrenze (in Hz), obere Frequenzgrenze (in Hz), Bewegeungsgeschwindigkeit, true = einzeln (einzelner Baum)
      new Baum(einzelBaumBild, true, 80, 255, 60, 150, 0.35, true),
      new Baum(einzelBaumBild, true, 165, 253, 150, 300, 0.31, true),
      new Baum(einzelBaumBild, true, 250, 253, 300, 500, 0.27, true),
      new Baum(einzelBaumBild, true, 335, 255, 500, 800, 0.23, true),
      new Baum(einzelBaumBild, true, 420, 250, 800, 1200, 0.19, true),
      new Baum(einzelBaumBild, true, 505, 247, 1200, 2000, 0.15, true),
      new Baum(einzelBaumBild, true, 590, 250, 2000, 3200, 0.11, true),
      new Baum(einzelBaumBild, true, 675, 252, 3200, 5000, 0.08, true)];
  }

  class Wolke { // Klasse (Bauplan) für die Wolken

    constructor(x, y) { // Llegt Eigenschaften fest: Position (x, y), automatisch ausgeführt wenn man neue Wolke (mit new Wolke) erstellt 
      this.x = x; // speichert übergebenen x- Wert in der Eigenschaft .x des jeweiligen Wolkenobjekts (this)
      this.y = y; // speichert übergebenen y- Wert in der Eigenschaft .y des jeweiligen Wolkenobjekts (this)
      this.geschwindigkeit = random(0.25, 3);} // // speichert zufällige Geschwindigkeit zwischen 0,25-3 in der Eigenschaft .geschwindigkeit des jeweiligen Wolkenobjekts (this)

    bewegen() { // Methode zum Bewegen der Wolke
      this.x = this.x + this.geschwindigkeit; // addiert die Geschwindigkeit zur bisherigen x-Position, speichert den neuen x- Wert in der Eigenschaft .x des jeweiligen Wolkenobjekts (this)

      if (this.x > width) { // "Wenn" die x-Position größer als die Breite der Zeichenfläche (750 px) ist...
        this.x = -100; // ...dann wird das Wolkenobjekt links außerhalb der Zeichenfläche positioniert (Wolke hat ist 100px breit)
        this.y = random(-50, 100); // ...dann bekommt das Wolkenobjekt eine neue zufällige Höhe zwischen -50-100px (-50 für abgeschnittene Wolken oben)
        this.geschwindigkeit = random(0.25, 3);}} // ...dann bekommt das Wolkenobjekt eine neue zufällige Geschwindigkeit zwischen 0.25-3

    anzeigen() { // Methode, die die Wolken auf die Zeichenfläche auf auktueller Position zeichnet
      image(wolkenBild, this.x, this.y, 100, 60);} // Bilddatei, x-Position, y-Position, Breite der Wolke (in px), Höhe der Wolke (in px)
  }

  class Baum { // Klasse (Bauplan) für die Bäume
    // Legt EIngeschaften fest, automatisch ausgeführt wenn man neuen Baum (mit new Baum) erstellt 
    constructor(bild, hinten, x, y, tief, hoch, tempo, einzeln = false) { // (Bilddatei, hinten = true (hintere Ebene) x, y, untere Frequenzgrenze (in Hz)), obere Frequenzgrenze (in Hz), Bewegungsgeschwindigkeit, einzeln = false (keine einzelnen Bäume)
    if (einzeln) { // Wenn einzeln = true (Einzelbaum)...
		this.bild = bild;} // ...wird das bereits geladene Bild in der Eigenschaft .bild gespeichert
    else { // Sonst (einzeln = false, also Baumgruppe)...
		this.bild = loadImage(bild);} // ...lädt die Bilddatei und speichert sie in der Eigenschaft.bild

	this.hinten = hinten; // Speichert die Ebene (true = hinten, false = vorne)
	this.x = x; // Speichert die x-Position
	this.y = y; // Speichert die y-Position
	this.tief = tief; // Speichert die untere Frequenzgrenze (Hz)
	this.hoch = hoch; // Speichert die obere Frequenzgrenze (Hz)
	this.tempo = tempo; // Speichert die Geschwindigkeit von der Schwingung
	this.einzeln = einzeln; // Speichert, ob es ein Einzelbaum (true) oder eine Baumgruppe (false) ist
	this.winkel = 0;} // Legt den Anfangswinkel auf 0 fest (Baum ist nicht gedreht)

    bewegen(nummer) { // Methode, die den Baum bewegt, Parameter nummer bekommt beim Aufruf die Nummer/Index des Baumes
      let energie = baumEnergie(this, nummer); // erstellt Variable, übergibt aktuelles Baumobjekt + Nummer an Funktion baumEnergie -> Rückgabewert der Funktion in energie gespeichert
      let zielWinkel = 0; // erstellt Variable, Startwert 0 = Baum steht gerade (Winkel, den der Baum erreichen soll)

      if (energie > baumSchwelle.value()) { // Wenn Energie (Signalstärke im Frequenzbereich) größer als aktueller Wert des Reglers ist...
        zielWinkel = sin(frameCount * this.tempo) * 0.05;} // ...wackelt der Baum, frameCount = fortlaufender Zähler, this.tempo = Geschwindigkeit der Schwingung, sin() = Sinuslurve erzeugt die Schwingung (-+, hin, her), 0.035 = maximale Neigung von ungefähr 3 Grad

      this.winkel = lerp(this.winkel, zielWinkel, 0.2);} // Berechnet einen weichen ( durch lerp) Übergang vom aktuellen Winkel zum Zielwinkel, 0,2 = 20 % Annäherung pro Aufruf

    anzeigen() { // Methode zeichnet die Bäume an (mit Position und Bewegung)
      push(); // speichert die aktuellen Zeicheneinstellungen
      translate(this.x, this.y); // verschiebt Ursprung des Koordinatensystems (Drehpunkt) von 0,0 auf aktuelle this.x, ,this.y- Werte des Baumes
      rotate(this.winkel); // Baum dreht sich um den neuen Ursprung, mit vorher berechnetem Winkel

      if (this.einzeln) { // Wenn einzeln = true (Einzelbaum)...
        image(this.bild, -35, -75, 70, 75);} // ...dann wird der Baum gezeichnet (Bilddatei, 35 Pixel links vom verschobenen Ursprung, 75px oberhalb des verschobenen Ursprungs, Bildbreite 70px, Bildhöhe 75px-> untere Bildmitte liegt auf dem verschobenen Urprung
      else {
        image(this.bild, -this.x, -this.y, 750, 500);} // Sonst: werden die Baumgruppen gezeichnet (Ursprung geht wieder zu den alten Werten), Bildbreite 750px, Bildhöhe 500px

      pop();} // Stellt die ursprünglichen Zeicheneinstellungen wieder her (von push()) -> damit es nur für den aktuellen Baum gilt
  }

  class Regentropfen { // Klasse für Regentropfen und Kreise

    constructor() { // Methode legt Ziel des Regentropfens fest, automatisch ausgeführt wenn man mit new Regentropfen() einen neuen Regentropfen erstellt
      this.zielY = random(270, 400); // speichert die senkrechte zufällige Zielposition (zwischen 270px-400px) in der Eigenschaft .zielY
      this.zuruecksetzen();} // nächste Methode wird aufgerufen

    zuruecksetzen() { // Methode legt neue Startposition fest
      this.x = random(0, 750); // zufällige x-Position zwischen 0 und 750px
      this.y = random(0, 100); // zufällige y-Position zwischen 0 und 100px
      this.kreis = 0;} // setzt die Größe des Kreises auf 0

    bewegen() { // Methode bewegt den Tropfen und lässt Kreis entstehen
      if (this.y < this.zielY) { // Wenn y-Position kleiner als Zielposition...
        this.y = this.y + 10;} // ...dann wird die y-Position um 10px erhöht -> Tropfen fällt (immer 10px weiter nach unten)
      else { 
        this.kreis = this.kreis + 0.5; // Sonst (Zielpostion erreicht/überschritten) wird die Variable this.kreis (Radius) bei jedem Aufruf um 0.5 erhöht

      if (this.kreis > 40) { // Wenn der Kreis größer als 40px ist...
        this.zuruecksetzen();}}} // ...dann wird zuruecksetzen aufgerufen (-> neuer Regentropfen)

    anzeigen() { // Methode zeichnet Tropfen oder Kreis
      push(); // speichert die aktuellen Zeicheneinstellungen

      if (this.y < this.zielY) { // Wenn y-Position kleiner als Zielposition des Tropfens
        stroke(200, 230, 255); // Farbe (R,G,B): sehr helles blau 
        line(this.x, this.y - 10, this.x, this.y);} // zeichnet die Linie eines Tropfens (Anfang: x-Position, y-Position - 10, Ende: x-Position, y-Position)
      else {
        noFill(); // Sonst: keine Füllfarbe
        stroke(255, 255, 255, 255 - this.kreis * 6); // Farbe (R,G,B)= weiß, Deckkraft 255 (voll sichtbar) - Kreisgröße * 6 (Kreisgröße 40 = Deckkraft 15 (fast unsichtbar))
        ellipse(this.x, this.zielY, this.kreis, this.kreis / 3);} // zeichnet eine Ellipse (x-Position, y-Zielposition, Höhe der Ellipse: Kreisgröße/3 -> flach)

      pop();} // Stellt die ursprünglichen Zeicheneinstellungen wieder her () (von push()) -> damit es nur für den aktuellen Tropfen gilt
  }

  function setup() {
    createCanvas(750, 500).parent("zeichenflaeche");

    for (let i = 0; i < 100; i++) {
      wolken.push(new Wolke(random(-100, 800), random(0, 100)));}

    for (let i = 0; i < 30; i++) {
      regentropfen.push(new Regentropfen());}

    let knoepfe = createDiv();
    knoepfe.class("knopfreihe");
    knoepfe.parent("steuerung");

    erstelleKnopf(knoepfe, "Audio starten", starteAudio);
    erstelleKnopf(knoepfe, "Audio / Demo stoppen", stoppeAlles);
    erstelleKnopf(knoepfe, "Demo-Modus starten", starteDemo);

    let reglerZeile = createDiv();
    reglerZeile.class("reglerreihe");
    reglerZeile.parent("steuerung");

    wolkenRegler = erstelleRegler(reglerZeile, "Anzahl der Wolken", 0, 100, 30);
    wolkenSchwelle = erstelleRegler(reglerZeile, "Wolken- und Regenempfindlichkeit", 1, 100, 50);
    baumSchwelle = erstelleRegler(reglerZeile, "Baum-Schwellenwert", 0, 255, 100);
    hintergrundRegler = erstelleRegler(reglerZeile, "Anzahl der Bäume", 0, 8, 4);

    statusText = createP("Status: Audio aus");
    statusText.id("status");
    statusText.parent("steuerung");
  }

  function erstelleKnopf(eltern, name, funktion) {
    let knopf = createButton(name);
    knopf.parent(eltern);
    knopf.mousePressed(funktion);}

  function erstelleRegler(eltern, name, min, max, wert) {
    let gruppe = createDiv();
    gruppe.class("reglergruppe");
    gruppe.parent(eltern);

    let beschriftung = createSpan(name + ": " + wert);
    beschriftung.parent(gruppe);

    let regler = createSlider(min, max, wert, 1);
    regler.parent(gruppe);

    regler.input(() => beschriftung.html(name + ": " + regler.value()));

    return regler;
  }

  async function starteAudio() {
    stoppeAlles();
    statusText.html("Status: Audio wird gestartet...");

    let neuesAudio = new p5.AudioIn();
    audio = neuesAudio;

    try {
      await userStartAudio();

      if (audio !== neuesAudio) return;

      neuesAudio.start(() => {
        if (audio !== neuesAudio) {
          neuesAudio.stop();
          return;}

        fft = new p5.FFT(0.8, 1024);
        fft.setInput(audio);

        modus = "audio";
        statusText.html("Status: Audio aktiv – Synthesizer spielen");}, audioFehler);}
    catch (fehler) {audioFehler(fehler);}

    function audioFehler(fehler) {
      if (audio !== neuesAudio) return;

      stoppeAlles();
      statusText.html("Fehler: Audioeingang nicht verfügbar.");
      console.error(fehler);}
  }

  function stoppeAlles() {
    if (audio) audio.stop();

    audio = undefined;
    fft = undefined;
    modus = "aus";

    statusText.html("Status: Audio und Demo gestoppt");
  }

  function starteDemo() {
    stoppeAlles();
    demoZeit = 0;
    modus = "demo";

    statusText.html("Status: Demo-Modus aktiv (ohne Audiosignal)");
  }

  function baumEnergie(baum, nummer) {
    if (modus === "audio" && fft) {
      return fft.getEnergy(baum.tief, baum.hoch);}

    if (modus === "demo") {
      let phase = (demoZeit / 55 + nummer * 0.85) % 6;
      return phase < 1.5 ? 190 : 0;}

    return 0;
  }

  function zeichneBaeume(hinten) {
    for (let i = 0; i < baeume.length; i++) {
      if (baeume[i].hinten === hinten) {
        baeume[i].bewegen(i);
        baeume[i].anzeigen();}}
  }

  function zeichneHintergrundBaeume() {
    for (let i = 0; i < hintergrundRegler.value(); i++) {
      hintergrundBaeume[i].bewegen(i + baeume.length);
      hintergrundBaeume[i].anzeigen();}
  }

  function draw() {
    background(135, 206, 235);

    let lautstaerke = 0;

    if (modus === "audio" && audio && audio.enabled) {
      lautstaerke = audio.getLevel();
      fft.analyze();}

    if (modus === "demo") {
      demoZeit++;
      lautstaerke = (sin(demoZeit * 0.06) + 1) * 0.07;}

    let empfindlichkeit = map(wolkenSchwelle.value(), 1, 100, 0.3, 0.03);
    let wetterStaerke = constrain(lautstaerke / empfindlichkeit, 0, 1);

    image(sonnenBild, 50, 30, 120, 120);

    let helligkeit = map(wetterStaerke, 0, 1, 255, 60);
    tint(helligkeit);

    for (let i = 0; i < wolkenRegler.value(); i++) {
      wolken[i].bewegen();
      wolken[i].anzeigen();}

    noTint();

    image(bergeBild, 0, 0, 750, 500);
    image(huegelBild, 0, 0, 750, 500);

    zeichneHintergrundBaeume();

    image(wasserBild, 0, 0, 750, 500);
    zeichneBaeume(true);

    let regenAnzahl = floor(wetterStaerke * regentropfen.length);

    for (let i = 0; i < regenAnzahl; i++) {
      regentropfen[i].bewegen();
      regentropfen[i].anzeigen();}

    image(wiesenBild, 0, 0, 750, 500);
    image(vordergrundBild, 0, 0, 750, 500);
    zeichneBaeume(false);
  }
