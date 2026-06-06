/* vocab.js — 24 weekly German vocabulary sets (German only; translations live in locales/). */
const VOCAB = {
  1: { theme: "Begrüßung, Familie, Zahlen", words: [
    "Hallo","Guten Tag","Guten Morgen","Guten Abend","Tschüss",
    "Auf Wiedersehen","Bis bald","Wie geht's?","Mir geht es gut","Danke schön",
    "Bitte","Entschuldigung","die Familie","die Eltern","der Vater",
    "die Mutter","der Sohn","die Tochter","der Bruder","die Schwester",
    "der Großvater","die Großmutter","der Onkel","die Tante","das Kind",
    "der Mann","die Frau","der Junge","das Mädchen","eins",
    "zwei","drei","zehn","zwanzig","hundert",
    "das Jahr","Wie heißt du?","Ich heiße…","Woher kommst du?","Ich komme aus…",
    "Wie alt bist du?","Ich verstehe nicht"
  ]},
  2: { theme: "Lebensmittel, Einkaufen", words: [
    "das Brot","die Butter","der Käse","die Milch","das Ei",
    "das Fleisch","der Fisch","das Gemüse","das Obst","der Apfel",
    "die Banane","die Tomate","die Kartoffel","die Zwiebel","der Reis",
    "die Nudeln","der Zucker","das Salz","der Kaffee","der Tee",
    "das Wasser","der Saft","das Bier","der Wein","der Kuchen",
    "der Supermarkt","die Bäckerei","der Markt","der Preis","billig",
    "teuer","kaufen","bezahlen","kosten","brauchen",
    "nehmen","möchten","das Geld","das Kilo","die Flasche",
    "frisch","lecker"
  ]},
  3: { theme: "Hobbys, Sport, Freizeit", words: [
    "das Hobby","die Freizeit","der Sport","spielen","lesen",
    "schreiben","hören","sehen","fernsehen","singen",
    "tanzen","malen","kochen","backen","reisen",
    "laufen","schwimmen","Fußball","Tennis","das Buch",
    "der Film","das Konzert","das Museum","das Restaurant","das Café",
    "der Park","wandern","gerne","lieber","interessant",
    "langweilig","spannend","lustig","oft","nie",
    "selten"
  ]},
  4: { theme: "Wohnen, Möbel, Räume", words: [
    "das Haus","die Wohnung","das Zimmer","das Schlafzimmer","das Wohnzimmer",
    "die Küche","das Bad","der Balkon","der Flur","der Garten",
    "die Tür","das Fenster","die Wand","der Tisch","der Stuhl",
    "das Sofa","der Sessel","das Bett","der Schrank","das Regal",
    "der Teppich","die Lampe","das Bild","der Kühlschrank","der Herd",
    "der Fernseher","groß","klein","hell","dunkel",
    "modern","alt","gemütlich","sauber","wohnen",
    "mieten","die Miete","umziehen"
  ]},
  5: { theme: "Tagesablauf, Perfekt-Verben", words: [
    "aufstehen — aufgestanden","frühstücken — gefrühstückt","arbeiten — gearbeitet","essen — gegessen","trinken — getrunken",
    "lernen — gelernt","lesen — gelesen","schreiben — geschrieben","sprechen — gesprochen","fahren — gefahren (sein)",
    "fliegen — geflogen (sein)","laufen — gelaufen (sein)","kommen — gekommen (sein)","gehen — gegangen (sein)","bleiben — geblieben (sein)",
    "sein — gewesen (sein)","werden — geworden (sein)","machen — gemacht","sehen — gesehen","finden — gefunden",
    "geben — gegeben","nehmen — genommen","verstehen — verstanden","wissen — gewusst","denken — gedacht",
    "der Morgen","der Abend","gestern","heute","morgen",
    "zuerst","dann"
  ]},
  6: { theme: "Verkehr, Reise", words: [
    "das Auto","der Bus","die U-Bahn","die S-Bahn","die Straßenbahn",
    "das Fahrrad","der Zug","das Flugzeug","das Taxi","die Haltestelle",
    "der Bahnhof","der Flughafen","die Fahrkarte","abfahren","ankommen",
    "einsteigen","aussteigen","umsteigen","anrufen","abholen",
    "mitbringen","die Reise","der Urlaub","das Hotel","der Koffer",
    "der Rucksack"
  ]},
  7: { theme: "Stadt, Orientierung", words: [
    "die Stadt","das Dorf","die Straße","der Platz","die Kreuzung",
    "die Ampel","die Brücke","das Krankenhaus","die Apotheke","die Post",
    "die Bank","die Polizei","die Kirche","das Rathaus","geradeaus",
    "links","rechts","weit","abbiegen"
  ]},
  8: { theme: "Повторение фазы 1", words: [
    "wichtig","möglich","nötig","sicher","fertig",
    "kostenlos","zusammen","allein","ungefähr","genau",
    "vielleicht","natürlich","leider","plötzlich","fast",
    "sofort","später","früher","normalerweise","wahrscheinlich"
  ]},
  9: { theme: "Biografie, Präteritum", words: [
    "die Biografie","das Leben","geboren sein","aufwachsen","die Kindheit",
    "die Jugend","heiraten","studieren","der Beruf","sterben",
    "damals","später","war","hatte","wurde",
    "konnte","musste","wollte"
  ]},
  10: { theme: "Schule, Studium, Arbeit", words: [
    "die Schule","der Schüler","der Lehrer","die Universität","der Student",
    "das Studium","das Fach","die Note","die Prüfung","bestehen",
    "der Job","die Stelle","der Chef","der Kollege","das Gehalt",
    "die Karriere","der Erfolg","der Lebenslauf","das Praktikum"
  ]},
  11: { theme: "Charakter, Komparativ", words: [
    "der Charakter","nett","freundlich","höflich","lustig",
    "ernst","geduldig","fleißig","faul","ehrlich",
    "intelligent","mutig","schüchtern","großzügig","ruhig",
    "besser","am besten","mehr","weniger"
  ]},
  12: { theme: "Meinung, Argumente", words: [
    "meiner Meinung nach","ich denke, dass…","ich glaube, dass…","der Grund","der Vorteil",
    "der Nachteil","das Beispiel","zum Beispiel","außerdem","trotzdem",
    "deshalb","obwohl","weil","dass","ob",
    "damit","bevor","nachdem"
  ]},
  13: { theme: "Erinnerungen, Emotionen", words: [
    "sich erinnern an","vergessen","sich freuen über","sich ärgern über","glücklich",
    "zufrieden","überrascht","enttäuscht","müde","gestresst",
    "aufgeregt","entspannt","die Erinnerung","als","wenn",
    "während","sobald"
  ]},
  14: { theme: "Genitiv, Familie erweitert", words: [
    "wegen","trotz","während","statt","aufgrund",
    "der Schwager","die Schwägerin","der Schwiegervater","die Schwiegermutter","der Enkel",
    "die Enkelin","der Neffe","die Nichte","der Nachbar"
  ]},
  15: { theme: "Reflexive Verben", words: [
    "sich freuen","sich interessieren für","sich treffen mit","sich erholen","sich entspannen",
    "sich beeilen","sich verspäten","sich anziehen","sich ausziehen","sich duschen",
    "sich setzen","sich vorstellen","sich entscheiden","sich kümmern um","sich unterhalten",
    "sich entschuldigen"
  ]},
  16: { theme: "Beschreibungen, Kleidung", words: [
    "die Kleidung","das Hemd","die Hose","der Rock","das Kleid",
    "die Jacke","der Mantel","der Schuh","die Socke","der Hut",
    "die Mütze","der Schal","tragen","anziehen","ausziehen",
    "der Stoff","die Farbe","passen","anprobieren"
  ]},
  17: { theme: "Erweiterte Beschreibungen", words: [
    "atemberaubend","beeindruckend","herausragend","bemerkenswert","außergewöhnlich",
    "enttäuschend","seltsam","typisch","üblich","selten",
    "einzigartig","wertvoll","nützlich","schwierig","kompliziert",
    "einfach"
  ]},
  18: { theme: "Prozesse, Passiv", words: [
    "der Prozess","die Anweisung","die Anleitung","herstellen","produzieren",
    "verarbeiten","entwickeln","bauen","reparieren","benutzen",
    "verwenden","bedienen","wird gebaut","wurde gebaut"
  ]},
  19: { theme: "Konjunktiv II — вежливость", words: [
    "der Wunsch","wünschen","hoffen","könnten Sie…","ich würde gerne…",
    "es wäre schön, wenn…","der Vorschlag","der Rat","raten","sollte",
    "müsste","dürfte"
  ]},
  20: { theme: "Berufe, Relativsätze", words: [
    "der Arzt","die Krankenschwester","der Ingenieur","der Anwalt","der Richter",
    "der Architekt","der Journalist","der Übersetzer","der Verkäufer","der Kunde",
    "der Mitarbeiter","der Vorgesetzte"
  ]},
  21: { theme: "Medien, Politik", words: [
    "die Nachrichten","die Zeitung","die Zeitschrift","der Artikel","die Sendung",
    "die Werbung","die Regierung","die Wahl","die Partei","der Politiker",
    "das Gesetz","die Demokratie","die Gesellschaft","die Umwelt","die Wirtschaft",
    "die Krise"
  ]},
  22: { theme: "Verben mit Präpositionen", words: [
    "sich freuen auf","warten auf","denken an","sich erinnern an","sich interessieren für",
    "sich kümmern um","sich entscheiden für","träumen von","sprechen über","abhängen von",
    "teilnehmen an","bestehen aus","fragen nach","achten auf"
  ]},
  23: { theme: "B1 Wortschatz", words: [
    "die Gelegenheit","die Bedeutung","der Unterschied","die Auswirkung","der Zusammenhang",
    "der Eindruck","die Notwendigkeit","berücksichtigen","betonen","bestätigen",
    "behaupten","bezweifeln","empfehlen","erwähnen","beschreiben",
    "vergleichen"
  ]},
  24: { theme: "Redemittel B1", words: [
    "Zunächst möchte ich…","Zum einen…","Zum anderen…","Ein weiterer Punkt ist…","Abschließend kann man sagen…",
    "Da bin ich anderer Meinung","Das sehe ich genauso","Das stimmt zwar, aber…","Es kommt darauf an"
  ]},
};
