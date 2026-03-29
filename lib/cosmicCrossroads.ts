/**
 * Cosmic Crossroads — yes/no oracle using the 22 Major Arcana.
 * Card for the day is deterministic: same card all day, changes at midnight.
 * Day-of-week weighting biases the draw toward thematically resonant cards.
 */

import { TAROT_DECK, type TarotCard } from "./tarotDeck";

// ─── Data ────────────────────────────────────────────────────────────────────

export type CrossroadsDirection = "proceed" | "pause" | "wait";

export interface CrossroadsCard {
  deckId: string;               // matches TarotCard.id in tarotDeck.ts
  name: string;
  nameTr: string;
  direction: CrossroadsDirection;
  verdict: string;              // spoken in the card's voice, one line
  verdictTr: string;            // Turkish version of verdict
  crossroads_meaning: string;   // what this card means in a binary decision context
}

export const MAJOR_ARCANA_CROSSROADS: CrossroadsCard[] = [
  {
    deckId: "00-TheFool",
    name: "The Fool",
    nameTr: "Deli",
    direction: "proceed",
    verdict: "The Fool says: step off the edge — the net was never guaranteed.",
    verdictTr: "Deli der ki: uçurumdan atla — ağ hiçbir zaman garantili değildi.",
    crossroads_meaning:
      "Leap before the window closes. Caution is just fear wearing a sensible coat. The unknown ahead is friendlier than the known behind.",
  },
  {
    deckId: "01-TheMagician",
    name: "The Magician",
    nameTr: "Sihirbaz",
    direction: "proceed",
    verdict: "The Magician says: every tool is already in your hand — use them.",
    verdictTr: "Sihirbaz der ki: her araç zaten elinde — kullan onları.",
    crossroads_meaning:
      "You are not waiting on permission or resources. What you have is enough. Act with intention and the outcome will follow your will.",
  },
  {
    deckId: "02-TheHighPriestess",
    name: "The High Priestess",
    nameTr: "Yüksek Rahibe",
    direction: "wait",
    verdict: "The High Priestess says: what you hear in silence is the answer.",
    verdictTr: "Yüksek Rahibe der ki: sessizlikte duyduğun, cevabın ta kendisi.",
    crossroads_meaning:
      "Do not force this decision. Something is not yet visible. Sit with the question one more day before you commit.",
  },
  {
    deckId: "03-TheEmpress",
    name: "The Empress",
    nameTr: "İmparatoriçe",
    direction: "proceed",
    verdict: "The Empress says: let it bloom — it has been waiting long enough.",
    verdictTr: "İmparatoriçe der ki: açmasına izin ver — yeterince bekledi.",
    crossroads_meaning:
      "Conditions are ripe. What you're considering will grow if you give it ground. Abundance follows the one willing to nurture what they want.",
  },
  {
    deckId: "04-TheEmperor",
    name: "The Emperor",
    nameTr: "İmparator",
    direction: "proceed",
    verdict: "The Emperor says: claim it, or someone else will.",
    verdictTr: "İmparator der ki: sahip çık, yoksa başkası sahip çıkar.",
    crossroads_meaning:
      "This is not a moment for consultation. Assert your position and build from solid ground. Structures belong to those who show up and hold them.",
  },
  {
    deckId: "05-TheHierophant",
    name: "The Hierophant",
    nameTr: "Başrahip",
    direction: "pause",
    verdict: "The Hierophant says: the established way still holds — for now.",
    verdictTr: "Başrahip der ki: yerleşik yol hâlâ geçerlidir — şimdilik.",
    crossroads_meaning:
      "The conventional choice carries more weight than it appears. Breaking with tradition here costs more than the gain. Follow the known channel, at least this time.",
  },
  {
    deckId: "06-TheLovers",
    name: "The Lovers",
    nameTr: "Aşıklar",
    direction: "proceed",
    verdict: "The Lovers say: the heart already chose — stop asking the mind.",
    verdictTr: "Aşıklar der ki: kalp çoktan seçti — akla sormayı bırak.",
    crossroads_meaning:
      "This decision is not about logic. You know what you want. Choose the thing that aligns your values with your desire, and do not apologize for it.",
  },
  {
    deckId: "07-TheChariot",
    name: "The Chariot",
    nameTr: "Savaş Arabası",
    direction: "proceed",
    verdict: "The Chariot says: move. Hesitation is defeat.",
    verdictTr: "Savaş Arabası der ki: hareket et. Tereddüt yenilgidir.",
    crossroads_meaning:
      "Victory belongs to those who commit fully and steer hard. Half-measures will not work here. Pick your direction and drive without looking back.",
  },
  {
    deckId: "08-Strength",
    name: "Strength",
    nameTr: "Güç",
    direction: "proceed",
    verdict: "Strength says: you are not too much — you are exactly enough.",
    verdictTr: "Güç der ki: fazla değilsin — tam olarak yeterlisin.",
    crossroads_meaning:
      "Do not shrink from this. The thing you fear you might break is sturdier than you think, and so are you. Proceed with gentleness, but proceed.",
  },
  {
    deckId: "09-TheHermit",
    name: "The Hermit",
    nameTr: "Keşiş",
    direction: "wait",
    verdict: "The Hermit says: not yet — spend one more night alone with this.",
    verdictTr: "Keşiş der ki: henüz değil — bir gece daha bununla yalnız kal.",
    crossroads_meaning:
      "External input is clouding what you already know. Withdraw, sit still, and let your own lantern illuminate the answer before sunrise.",
  },
  {
    deckId: "10-WheelOfFortune",
    name: "Wheel of Fortune",
    nameTr: "Kader Çarkı",
    direction: "proceed",
    verdict: "The Wheel says: the turn is coming regardless — you may as well ride it.",
    verdictTr: "Kader Çarkı der ki: dönüş zaten geliyor — binip gitseydin ya.",
    crossroads_meaning:
      "Timing is in motion whether you act or not. Lean into the cycle rather than resist it. Fortune favors those who move with the wheel, not under it.",
  },
  {
    deckId: "11-Justice",
    name: "Justice",
    nameTr: "Adalet",
    direction: "pause",
    verdict: "Justice says: what you decide here will be held against you — choose with precision.",
    verdictTr: "Adalet der ki: burada vereceğin karar hesaba çekilecek — hassasiyetle seç.",
    crossroads_meaning:
      "There are consequences either way, and they are exact. Weigh both sides without sentiment. The right choice is already visible if you stop rationalizing.",
  },
  {
    deckId: "12-TheHangedMan",
    name: "The Hanged Man",
    nameTr: "Asılan Adam",
    direction: "wait",
    verdict: "The Hanged Man says: surrender the timeline — the answer comes from suspension.",
    verdictTr: "Asılan Adam der ki: zamana teslim ol — cevap askıda gelir.",
    crossroads_meaning:
      "You cannot think your way to clarity on this. Let go of the need to decide now. A forced answer here will be the wrong one.",
  },
  {
    deckId: "13-Death",
    name: "Death",
    nameTr: "Ölüm",
    direction: "proceed",
    verdict: "Death says: what you're afraid to end is already over.",
    verdictTr: "Ölüm der ki: bitirmekten korktuğun şey zaten bitti.",
    crossroads_meaning:
      "The old form cannot continue regardless of your choice. Choose the ending that you initiate rather than the one that is done to you.",
  },
  {
    deckId: "14-Temperance",
    name: "Temperance",
    nameTr: "Denge",
    direction: "pause",
    verdict: "Temperance says: not more, not less — find the exact measure.",
    verdictTr: "Denge der ki: ne fazla ne az — tam ölçüyü bul.",
    crossroads_meaning:
      "This is not an all-or-nothing situation. The binary you're presenting yourself is false. Blend the options, adjust the quantities, and the answer emerges.",
  },
  {
    deckId: "15-TheDevil",
    name: "The Devil",
    nameTr: "Şeytan",
    direction: "pause",
    verdict: "The Devil says: you already know what's keeping you — name it.",
    verdictTr: "Şeytan der ki: seni tutan şeyi zaten biliyorsun — adını koy.",
    crossroads_meaning:
      "There is an attachment or avoidance driving this decision that you haven't admitted. Identify the chain before you choose. What you want may not be what you need.",
  },
  {
    deckId: "16-TheTower",
    name: "The Tower",
    nameTr: "Kule",
    direction: "pause",
    verdict: "The Tower says: let it fall. What collapses was never yours to keep.",
    verdictTr: "Kule der ki: düşsün gitsin. Çöken şey zaten senin değildi.",
    crossroads_meaning:
      "If proceeding here means propping up something unstable, stop. The destruction is the answer. What survives the rubble is what was real.",
  },
  {
    deckId: "17-TheStar",
    name: "The Star",
    nameTr: "Yıldız",
    direction: "proceed",
    verdict: "The Star says: pour yourself into this — the well will refill.",
    verdictTr: "Yıldız der ki: kendini buna dök — kuyu yeniden dolacak.",
    crossroads_meaning:
      "Hope is not naive here — it is accurate. After what you've been through, this is the signal to begin again. Trust the light you see and move toward it.",
  },
  {
    deckId: "18-TheMoon",
    name: "The Moon",
    nameTr: "Ay",
    direction: "wait",
    verdict: "The Moon says: what you see is not what is — wait for the light.",
    verdictTr: "Ay der ki: gördüğün gerçek değil — ışığı bekle.",
    crossroads_meaning:
      "You are operating on incomplete or distorted information. Fear and desire are both lying to you right now. Wait until the picture becomes real before committing.",
  },
  {
    deckId: "19-TheSun",
    name: "The Sun",
    nameTr: "Güneş",
    direction: "proceed",
    verdict: "The Sun says: yes — and do it in the open.",
    verdictTr: "Güneş der ki: evet — ve bunu açıkça yap.",
    crossroads_meaning:
      "Clarity, energy, and success. This is the clearest green light in the deck. Do not hedge, do not hide. Step into it fully.",
  },
  {
    deckId: "20-Judgement",
    name: "Judgement",
    nameTr: "Yargı",
    direction: "proceed",
    verdict: "Judgement says: you have been called — answer, or carry the regret.",
    verdictTr: "Yargı der ki: çağrıldın — cevap ver, yoksa pişmanlığını taşı.",
    crossroads_meaning:
      "This is a moment of reckoning that cannot be deferred. The call you're hearing is real. Rise to it now or face the same crossroads again, harder.",
  },
  {
    deckId: "21-TheWorld",
    name: "The World",
    nameTr: "Dünya",
    direction: "proceed",
    verdict: "The World says: this is the completion you've earned — take it.",
    verdictTr: "Dünya der ki: bu hak ettiğin tamamlanmadır — al onu.",
    crossroads_meaning:
      "Every cycle leading here points toward yes. This is not luck — it is the natural conclusion of your effort. Receive it without reservation.",
  },
];

