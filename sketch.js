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
    if (einzeln) { // "Wenn" einzeln = true (Einzelbaum)
  		this.bild = bild;} // ...dann wird das bereits geladene Bild verwendet, speichert Bild in der Eigeschaft .bild
	else {
  		this.bild = loadImage(bild);} // ...sonst wird das 
      this.hinten = hinten;
      this.x = x;
      this.y = y;
      this.tief = tief;
      this.hoch = hoch;
      this.tempo = tempo;
      this.einzeln = einzeln;
      this.winkel = 0;}

    bewegen(nummer) {
      let energie = baumEnergie(this, nummer);
      let zielWinkel = 0;

      if (energie > baumSchwelle.value()) {
        zielWinkel = sin(frameCount * this.tempo) * 0.035;}

      this.winkel = lerp(this.winkel, zielWinkel, 0.2);}

    anzeigen() {
      push();
      translate(this.x, this.y);
      rotate(this.winkel);

      if (this.einzeln) {
        image(this.bild, -35, -75, 70, 75);}
      else {
        image(this.bild, -this.x, -this.y, 750, 500);}

      pop();}
  }

  class Regentropfen {

    constructor() {
      this.zielY = random(270, 400);
      this.zuruecksetzen();}

    zuruecksetzen() {
      this.x = random(0, 750);
      this.y = random(50, 100);
      this.kreis = 0;}

    bewegen() {
      if (this.y < this.zielY) {
        this.y += 10;}
      else {
        this.kreis += 0.5;}

      if (this.kreis > 40) {
        this.zuruecksetzen();}
    }

    anzeigen() {
      push();

      if (this.y < this.zielY) {
        stroke(200, 230, 255);
        line(this.x, this.y - 10, this.x, this.y);}
      else {
        noFill();
        stroke(255, 255, 255, 255 - this.kreis * 6);
        ellipse(this.x, this.zielY, this.kreis, this.kreis / 3);}

      pop();}
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
