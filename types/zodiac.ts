export type ZodiacInfo = {
    /** Localized sign name, e.g. "Scorpio" */
    name: string;
    /** Unicode glyph, e.g. "♏" */
    symbol: string;
    /** 1–12 index, Aries = 1 ... Pisces = 12 */
    index: number;
    /** Pre-required image for this sign */
    image: any;
  };