// ─── Day-of-week weights ──────────────────────────────────────────────────────
// 0 = Sunday, 1 = Monday, ..., 6 = Saturday
// Boosted cards get weight 4; all others get weight 1 (base).

const BASE_WEIGHT = 1;
const BOOST_WEIGHT = 4;

const DAY_BOOSTS: Record<number, string[]> = {
  0: ["19-TheSun", "17-TheStar", "10-WheelOfFortune"],   // Sunday  — solar, radiant, lucky
  1: ["18-TheMoon", "02-TheHighPriestess", "12-TheHangedMan"], // Monday — lunar, intuitive, reflective
  2: ["16-TheTower", "07-TheChariot", "04-TheEmperor"],   // Tuesday — Mars, force, disruption
  3: ["01-TheMagician", "09-TheHermit", "11-Justice"],    // Wednesday — Mercury, craft, discernment
  4: ["05-TheHierophant", "10-WheelOfFortune", "21-TheWorld"], // Thursday — Jupiter, expansion, completion
  5: ["03-TheEmpress", "06-TheLovers", "17-TheStar"],     // Friday  — Venus, desire, beauty
  6: ["13-Death", "15-TheDevil", "16-TheTower"],          // Saturday — Saturn, endings, reckoning
};

// ─── Deterministic daily draw ──────────────────────────────────────────────

