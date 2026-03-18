export interface TarotCard {
  id: string;
  name: string;
  image: ReturnType<typeof require>;
}

// Static image map — React Native requires all requires to be static
const IMAGES = {
  // Major Arcana
  "00-TheFool":          require("../assets/Cards-jpg/00-TheFool.jpg"),
  "01-TheMagician":      require("../assets/Cards-jpg/01-TheMagician.jpg"),
  "02-TheHighPriestess": require("../assets/Cards-jpg/02-TheHighPriestess.jpg"),
  "03-TheEmpress":       require("../assets/Cards-jpg/03-TheEmpress.jpg"),
  "04-TheEmperor":       require("../assets/Cards-jpg/04-TheEmperor.jpg"),
  "05-TheHierophant":    require("../assets/Cards-jpg/05-TheHierophant.jpg"),
  "06-TheLovers":        require("../assets/Cards-jpg/06-TheLovers.jpg"),
  "07-TheChariot":       require("../assets/Cards-jpg/07-TheChariot.jpg"),
  "08-Strength":         require("../assets/Cards-jpg/08-Strength.jpg"),
  "09-TheHermit":        require("../assets/Cards-jpg/09-TheHermit.jpg"),
  "10-WheelOfFortune":   require("../assets/Cards-jpg/10-WheelOfFortune.jpg"),
  "11-Justice":          require("../assets/Cards-jpg/11-Justice.jpg"),
  "12-TheHangedMan":     require("../assets/Cards-jpg/12-TheHangedMan.jpg"),
  "13-Death":            require("../assets/Cards-jpg/13-Death.jpg"),
  "14-Temperance":       require("../assets/Cards-jpg/14-Temperance.jpg"),
  "15-TheDevil":         require("../assets/Cards-jpg/15-TheDevil.jpg"),
  "16-TheTower":         require("../assets/Cards-jpg/16-TheTower.jpg"),
  "17-TheStar":          require("../assets/Cards-jpg/17-TheStar.jpg"),
  "18-TheMoon":          require("../assets/Cards-jpg/18-TheMoon.jpg"),
  "19-TheSun":           require("../assets/Cards-jpg/19-TheSun.jpg"),
  "20-Judgement":        require("../assets/Cards-jpg/20-Judgement.jpg"),
  "21-TheWorld":         require("../assets/Cards-jpg/21-TheWorld.jpg"),
  // Cups
  "Cups01": require("../assets/Cards-jpg/Cups01.jpg"),
  "Cups02": require("../assets/Cards-jpg/Cups02.jpg"),
  "Cups03": require("../assets/Cards-jpg/Cups03.jpg"),
  "Cups04": require("../assets/Cards-jpg/Cups04.jpg"),
  "Cups05": require("../assets/Cards-jpg/Cups05.jpg"),
  "Cups06": require("../assets/Cards-jpg/Cups06.jpg"),
  "Cups07": require("../assets/Cards-jpg/Cups07.jpg"),
  "Cups08": require("../assets/Cards-jpg/Cups08.jpg"),
  "Cups09": require("../assets/Cards-jpg/Cups09.jpg"),
  "Cups10": require("../assets/Cards-jpg/Cups10.jpg"),
  "Cups11": require("../assets/Cards-jpg/Cups11.jpg"),
  "Cups12": require("../assets/Cards-jpg/Cups12.jpg"),
  "Cups13": require("../assets/Cards-jpg/Cups13.jpg"),
  "Cups14": require("../assets/Cards-jpg/Cups14.jpg"),
  // Pentacles
  "Pentacles01": require("../assets/Cards-jpg/Pentacles01.jpg"),
  "Pentacles02": require("../assets/Cards-jpg/Pentacles02.jpg"),
  "Pentacles03": require("../assets/Cards-jpg/Pentacles03.jpg"),
  "Pentacles04": require("../assets/Cards-jpg/Pentacles04.jpg"),
  "Pentacles05": require("../assets/Cards-jpg/Pentacles05.jpg"),
  "Pentacles06": require("../assets/Cards-jpg/Pentacles06.jpg"),
  "Pentacles07": require("../assets/Cards-jpg/Pentacles07.jpg"),
  "Pentacles08": require("../assets/Cards-jpg/Pentacles08.jpg"),
  "Pentacles09": require("../assets/Cards-jpg/Pentacles09.jpg"),
  "Pentacles10": require("../assets/Cards-jpg/Pentacles10.jpg"),
  "Pentacles11": require("../assets/Cards-jpg/Pentacles11.jpg"),
  "Pentacles12": require("../assets/Cards-jpg/Pentacles12.jpg"),
  "Pentacles13": require("../assets/Cards-jpg/Pentacles13.jpg"),
  "Pentacles14": require("../assets/Cards-jpg/Pentacles14.jpg"),
  // Swords
  "Swords01": require("../assets/Cards-jpg/Swords01.jpg"),
  "Swords02": require("../assets/Cards-jpg/Swords02.jpg"),
  "Swords03": require("../assets/Cards-jpg/Swords03.jpg"),
  "Swords04": require("../assets/Cards-jpg/Swords04.jpg"),
  "Swords05": require("../assets/Cards-jpg/Swords05.jpg"),
  "Swords06": require("../assets/Cards-jpg/Swords06.jpg"),
  "Swords07": require("../assets/Cards-jpg/Swords07.jpg"),
  "Swords08": require("../assets/Cards-jpg/Swords08.jpg"),
  "Swords09": require("../assets/Cards-jpg/Swords09.jpg"),
  "Swords10": require("../assets/Cards-jpg/Swords10.jpg"),
  "Swords11": require("../assets/Cards-jpg/Swords11.jpg"),
  "Swords12": require("../assets/Cards-jpg/Swords12.jpg"),
  "Swords13": require("../assets/Cards-jpg/Swords13.jpg"),
  "Swords14": require("../assets/Cards-jpg/Swords14.jpg"),
  // Wands
  "Wands01": require("../assets/Cards-jpg/Wands01.jpg"),
  "Wands02": require("../assets/Cards-jpg/Wands02.jpg"),
  "Wands03": require("../assets/Cards-jpg/Wands03.jpg"),
  "Wands04": require("../assets/Cards-jpg/Wands04.jpg"),
  "Wands05": require("../assets/Cards-jpg/Wands05.jpg"),
  "Wands06": require("../assets/Cards-jpg/Wands06.jpg"),
  "Wands07": require("../assets/Cards-jpg/Wands07.jpg"),
  "Wands08": require("../assets/Cards-jpg/Wands08.jpg"),
  "Wands09": require("../assets/Cards-jpg/Wands09.jpg"),
  "Wands10": require("../assets/Cards-jpg/Wands10.jpg"),
  "Wands11": require("../assets/Cards-jpg/Wands11.jpg"),
  "Wands12": require("../assets/Cards-jpg/Wands12.jpg"),
  "Wands13": require("../assets/Cards-jpg/Wands13.jpg"),
  "Wands14": require("../assets/Cards-jpg/Wands14.jpg"),
};

