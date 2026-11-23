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
        stroke(255, 255, 255, 255 - this.kreis * 6); // Farbe (R,G,B)= weiß, Deckkraft 255 (voll sichtbar) - Kreisgröße * 6 (Kreisgröße 40 = Deckkraft 15 (fast unsichtbar) -> je größer der Kreis wird desto transparenter wird er)
        ellipse(this.x, this.zielY, this.kreis, this.kreis / 3);} // zeichnet eine Ellipse (x-Position, y-Zielposition, Kreisgröße frü Breite, Höhe der Ellipse: Kreisgröße/3 -> flach)

      pop();} // Stellt die ursprünglichen Zeicheneinstellungen wieder her () (von push()) -> damit es nur für den aktuellen Tropfen gilt
  }
  // Funktion setup wird nur einmal am Anfang asugeführt (bereitet Programm beim Start vor)
  function setup() { // Funktion erstellt Zeichenfläche (bereitet 100 Wolken und 30 Regentropfen vor)
    createCanvas(750, 500).parent("zeichenflaeche"); // erstellt Zeichenfläche 750x500px, .parent("") legt die Stelle fest, wo diese eingefügt wird (HTML-Code: ID zeichenflaeche)
	  
	// Beide For-Schleifen erstellt nur die Objekte (Wolken und Regentropfen). Wie viele davon tatsächlich angezeigt werden, bestimmt später der Wolken-Schieberegler in draw()
    for (let i = 0; i < 100; i = i + 1) { // For-Schleife: Zähler beginnt bei 0, Schleife läuft solange i kleiner als 100 ist, nach jedem Durchlauf wird i um 1 erhöht
      wolken.push(new Wolke(random(-100, 800), random(-50, 100)));} // erstellt neues Wolkenobjekt und fügt es dem Array wolken hinzu (push), mit zufälliger x-Position zwischen -100 und 800 (damit Wolken aus dem Bild kommen und ziehen können), zufälliger y-Position zwischen -50 und 100 (-50 damit Wolken oben halb zu sehen sein können)

    for (let i = 0; i < 30; i = i + 1) { // For-Schleife: Zähler beginnt bei 0, Schleife läuft solange i kleiner als 30 ist, nach jedem Durchlauf wird i um 1 erhöht
      regentropfen.push(new Regentropfen());} // erstellt neues Tropfennobjekt und fügt es dem Array regentropfen hinzu (push)

    let knoepfe = createDiv(); // Erstellt neue Variable knoefe und HTML-Element div (Container)
    knoepfe.class("knopfreihe"); // die Variable knoepfe wird der CSS-Klasse knopfreihe zugewiesen
    knoepfe.parent("steuerung"); // legt die Stelle fest, wo der Inhalt der Variable knoepfe eingefügt wird (HTML-Code: ID steuerung)

    erstelleKnopf(knoepfe, "Audio starten", starteAudio); // erstellt Button, zugewiesene Variable, Text, auszuführende Funktion
    erstelleKnopf(knoepfe, "Audio / Demo stoppen", stoppeAlles); // erstellt Button, zugewiesene Variable, Text, auszuführende Funktion
    erstelleKnopf(knoepfe, "Demo-Modus starten", starteDemo); // erstellt Button, zugewiesene Variable, Text, auszuführende Funktion

    let reglerZeile = createDiv(); // Erstellt neue Variable reglerZeile und HTML-Element div (Container)
    reglerZeile.class("reglerreihe"); // die Variable reglerZeile wird der CSS-Klasse reglerreihe zugewiesen
    reglerZeile.parent("steuerung"); // legt die Stelle fest, wo der Inhalt der Variable reglerZeile eingefügt wird (HTML-Code: ID steuerung)

    wolkenRegler = erstelleRegler(reglerZeile, "Anzahl der Wolken: ", 0, 100, 50); // ruft Funktion erstelleRegler auf: div-Container reglerZeile in dem der Regler erstellt wird, Text, Minimalwert 0, Maximalwert 100, Startwert 50 -> Rückgabe der Funktion in Variable wolkenRegler gespeichert
    wolkenSchwelle = erstelleRegler(reglerZeile, "Wolken- und Regenempfindlichkeit: ", 1, 100, 50); // ruft Funktion erstelleRegler auf: div-Container reglerZeile in dem der Regler erstellt wird, Text, Minimalwert 1, Maximalwert 100, Startwert 50 -> Rückgabe der Funktion in Variable wolkenSchwelle gespeichert
    baumSchwelle = erstelleRegler(reglerZeile, "Baum-Schwellenwert: ", 0, 255, 100); // ruft Funktion erstelleRegler auf: div-Container reglerZeile in dem der Regler erstellt wird, Text, Minimalwert 0, Maximalwert 255 (maximaler Energiewert bei fft), Startwert 100 -> Rückgabe der Funktion in Variable baumSchwelle gespeichert
    hintergrundRegler = erstelleRegler(reglerZeile, "Anzahl der Bäume: ", 0, 8, 4); // ruft Funktion erstelleRegler auf: div-Container reglerZeile in dem der Regler erstellt wird, Text, Minimalwert 0, Maximalwert 8, Startwert 4 -> Rückgabe der Funktion in Variable hintergrundRegler gespeichert

    statusText = createP("Status: Audio aus"); // erstellt HTML-Absatzelement (<p>), Text -> gespeichert in Variable statusText
    statusText.id("status"); // gibt dem HTML-Absatzelement (<p>) die HTML-ID status (in CSS .status)
    statusText.parent("steuerung"); // legt die Stelle fest, wo der Inhalt der Variable reglerZeile eingefügt wird (HTML-Code: ID steuerung) --> Bereich steuerung enthält Buttons, Regler und Statusanzeige
  }

  function erstelleKnopf(eltern, name, funktion) { // Funktion erstelleKnopf mit 3 Parametern: HTML-Container, Beschridtung Button, Funktion beim Drücken des Buttons
    let knopf = createButton(name); // erstellt Button, speichert ihn in der Variable knopf 
    knopf.parent(eltern); // legt fest in welchem HTML-Container der Button erscheinen soll
    knopf.mousePressed(funktion);} // sobald der Button mit der Maus angeklickt wird, wird die Funktion ausgeführt

  function erstelleRegler(eltern, name, min, max, wert) { // Funktion erstelleRegler mit 4 Parametern: HTML-Container, Beschriftung Regler, Minimalwert, Maximalwert, Startwert
    let gruppe = createDiv(); // erstellt neues HTML-Element vom Typ <div> (Container), speichert es in der neuen Variable gruppe (jeder Regler bekommt eigene Gruppe)
    gruppe.class("reglergruppe"); // neu erstellten Container gruppe wird der CSS-Klasse reglergruppe zugewiesen (alle Regler gleiche Klasse)
    gruppe.parent(eltern); // Parameter eltern wird an den übergeordneten HTML-Container reglerZeile übergeben

    let beschriftung = createSpan(name + wert); // erstellt Variable beschriftung, ertsellt HTML-Element (<span>) (wie <dic>-Container, aber innerhalb einer Zeile, für kurze Texte geeignet), übergebener Name des Reglers, übergebener Wert
    beschriftung.parent(gruppe); // Beschriftung wird in den HTML-Container gruppe hinzugefügt (dem einzelnen Regler)

    let regler = createSlider(min, max, wert, 1); // erstellt Schieberegler mit 4 Parametern: Minimalwert, Maximalwert, Startwert, Schritte des Reglers + speichert diesen in der Variable regler
    regler.parent(gruppe); // fügt den Schieberegler in den zuvor erstellten HTML-Container gruppe ein (dem einzelnen Regler)

    regler.input(function() { //  Funktion wird ausgeführt wenn sich der Reglerwert verändert (regler.input()), ändert den Inhalt der Beschriftung (Funktion ohne eigenen Namen)
    beschriftung.html(name + regler.value());}); // .html() verändert den Inhalt des zuvor erstellten HTML-Elements beschriftung (Name + neu engestellter Wert des Regler (durch .value))

    return regler; // return gibt den erstellten Schieberegler als Ergebnis der Funktion zurück (z.B. an Variable wolkenRegler)
  }

  async function starteAudio() { // Funtion starteAudio (async, damit await verwendet werden kann)
    stoppeAlles(); // ruft Funktion stoppeAlles() auf
    statusText.html("Status: Audio wird gestartet..."); // ändert den Inhalt des HTML-Elements statusText (zuvor erstelltes <p>-Element) zu dem neuen Text

    let neuesAudio = new p5.AudioIn(); // new erstellt neues Objekt p5.AudioIn(), ermöglicht Zugriff auf Audioeingang (Objekt), wird in neu erstellter Variable neuesAudio gespeichert
    audio = neuesAudio; // Audioeingangsobjekt (neuesAudio) zusätzlich der Variable audio zugewiesen

    try { // leitet Codeblock ein, in dem Fehler abgefangen werden (Fehler -> catch-Block ausgeführt)
      await userStartAudio(); // Audio-Kontext des Browsers wird aktiviert (userStartAudio), await wartet bis dieser Vorgang abgeschlossen ist

      if (audio !== neuesAudio) {return;} // Wenn Variable audio ungleich mit Variable neuesAudio ist -> Fuktion frühzeitig beenden (für den Fall, dass Benutzer während des Startvorgangs schon auf Stoppen oder Demo-Modus geklickt haben)

      neuesAudio.start(() => { // .start startet den Audioeingang (fordert gegebenenfalls Zugriffsberechtigung) -> Callback-Funktion wenn Audio gestartet wurde
        if (audio !== neuesAudio) { // Wenn Variable audio ungleich mit Variable neuesAudio ist 
          neuesAudio.stop(); // Audioeingang wird gestoppt
          return;} // Callback-Funktion beendet

        fft = new p5.FFT(0.8, 1024); // erstellt Objekt p5.FFT (für Frequenzanalyse): 0,8 -> Glättungsfaktor, 1024 -> Anzahl der Frequenzbereiche, speichert es in Variable fft
        fft.setInput(audio); // Methode .setInput() legt fest, welches Audiosignal (audio) analysiert wird 

        modus = "audio"; // der Variable modus wird der Text audio zugewiesen
        statusText.html("Status: Audio aktiv – Synthesizer spielen");}, audioFehler);} // Aktualisiert HTML-Element mit Statusanzeige
    catch (fehler) {audioFehler(fehler);} // catch fängt aufgetretenen Fehler ab, stellt ihn unter dem Namen fehler zur Verfügung, Funktion audioFehler() wird aufgerufen

    function audioFehler(fehler) { // Funktion audioFehler, über Parameter fehler werden Fehlerinformationen übergeben
      if (audio !== neuesAudio) return; // Wenn Variable audio ungleich mit Variable neuesAudio ist -> Funktion wird beendet (verhindert, dass ein verspäteter Fehler eines alten Startvorgangs einen neu gestarteten Modus unterbricht)

      stoppeAlles(); // führt Funktion stoppe alles aus
      statusText.html("Fehler: Audioeingang nicht verfügbar."); // // Aktualisiert HTML-Element mit Statusanzeige
      console.error(fehler);} // gibt technische Fehlerinformationen an die Entwicklerkonsole des Browsers aus
  }

  function stoppeAlles() { // Funktion stoppeAlles beendet Audio- und Demo-Modus
    if (audio) audio.stop(); // Wenn in Variable audio ein Audioeingangsobjekt vorhanden ist, Audioeingang wird gestoppt

    audio = undefined; // Variable audio verweist nicht mehr auf Variable neuesAudio (zurückgesetzt)
    fft = undefined; // fft wird auch zurückgesetzt 
    modus = "aus"; // modus wird neuer Text zugewiesen

    statusText.html("Status: Audio und Demo gestoppt"); // ändert Textinhalt des HTML-Elements für die Statusanzeige
  }

  function starteDemo() { // Funktion starteDemo
    stoppeAlles(); // führt Funktion stoppeAlles aus
    demoZeit = 0; // Variable demoZeit (Zähler) wird auf 0 gesetzt
    modus = "demo"; // modus wird neuer Text zugewiesen

    statusText.html("Status: Demo-Modus aktiv (ohne Audiosignal)"); // ändert Textinhalt des HTML-Elements für die Statusanzeige
  }

  function baumEnergie(baum, nummer) { // Funktion baumEnergie, 2 Paramter: baum, Nummer/Index des Baumes
    if (modus === "audio" && fft) { // Wenn modus auf audio steht und FFT-Objekt vorhanden sind
      return fft.getEnergy(baum.tief, baum.hoch);} // ermittelt getEnergy Intensität des Frequenzbereichs, .tief = Frequenzuntergrneze, .hoch = Frequenzobergrenze (return gibt Wert zurück und beendet Funktion)

    if (modus === "demo") { // Wenn modus auf demo steht 
      let phase = (demoZeit / 35 + nummer * 0.85) % 6; // dann wird Variable phase erstellt: demoZeit (Zähler) / 35 (Verlangsamt Anstieg des Wertes) + nummer * 0.85 (für zeitliche Verschiebung), % 6 berechnet den Rest einer Division durch 6 und sorgt für eine regelmäßige Wiederholung
      if (phase < 2.5) { // Wenn Variable phase kleiner als 2.5
      	return 190;} // dann wird künstlicher Energiewert 190 zurückgegeben
	  else {
    	return 0;} // Sonst (wenn weder Audio-Modus (mit vorhandenem FFT-Objekt) noch Demo-Modus aktiv ist -> Energiewert 0 wird zurückgegeben
  }

  function zeichneBaeume(hinten) { // Funktion zeichneBaume (Unterscheidung in Bäume hinten und vorne) -> Funktion erwartet Bäume hinten (true)
    for (let i = 0; i < baeume.length; i = i + 1) { // For-Schleife: Index beginnt bei 0, Schleife läuft bis .length (6 Bäume) erreicht ist, Zähler wird nach jedem Durchlauf um 1 erhöht
      if (baeume[i].hinten === hinten) { // Wenn das jeweilige Baumobjekts mit dem übergebenen Parameter hinten übereinstimmt
        baeume[i].bewegen(i); // dann wird die Methode bewegen für das Baumobjekt aufgerufen
        baeume[i].anzeigen();}} // dann wird die Methode anzeigen für das Baumobjekt aufgerufen
  }

  function zeichneHintergrundBaeume() { // Funktion zeichneHintergrundBaeume
    for (let i = 0; i < hintergrundRegler.value(); i = i + 1) { // For-Schleife: Index beginnt bei 0, Schleife läuft bis hintergrundRegler.value() (Wert des Reglers, bis zu 8 Bäume) erreicht ist, Zähler wird nach jedem Durchlauf um 1 erhöht
      hintergrundBaeume[i].bewegen(i + baeume.length); // dann wird die Methode bewegen für das Baumobjekt (im Hintergrund) aufgerufen (durch + baeume.length wird die Nummerierung für den Demo-Modus fortgesetzt)
      hintergrundBaeume[i].anzeigen();} // dann wird die Methode anzeigen für das Baumobjekt (im Hintergrund) aufgerufen
  }

  function draw() { // Funktion wird ständig wiederholt (ca. 60 Durchläufe pro Sekunde)
    background(135, 206, 235); // Farbe der Zeichenfläche (Himmelblau)

    let lautstaerke = 0; // erstellt Variable lautstaerke und setzt sie auf 0

    if (modus === "audio" && audio && audio.enabled) { // Wenn der modus audio ist, Audioobjekt vorhanden ist und der Audioeingang aktiviert ist
      lautstaerke = audio.getLevel(); // dann wird der aktuellen Lautstärkepegel des Audioeingangs ermtteln und in der Variable lautstaerke gespeichert
      fft.analyze();} // dann wird die Methode .analyze ausgeführt (Frequenzanalyse des aktuellen Audiosignals)

    if (modus === "demo") { // Wenn der modus demo ist 
      demoZeit = demoZeit + 1; // dann wird die Variable demozeit bei jedem Durchlauf um 1 erhöht
      lautstaerke = (sin(demoZeit * 0.06) + 1) * 0.07;} // dann wird ein künstlicher, sich regelmäßig verändernder Lautstärkewert erzeugt (sin: regelmäßige Schwingung -1 +1, demoZeit: fortlaufender Zähler, 0.06 bestimmt die Geschwindigkeit der Lautstärkeveränderung, +1 verschiebt den Wertebereich auf 0 bis 2 (verhindert negative Werte), * 0.07 verkleinert den Wertebereich auf 0 bis 0,14)

    let empfindlichkeit = map(wolkenSchwelle.value(), 1, 100, 0.3, 0.03); // Funktion map() überträgt einen Wert aus einem Wertebereich in einen anderen Wertebereich, hier: aktuelle Reglerwert zwischen 1 und 100 wird hier in einen Wert zwischen 0,3 und 0,03 -> je höher der Reglerwert, deto kleiner der neu berechnete Wert empfindlichkeit -> Ergebnis wird in neu erstelletr Variable empfindlichkeit gespeichert 
    let wetterStaerke = constrain(lautstaerke / empfindlichkeit, 0, 1); // Lautstärke durch EMpfindlichkeit teilen, constrain() begrenzt Ergebnis auf einen Wertebereich zwischen 0 und 1 -> Ergenbis wird in neu erstellter Variable wetterStaerke gesperichert (je kleiner der Wert der Variable empfindlichkeit ist, desto größer wird bei gleicher Lautstärke die berechnete Wetterstärke)

    image(sonnenBild, 50, 30, 120, 120); // zeichnet das zuvor geladene Bild der Sonne (x-Position, y-Position, Breite, Höhe)

    let helligkeit = map(wetterStaerke, 0, 1, 255, 60); // Wetterstärke zwischen 0 und 1 wird in einen Helligkeitswert zwischen 255 und 60 umgerechnet (map) -> speichert Ergebnis in neu erstellter Variable helligkeit
    tint(helligkeit); // Funktion tint verändert farbliche Darstellung der nächsten Bilder (Wolken)

    for (let i = 0; i < wolkenRegler.value(); i = i + 1) { // For-Schleife: Index startet bei 0, Schleie läuft solange i kleiner als wolkenRegler.value ist (100), je Druchlauf um 1 erhöht
      wolken[i].bewegen(); // dann wird Methode bewegen ausgeführt für die jeweilige Wolke
      wolken[i].anzeigen();} // dann wird Methode anzeigen ausgeführt für die jeweilige Wolke

    noTint(); // deaktiviert die vorherige Absunkelung durch tint

    image(bergeBild, 0, 0, 750, 500); // zeichnet das zuvor geladene Bild der Berge (x-Position, y-Position, Breite, Höhe)
    image(huegelBild, 0, 0, 750, 500); // zeichnet das zuvor geladene Bild der Hügel (x-Position, y-Position, Breite, Höhe)

    zeichneHintergrundBaeume(); // ruft Funktion zum bewegen und anzeigen der einzelnen Hintergrundbäume auf (Regler)

    image(wasserBild, 0, 0, 750, 500); // zeichnet das zuvor geladene Bild des Wassers (x-Position, y-Position, Breite, Höhe)
    zeichneBaeume(true); // ruft Funktion zum Bewegen und Anzeigen der hinteren Baumobjekte aus dem Array baeume auf

    let regenAnzahl = floor(wetterStaerke * regentropfen.length); // Wetterstärke wird mit der Anzahl der vorhandenen Regentropfenobjekte (30) multipliziert, floor() rundet das Ergebnis auf die nächstkleinere ganze Zahl ab (bei höherer Wetterstärke eine größere Anzahl an Regentropfen) -> Ergbenis wird in neu erstellter Variable regenAnzahl gespeichert

    for (let i = 0; i < regenAnzahl; i = i + 1) { // For-Schleife: Index startet bei 0, Schleife läuft solange i kleienr als regenAnzahl ist (aktueller Wert, bis zu 30), je Durchlauf um 1 erhöht
      regentropfen[i].bewegen(); // dann wird die Methode bewegen aufgerufen
      regentropfen[i].anzeigen();} // dann wird die Methode anzeigen aufgerufen

    image(wiesenBild, 0, 0, 750, 500); // // zeichnet das zuvor geladene Bild der Wiese (x-Position, y-Position, Breite, Höhe)
    image(vordergrundBild, 0, 0, 750, 500); // zeichnet das zuvor geladene Bild im Vordergrund (x-Position, y-Position, Breite, Höhe)
    zeichneBaeume(false); // zeichnet Baumobjekte aus dem Array baeume, deren Eigenschaft hinten auf false gesetzt ist (Bäume in Vordergrund)
  }