/** Simple LCG seeded pseudo-random. Returns a float in [0, 1). */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    s = s >>> 0;
    return s / 4294967296;
  };
}

function todaySeed(): number {
  const d = new Date();
  // Unique number per calendar day
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seedForDate(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function drawForDate(d: Date): CrossroadsCard {
  const boosts = new Set(DAY_BOOSTS[d.getDay()] ?? []);
  const rng = seededRandom(seedForDate(d));
  const pool: { card: CrossroadsCard; weight: number }[] = MAJOR_ARCANA_CROSSROADS.map((c) => ({
    card: c,
    weight: boosts.has(c.deckId) ? BOOST_WEIGHT : BASE_WEIGHT,
  }));
  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = rng() * totalWeight;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.card;
  }
  return pool[pool.length - 1].card;
}

/** Draw the card for a specific past date (for history display). */
export function drawCrossroadsCardForDate(date: Date): CrossroadsCard {
  return drawForDate(date);
}

/**
 * Returns the same card all day, changes at midnight.
 * Weighted toward day-of-week themes.
 */
export function drawDailyCrossroadsCard(): CrossroadsCard {
  const pool: { card: CrossroadsCard; weight: number }[] = MAJOR_ARCANA_CROSSROADS.map((c) => ({
    card: c,
    weight: BASE_WEIGHT,
  }));
  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.card;
  }
  return pool[pool.length - 1].card;
}

