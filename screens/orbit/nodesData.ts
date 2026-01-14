export type NodeData = {
  label: string;
  angle: number;
  imageSource: any;
  subtitle?: string;
  zodiac: string;
  zodiacSymbol: string;
  birthDate: string;
};

export const orbitNodes: NodeData[] = [
  {
    label: "Ali",
    angle: 30,
    imageSource: require("../../assets/persons/men1.png"),
    zodiac: "Scorpio",
    zodiacSymbol: "♏",
    birthDate: "12 Nov 2001",
  },
  {
    label: "Dr. Elara",
    angle: 90,
    imageSource: require("../../assets/persons/woman1.png"),
    zodiac: "Cancer",
    zodiacSymbol: "♋",
    birthDate: "03 Jul 1992",
  },
  {
    label: "Helena",
    angle: 150,
    imageSource: require("../../assets/persons/woman2.png"),
    zodiac: "Leo",
    zodiacSymbol: "♌",
    birthDate: "21 Aug 1996",
  },
  {
    label: "Kaan",
    angle: 210,
    imageSource: require("../../assets/persons/men2.png"),
    zodiac: "Aquarius",
    zodiacSymbol: "♒",
    birthDate: "05 Feb 1998",
  },
  {
    label: "Ahmet",
    angle: 270,
    imageSource: require("../../assets/persons/men2.png"),
    zodiac: "Taurus",
    zodiacSymbol: "♉",
    birthDate: "14 May 1989",
  },
  {
    label: "Betül",
    angle: 330,
    imageSource: require("../../assets/persons/woman2.png"),
    zodiac: "Virgo",
    zodiacSymbol: "♍",
    birthDate: "09 Sep 1997",
  },
];
