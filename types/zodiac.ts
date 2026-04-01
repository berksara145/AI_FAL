export type ZodiacInfo = {
    /** English sign name, e.g. "Scorpio" */
    name: string;
    /** Turkish sign name, e.g. "Akrep" */
    nameTr: string;
    /** Unicode glyph, e.g. "♏" */
    symbol: string;
    /** 1–12 index, Aries = 1 ... Pisces = 12 */
    index: number;
    /** Pre-required image for this sign */
    image: any;
  };