export const CARD_BACK = require("../assets/Cards-jpg/CardBacks.jpg");

function minorName(suit: string, num: number): string {
  const ranks: Record<number, string> = {
    1: "Ace", 11: "Page", 12: "Knight", 13: "Queen", 14: "King",
  };
  const rank = ranks[num] ?? String(num);
  return `${rank} of ${suit}`;
}

export const TAROT_DECK: TarotCard[] = [
  // Major Arcana
  { id: "00-TheFool",          name: "The Fool",           image: IMAGES["00-TheFool"] },
  { id: "01-TheMagician",      name: "The Magician",       image: IMAGES["01-TheMagician"] },
  { id: "02-TheHighPriestess", name: "The High Priestess", image: IMAGES["02-TheHighPriestess"] },
  { id: "03-TheEmpress",       name: "The Empress",        image: IMAGES["03-TheEmpress"] },
  { id: "04-TheEmperor",       name: "The Emperor",        image: IMAGES["04-TheEmperor"] },
  { id: "05-TheHierophant",    name: "The Hierophant",     image: IMAGES["05-TheHierophant"] },
  { id: "06-TheLovers",        name: "The Lovers",         image: IMAGES["06-TheLovers"] },
  { id: "07-TheChariot",       name: "The Chariot",        image: IMAGES["07-TheChariot"] },
  { id: "08-Strength",         name: "Strength",           image: IMAGES["08-Strength"] },
  { id: "09-TheHermit",        name: "The Hermit",         image: IMAGES["09-TheHermit"] },
  { id: "10-WheelOfFortune",   name: "Wheel of Fortune",   image: IMAGES["10-WheelOfFortune"] },
  { id: "11-Justice",          name: "Justice",            image: IMAGES["11-Justice"] },
  { id: "12-TheHangedMan",     name: "The Hanged Man",     image: IMAGES["12-TheHangedMan"] },
  { id: "13-Death",            name: "Death",              image: IMAGES["13-Death"] },
  { id: "14-Temperance",       name: "Temperance",         image: IMAGES["14-Temperance"] },
  { id: "15-TheDevil",         name: "The Devil",          image: IMAGES["15-TheDevil"] },
  { id: "16-TheTower",         name: "The Tower",          image: IMAGES["16-TheTower"] },
  { id: "17-TheStar",          name: "The Star",           image: IMAGES["17-TheStar"] },
  { id: "18-TheMoon",          name: "The Moon",           image: IMAGES["18-TheMoon"] },
  { id: "19-TheSun",           name: "The Sun",            image: IMAGES["19-TheSun"] },
  { id: "20-Judgement",        name: "Judgement",          image: IMAGES["20-Judgement"] },
  { id: "21-TheWorld",         name: "The World",          image: IMAGES["21-TheWorld"] },
  // Cups
  ...([1,2,3,4,5,6,7,8,9,10,11,12,13,14] as const).map((n) => ({
    id: `Cups${String(n).padStart(2, "0")}`,
    name: minorName("Cups", n),
    image: IMAGES[`Cups${String(n).padStart(2, "0")}` as keyof typeof IMAGES],
  })),
  // Pentacles
  ...([1,2,3,4,5,6,7,8,9,10,11,12,13,14] as const).map((n) => ({
    id: `Pentacles${String(n).padStart(2, "0")}`,
    name: minorName("Pentacles", n),
    image: IMAGES[`Pentacles${String(n).padStart(2, "0")}` as keyof typeof IMAGES],
  })),
  // Swords
  ...([1,2,3,4,5,6,7,8,9,10,11,12,13,14] as const).map((n) => ({
    id: `Swords${String(n).padStart(2, "0")}`,
    name: minorName("Swords", n),
    image: IMAGES[`Swords${String(n).padStart(2, "0")}` as keyof typeof IMAGES],
  })),
  // Wands
  ...([1,2,3,4,5,6,7,8,9,10,11,12,13,14] as const).map((n) => ({
    id: `Wands${String(n).padStart(2, "0")}`,
    name: minorName("Wands", n),
    image: IMAGES[`Wands${String(n).padStart(2, "0")}` as keyof typeof IMAGES],
  })),
];

export function drawThreeCards(): [TarotCard, TarotCard, TarotCard] {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1], shuffled[2]];
}

export function getCardById(id: string): TarotCard | undefined {
  return TAROT_DECK.find((c) => c.id === id);
}
