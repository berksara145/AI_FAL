export type NodeData = {
  label: string;
  angle: number;
  imageSource: any;
  subtitle?: string;
  zodiac: string;
  zodiacSymbol: string;
  birthDate: string;
  // Optional explicit numeric fields for seeding DB
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
};

export const orbitNodes: NodeData[] = [
  {
    label: "Ali",
    angle: 30,
    imageSource: require("../../assets/persons/men1.png"),
    zodiac: "Scorpio",
    zodiacSymbol: "♏",
    birthDate: "12 Nov 2001",
    birthYear: 2001,
    birthMonth: 11,
    birthDay: 12,
  },
  {
    label: "Dr. Elara",
    angle: 90,
    imageSource: require("../../assets/persons/woman1.png"),
    zodiac: "Cancer",
    zodiacSymbol: "♋",
    birthDate: "03 Jul 1992",
    birthYear: 1992,
    birthMonth: 7,
    birthDay: 3,
  },
  {
    label: "Helena",
    angle: 150,
    imageSource: require("../../assets/persons/woman2.png"),
    zodiac: "Leo",
    zodiacSymbol: "♌",
    birthDate: "21 Aug 1996",
    birthYear: 1996,
    birthMonth: 8,
    birthDay: 21,
  },
  {
    label: "Kaan",
    angle: 210,
    imageSource: require("../../assets/persons/men2.png"),
    zodiac: "Aquarius",
    zodiacSymbol: "♒",
    birthDate: "05 Feb 1998",
    birthYear: 1998,
    birthMonth: 2,
    birthDay: 5,
  },
  {
    label: "Ahmet",
    angle: 270,
    imageSource: require("../../assets/persons/men2.png"),
    zodiac: "Taurus",
    zodiacSymbol: "♉",
    birthDate: "14 May 1989",
    birthYear: 1989,
    birthMonth: 5,
    birthDay: 14,
  },
  {
    label: "Betül",
    angle: 330,
    imageSource: require("../../assets/persons/woman2.png"),
    zodiac: "Virgo",
    zodiacSymbol: "♍",
    birthDate: "09 Sep 1997",
    birthYear: 1997,
    birthMonth: 9,
    birthDay: 9,
  },
];
