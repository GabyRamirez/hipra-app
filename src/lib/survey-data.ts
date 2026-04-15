export interface SurveyFactor {
  id: number;
  question: string;
  description?: string;
  grades: {
    grade: number;
    label: string;
    points: number;
  }[];
}

export const surveyFactors: SurveyFactor[] = [
  {
    id: 1,
    question: "Coneixements tècnics",
    description: "Nivell de coneixements tècnics que requereix el teu lloc de treball.",
    grades: [
      { grade: 1, label: "Tasques simples repetitives o de rutina.", points: 20 },
      { grade: 2, label: "Realitzar treballs variats simples dins de la seva especialitat.", points: 29 },
      { grade: 3, label: "Realitzar treballs de certa complexitat dins la seva especialitat.", points: 38 },
      { grade: 4, label: "Planejar l'execució d'una feina complicada o inhabitual.", points: 47 },
      { grade: 5, label: "Organitzar treballs complexos i no repetitius.", points: 56 },
      { grade: 6, label: "Treballs d'ofici amb domini d'una especialitat.", points: 64 },
      { grade: 7, label: "Coneixements teòrics/pràctics suficients per a totes les tasques.", points: 73 },
      { grade: 8, label: "Resolució de problemes complexos d'una professió.", points: 82 },
      { grade: 9, label: "Profunds coneixements especialitzats.", points: 91 },
      { grade: 10, label: "Direcció tècnica o investigació complexa.", points: 100 },
    ]
  },
  {
    id: 2,
    question: "Idiomes",
    description: "Necessitat de coneixements d'idiomes estrangers.",
    grades: [
      { grade: 1, label: "No cal fer servir cap idioma estranger.", points: 5 },
      { grade: 2, label: "Coneixements bàsics d'un idioma.", points: 10 },
      { grade: 3, label: "Domini d'un idioma o coneixements de més d'un.", points: 15 },
      { grade: 4, label: "Domini d'un idioma i coneixement d'altres.", points: 20 },
      { grade: 5, label: "Domini de més d'un idioma estranger.", points: 25 },
    ]
  },
  {
    id: 3,
    question: "Període d'aprenentatge / Experiència",
    description: "Temps necessari per ser totalment autònom en el lloc de treball.",
    grades: [
      { grade: 1, label: "Fins a una setmana.", points: 15 },
      { grade: 2, label: "Fins a dues setmanes.", points: 27 },
      { grade: 3, label: "Fins a quatre setmanes.", points: 39 },
      { grade: 4, label: "Fins a vuit setmanes.", points: 51 },
      { grade: 5, label: "Fins a dotze setmanes.", points: 63 },
      { grade: 6, label: "Més de dotze setmanes.", points: 75 },
    ]
  },
  {
    id: 4,
    question: "Iniciativa",
    description: "Grau d'independència al prendre determinades alternatives.",
    grades: [
      { grade: 1, label: "Instruccions molt detallades.", points: 15 },
      { grade: 2, label: "Certa capacitat de discerniment en treballs coneguts.", points: 27 },
      { grade: 3, label: "Iniciativa normal en treballs complexos.", points: 39 },
      { grade: 4, label: "Considerable iniciativa sobre mètodes generals.", points: 51 },
      { grade: 5, label: "Elevat grau d'iniciativa en situacions noves.", points: 63 },
      { grade: 6, label: "Independència total per resultats generals.", points: 75 },
    ]
  },
  {
    id: 5,
    question: "Confidencialitat",
    description: "Responsabilitat exigida sobre informació confidencial.",
    grades: [
      { grade: 1, label: "Sense accés a informació confidencial.", points: 15 },
      { grade: 2, label: "Accés ocasional (danys escassos).", points: 30 },
      { grade: 3, label: "Accés freqüent (danys menys greus).", points: 45 },
      { grade: 4, label: "Accés ocasional (danys greus).", points: 60 },
      { grade: 5, label: "Accés freqüent/normal (danys molt greus).", points: 75 },
    ]
  },
  {
    id: 6,
    question: "Responsabilitat sobre equips i instal·lacions",
    description: "Prevenció de danys en màquines o eines.",
    grades: [
      { grade: 1, label: "Elements manuals simple.", points: 10 },
      { grade: 2, label: "Màquines auxiliars o simples.", points: 20 },
      { grade: 3, label: "Instal·lacions fonamentals.", points: 30 },
      { grade: 4, label: "Màquines especials de gran complexitat.", points: 40 },
      { grade: 5, label: "Instal·lacions de gran valor o alta precisió.", points: 50 },
    ]
  },
  {
    id: 7,
    question: "Responsabilitat sobre errors",
    description: "Impacte dels errors en les tasques.",
    grades: [
      { grade: 1, label: "Fàcilment detectables, poques pèrdues.", points: 5 },
      { grade: 2, label: "Revisats en controls posteriors.", points: 10 },
      { grade: 3, label: "Poden afectar altres àrees.", points: 15 },
      { grade: 4, label: "Difícils de detectar, pèrdues d'informació.", points: 20 },
      { grade: 5, label: "Retards vitals, pèrdues financeres greus.", points: 25 },
    ]
  },
  {
    id: 8,
    question: "Responsabilitat sobre materials",
    description: "Manipulació de materials o productes.",
    grades: [
      { grade: 1, label: "Càrrega/descàrrega de materials normals.", points: 5 },
      { grade: 2, label: "Manipulació de peces de baix cost.", points: 10 },
      { grade: 3, label: "Peces fràgils de baix cost.", points: 15 },
      { grade: 4, label: "Peces normals de cost elevat.", points: 20 },
      { grade: 5, label: "Peces fràgils d'elevat cost o alta precisió.", points: 25 },
    ]
  },
  {
    id: 9,
    question: "Relacions externes / Contactes",
    description: "Responsabilitat sobre els contactes amb altres.",
    grades: [
      { grade: 1, label: "Contacte amb secció i comandament.", points: 5 },
      { grade: 2, label: "Contactes amb altres departaments.", points: 10 },
      { grade: 3, label: "Contactes rutinaris externs.", points: 15 },
      { grade: 4, label: "Contactes responsables externs (subjecte a revisió).", points: 20 },
      { grade: 5, label: "Contactes freqüents externs sense supervisió.", points: 25 },
    ]
  },
  {
    id: 10,
    question: "Seguretat dels altres",
    description: "Responsabilitat sobre la seguretat física d'altres persones.",
    grades: [
      { grade: 1, label: "Impossible causar danys a altres.", points: 5 },
      { grade: 2, label: "Cura normal a l'àrea d'activitat.", points: 10 },
      { grade: 3, label: "Observar regles de seguretat fixes.", points: 15 },
      { grade: 4, label: "Cura constant per perillositat alta.", points: 20 },
      { grade: 5, label: "La seguretat depèn exclusivament de la vigilància.", points: 25 },
    ]
  },
  {
    id: 11,
    question: "Capacitat d'organització i comandament",
    description: "Grau de responsabilitat d'organitzar i dirigir.",
    grades: [
      { grade: 1, label: "Responsable només del propi treball.", points: 5 },
      { grade: 2, label: "Instruir/dirigir 1 o 2 persones.", points: 10 },
      { grade: 3, label: "Dirigir fins a 3 persones.", points: 15 },
      { grade: 4, label: "Dirigir fins a 10 persones.", points: 20 },
      { grade: 5, label: "Dirigir fins a 25 persones.", points: 25 },
    ]
  },
  {
    id: 12,
    question: "Dependència jeràrquica",
    description: "Grau de supervisió rebuda.",
    grades: [
      { grade: 1, label: "Estreta supervisió.", points: 5 },
      { grade: 2, label: "Supervisió final de l'execució.", points: 10 },
      { grade: 3, label: "Supervisió ocasional aleatòria.", points: 15 },
      { grade: 4, label: "A les ordres d'un sol comandament.", points: 20 },
      { grade: 5, label: "Autonomia total de planificació.", points: 25 },
    ]
  },
  {
    id: 13,
    question: "Atenció i Multi-tasca",
    description: "Capacitat d'atendre simultàniament diverses tasques.",
    grades: [
      { grade: 1, label: "Tasques fàcils sense interruccions.", points: 8 },
      { grade: 2, label: "Tasques fàcils amb algunes interruccions.", points: 13 },
      { grade: 3, label: "4-6 tasques fàcils sense interruccions.", points: 17 },
      { grade: 4, label: "Fins a 3 tasques difícils amb interruccions.", points: 22 },
      { grade: 5, label: "4-6 tasques fàcils amb freqüents interruccions.", points: 26 },
      { grade: 6, label: "Més de 6 tasques fàcils amb interruccions.", points: 31 },
      { grade: 7, label: "4-6 tasques difícils amb interruccions.", points: 35 },
      { grade: 8, label: "Més de 6 tasques difícils amb freqüents interruccions.", points: 40 },
    ]
  },
  {
    id: 14,
    question: "Complexitat de tasques (Estacions)",
    description: "Necessitat de dominar diverses estacions de treball.",
    grades: [
      { grade: 1, label: "1 estació de treball.", points: 6 },
      { grade: 2, label: "2 estacions + 1 elemental.", points: 9 },
      { grade: 3, label: "3 estacions + 1 elemental.", points: 13 },
      { grade: 4, label: "4 estacions + 1 elemental.", points: 16 },
      { grade: 5, label: "5 estacions + 1 elemental.", points: 20 },
      { grade: 6, label: "6 estacions + 1 elemental.", points: 23 },
      { grade: 7, label: "7 estacions + 1 elemental.", points: 27 },
      { grade: 8, label: "Més de 7 estacions.", points: 30 },
    ]
  },
  {
    id: 15,
    question: "Condicions de treball",
    description: "Grau de penositat o perillositat.",
    grades: [
      { grade: 1, label: "Cap condició de penositat.", points: 6 },
      { grade: 2, label: "Una condició de penositat.", points: 12 },
      { grade: 3, label: "Dues condicions de penositat.", points: 18 },
      { grade: 4, label: "Tres condicions de penositat.", points: 24 },
      { grade: 5, label: "Més de tres condicions.", points: 30 },
    ]
  }
];

export function calculateProfessionalGroup(totalPoints: number): string {
  if (totalPoints < 143) return "GP 1";
  if (totalPoints < 192) return "GP 2";
  if (totalPoints < 241) return "GP 3";
  if (totalPoints < 290) return "GP 4";
  if (totalPoints < 339) return "GP 5";
  if (totalPoints < 388) return "GP 6";
  if (totalPoints < 436) return "GP 7";
  return "GP 8";
}
