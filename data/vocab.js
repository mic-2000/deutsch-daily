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

/* PLURALS — plural form for the countable nouns above, keyed by the EXACT singular string used in
   VOCAB (incl. its article). German-only (no locale alignment needed). Uncountable, plural-only and
   ambiguous nouns are intentionally omitted — the plural trainer only offers a card when a key
   exists here. Edit this table if a base word changes. */
const PLURALS = {
  // 1 — Begrüßung, Familie
  "die Familie": "die Familien", "der Vater": "die Väter", "die Mutter": "die Mütter",
  "der Sohn": "die Söhne", "die Tochter": "die Töchter", "der Bruder": "die Brüder",
  "die Schwester": "die Schwestern", "der Großvater": "die Großväter", "die Großmutter": "die Großmütter",
  "der Onkel": "die Onkel", "die Tante": "die Tanten", "das Kind": "die Kinder",
  "der Mann": "die Männer", "die Frau": "die Frauen", "der Junge": "die Jungen",
  "das Mädchen": "die Mädchen", "das Jahr": "die Jahre",
  // 2 — Lebensmittel
  "das Brot": "die Brote", "das Ei": "die Eier", "der Fisch": "die Fische",
  "der Apfel": "die Äpfel", "die Banane": "die Bananen", "die Tomate": "die Tomaten",
  "die Kartoffel": "die Kartoffeln", "die Zwiebel": "die Zwiebeln", "der Saft": "die Säfte",
  "das Bier": "die Biere", "der Wein": "die Weine", "der Kuchen": "die Kuchen",
  "der Supermarkt": "die Supermärkte", "die Bäckerei": "die Bäckereien", "der Markt": "die Märkte",
  "der Preis": "die Preise", "das Kilo": "die Kilo", "die Flasche": "die Flaschen",
  // 3 — Hobbys, Freizeit
  "das Hobby": "die Hobbys", "das Buch": "die Bücher", "der Film": "die Filme",
  "das Konzert": "die Konzerte", "das Museum": "die Museen", "das Restaurant": "die Restaurants",
  "das Café": "die Cafés", "der Park": "die Parks",
  // 4 — Wohnen, Möbel
  "das Haus": "die Häuser", "die Wohnung": "die Wohnungen", "das Zimmer": "die Zimmer",
  "das Schlafzimmer": "die Schlafzimmer", "das Wohnzimmer": "die Wohnzimmer", "die Küche": "die Küchen",
  "das Bad": "die Bäder", "der Balkon": "die Balkone", "der Flur": "die Flure",
  "der Garten": "die Gärten", "die Tür": "die Türen", "das Fenster": "die Fenster",
  "die Wand": "die Wände", "der Tisch": "die Tische", "der Stuhl": "die Stühle",
  "das Sofa": "die Sofas", "der Sessel": "die Sessel", "das Bett": "die Betten",
  "der Schrank": "die Schränke", "das Regal": "die Regale", "der Teppich": "die Teppiche",
  "die Lampe": "die Lampen", "das Bild": "die Bilder", "der Kühlschrank": "die Kühlschränke",
  "der Herd": "die Herde", "der Fernseher": "die Fernseher", "die Miete": "die Mieten",
  // 5 — Tagesablauf (nouns)
  "der Morgen": "die Morgen", "der Abend": "die Abende",
  // 6 — Verkehr, Reise
  "das Auto": "die Autos", "der Bus": "die Busse", "die U-Bahn": "die U-Bahnen",
  "die S-Bahn": "die S-Bahnen", "die Straßenbahn": "die Straßenbahnen", "das Fahrrad": "die Fahrräder",
  "der Zug": "die Züge", "das Flugzeug": "die Flugzeuge", "das Taxi": "die Taxis",
  "die Haltestelle": "die Haltestellen", "der Bahnhof": "die Bahnhöfe", "der Flughafen": "die Flughäfen",
  "die Fahrkarte": "die Fahrkarten", "die Reise": "die Reisen", "das Hotel": "die Hotels",
  "der Koffer": "die Koffer", "der Rucksack": "die Rucksäcke",
  // 7 — Stadt
  "die Stadt": "die Städte", "das Dorf": "die Dörfer", "die Straße": "die Straßen",
  "der Platz": "die Plätze", "die Kreuzung": "die Kreuzungen", "die Ampel": "die Ampeln",
  "die Brücke": "die Brücken", "das Krankenhaus": "die Krankenhäuser", "die Apotheke": "die Apotheken",
  "die Bank": "die Banken", "die Kirche": "die Kirchen", "das Rathaus": "die Rathäuser",
  // 9 — Biografie (nouns)
  "die Biografie": "die Biografien", "das Leben": "die Leben", "der Beruf": "die Berufe",
  // 10 — Schule, Arbeit
  "die Schule": "die Schulen", "der Schüler": "die Schüler", "der Lehrer": "die Lehrer",
  "die Universität": "die Universitäten", "der Student": "die Studenten", "das Studium": "die Studien",
  "das Fach": "die Fächer", "die Note": "die Noten", "die Prüfung": "die Prüfungen",
  "der Job": "die Jobs", "die Stelle": "die Stellen", "der Chef": "die Chefs",
  "der Kollege": "die Kollegen", "das Gehalt": "die Gehälter", "die Karriere": "die Karrieren",
  "der Erfolg": "die Erfolge", "der Lebenslauf": "die Lebensläufe", "das Praktikum": "die Praktika",
  // 11 — Charakter (nouns)
  "der Charakter": "die Charaktere",
  // 12 — Meinung (nouns)
  "der Grund": "die Gründe", "der Vorteil": "die Vorteile", "der Nachteil": "die Nachteile",
  "das Beispiel": "die Beispiele",
  // 13 — Emotionen (nouns)
  "die Erinnerung": "die Erinnerungen",
  // 14 — Familie erweitert
  "der Schwager": "die Schwäger", "die Schwägerin": "die Schwägerinnen", "der Schwiegervater": "die Schwiegerväter",
  "die Schwiegermutter": "die Schwiegermütter", "der Enkel": "die Enkel", "die Enkelin": "die Enkelinnen",
  "der Neffe": "die Neffen", "die Nichte": "die Nichten", "der Nachbar": "die Nachbarn",
  // 16 — Kleidung
  "das Hemd": "die Hemden", "die Hose": "die Hosen", "der Rock": "die Röcke",
  "das Kleid": "die Kleider", "die Jacke": "die Jacken", "der Mantel": "die Mäntel",
  "der Schuh": "die Schuhe", "die Socke": "die Socken", "der Hut": "die Hüte",
  "die Mütze": "die Mützen", "der Schal": "die Schals", "der Stoff": "die Stoffe",
  "die Farbe": "die Farben",
  // 18 — Prozesse (nouns)
  "der Prozess": "die Prozesse", "die Anweisung": "die Anweisungen", "die Anleitung": "die Anleitungen",
  // 19 — Konjunktiv II (nouns)
  "der Wunsch": "die Wünsche", "der Vorschlag": "die Vorschläge",
  // 20 — Berufe
  "der Arzt": "die Ärzte", "die Krankenschwester": "die Krankenschwestern", "der Ingenieur": "die Ingenieure",
  "der Anwalt": "die Anwälte", "der Richter": "die Richter", "der Architekt": "die Architekten",
  "der Journalist": "die Journalisten", "der Übersetzer": "die Übersetzer", "der Verkäufer": "die Verkäufer",
  "der Kunde": "die Kunden", "der Mitarbeiter": "die Mitarbeiter", "der Vorgesetzte": "die Vorgesetzten",
  // 21 — Medien, Politik
  "die Zeitung": "die Zeitungen", "die Zeitschrift": "die Zeitschriften", "der Artikel": "die Artikel",
  "die Sendung": "die Sendungen", "die Regierung": "die Regierungen", "die Wahl": "die Wahlen",
  "die Partei": "die Parteien", "der Politiker": "die Politiker", "das Gesetz": "die Gesetze",
  "die Demokratie": "die Demokratien", "die Gesellschaft": "die Gesellschaften", "die Krise": "die Krisen",
  // 23 — B1 Wortschatz (nouns)
  "die Gelegenheit": "die Gelegenheiten", "die Bedeutung": "die Bedeutungen", "der Unterschied": "die Unterschiede",
  "die Auswirkung": "die Auswirkungen", "der Zusammenhang": "die Zusammenhänge", "der Eindruck": "die Eindrücke",
  "die Notwendigkeit": "die Notwendigkeiten",
};