/** Resolves the full TarotCard (image) from a CrossroadsCard. */
export function resolveTarotCard(crossroadsCard: CrossroadsCard): TarotCard | undefined {
  return TAROT_DECK.find((c) => c.id === crossroadsCard.deckId);
}

// ─── System prompt builder ────────────────────────────────────────────────────

export interface BirthChartContext {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}

/**
 * Builds the system prompt for a Cosmic Crossroads reading.
 * The AI output must be exactly 3 sentences:
 *   1. Ties the card meaning to the question.
 *   2. References one detail from the birth chart.
 *   3. Closes with a time hint or directional statement.
 */
export function buildCrossroadsSystemPrompt(
  card: CrossroadsCard,
  chart: BirthChartContext,
  question: string
): string {
  // Import inline to avoid circular deps — i18n is a singleton
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const i18n = require("./i18n").default as { language: string };
  const isTr = i18n.language === "tr";

  if (isTr) {
    const chartLine = [
      chart.sunSign ? `Güneş ${chart.sunSign} burcunda` : null,
      chart.moonSign ? `Ay ${chart.moonSign} burcunda` : null,
      chart.risingSign ? `${chart.risingSign} Yükselen` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const directionTr =
      card.direction === "proceed" ? "İLERLE" :
      card.direction === "pause" ? "DUR" : "BEKLE";

    return `Sen özlü ve otoriter bir kahin olarak Kozmik Kavşak okuması sunuyorsun. Kesinlikle ve samimiyetle konuşursun — yumuşatma yok, dolgu yok. Her zaman Türkçe yanıt ver.

ÇEKİLEN KART: ${card.name}
YÖN: ${directionTr}
KARTIN KAVŞAK ANLAMI: ${card.crossroads_meaning}
KULLANICININ DOĞUM HARİTASI: ${chartLine || "bilinmiyor"}
KULLANICININ SORUSU: ${question}

Tam olarak 3 cümle yaz. Ne fazla ne az.
— 1. Cümle: ${card.name}'in kavşak anlamını kullanıcının sorusuna doğrudan bağla. Sorusuna özgül ol, genel olma.
— 2. Cümle: Doğum haritasından tam olarak bir unsura atıfta bulun (${chartLine || "haritaları"}) ve bu karara ne kattığını açıkla.
— 3. Cümle: Bir zaman ipucu ("bir sonraki yeni aydan önce", "perşembeye kadar", "üç gün içinde") veya yönsel bir ifade ("seni daha az korkutan şeye doğru ilerle", "cevap konfor alanının kuzeyinde") ile kapat.

YASAK kelime ve ifadeler: yolculuk, yol, evren, yıldızlar öneriyor, kartlar işaret ediyor, enerji, titreşimler, uyum, rezonans, kucakla, yönlen, bölüm, sürece güven, her şey bir sebep için olur.

Ton: samimi ve otoriter. Belirsizlik yok. Okumayı sorgulamak yok. Sonuç zaten biliniyormuş gibi konuş ve sadece bilgilendiriyorsun.`;
  }

  const chartLine = [
    chart.sunSign ? `Sun in ${chart.sunSign}` : null,
    chart.moonSign ? `Moon in ${chart.moonSign}` : null,
    chart.risingSign ? `${chart.risingSign} Rising` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return `You are a laconic, authoritative oracle delivering a Cosmic Crossroads reading. You speak with precision and intimacy — no warmth-padding, no filler.

CARD DRAWN: ${card.name}
DIRECTION: ${card.direction.toUpperCase()}
CARD'S CROSSROADS MEANING: ${card.crossroads_meaning}
USER'S BIRTH CHART: ${chartLine || "unknown"}
USER'S QUESTION: ${question}

Write exactly 3 sentences. No more, no less.
— Sentence 1: Tie ${card.name}'s crossroads meaning directly to what the user asked. Be specific to their question, not generic.
— Sentence 2: Reference exactly one element from their birth chart (${chartLine || "their chart"}) and explain what it adds to this decision.
— Sentence 3: Close with either a time hint ("before the next new moon", "by Thursday", "within three days") or a directional statement ("move toward the thing that frightens you less", "the answer lives north of your comfort").

FORBIDDEN words and phrases: journey, path, universe, the stars suggest, the cards indicate, energy, vibrations, alignment, resonate, embrace, navigate, chapter, trust the process, everything happens for a reason.

Tone: intimate and authoritative. No hedging. No second-guessing the reading. Speak as if the outcome is already known and you are simply informing them of it.`;
}
