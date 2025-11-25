import { CardData, CardType, Player } from './types';
import { FRENCH_WORDS } from './constants';

export const generateGame = (): CardData[] => {
  // 1. Select 25 random unique words
  const shuffledWords = [...FRENCH_WORDS].sort(() => 0.5 - Math.random());
  const selectedWords = shuffledWords.slice(0, 25);

  // 2. Create the distribution array based on the prompt's specific requirements
  // Total 25 cards
  const distribution: { p1: CardType; p2: CardType }[] = [
    // 1. Common Green (3)
    { p1: CardType.GREEN, p2: CardType.GREEN },
    { p1: CardType.GREEN, p2: CardType.GREEN },
    { p1: CardType.GREEN, p2: CardType.GREEN },

    // 2. P1 Ex Green (6) -> P1 Green, P2 Beige
    ...Array(6).fill({ p1: CardType.GREEN, p2: CardType.BEIGE }),

    // 3. P2 Ex Green (6) -> P2 Green, P1 Beige
    ...Array(6).fill({ p1: CardType.BEIGE, p2: CardType.GREEN }),

    // 4. Common Assassin (1)
    { p1: CardType.BLACK, p2: CardType.BLACK },

    // 5. P1 Assassin / P2 Green (1)
    { p1: CardType.BLACK, p2: CardType.GREEN },

    // 6. P2 Assassin / P1 Green (1)
    { p1: CardType.GREEN, p2: CardType.BLACK },

    // 7. P1 Assassin / P2 Innocent (1)
    { p1: CardType.BLACK, p2: CardType.BEIGE },

    // 8. P2 Assassin / P1 Innocent (1)
    { p1: CardType.BEIGE, p2: CardType.BLACK },

    // 9. True Neutrals (Remaining 5) -> P1 Beige, P2 Beige
    ...Array(5).fill({ p1: CardType.BEIGE, p2: CardType.BEIGE }),
  ];

  // 3. Shuffle distribution
  const shuffledDistribution = distribution.sort(() => 0.5 - Math.random());

  // 4. Map to cards
  return selectedWords.map((word, index) => ({
    id: index,
    word,
    p1Type: shuffledDistribution[index].p1,
    p2Type: shuffledDistribution[index].p2,
    revealed: false,
  }));
};

export const getCardTypeForPlayer = (card: CardData, player: Player): CardType => {
  return player === 'P1' ? card.p1Type : card.p2Type;
};

// Check if this card contributes to the victory condition (The 15 "Safe" Greens)
// Logic: The 15 agents are the ones that are SAFE GREEN for at least one person and NOT BLACK for anyone?
// User prompt says: "The team must find all 15 Green Agents (The 3 Common + 6 P1 Exclusives + 6 P2 Exclusives)."
// This excludes the "Assassin/Green" hybrids from the victory count requirement based on the text.
export const isObjectiveAgent = (card: CardData): boolean => {
  const p1 = card.p1Type;
  const p2 = card.p2Type;

  // Common Green
  if (p1 === CardType.GREEN && p2 === CardType.GREEN) return true;
  // P1 Exclusive (Green/Beige)
  if (p1 === CardType.GREEN && p2 === CardType.BEIGE) return true;
  // P2 Exclusive (Beige/Green)
  if (p1 === CardType.BEIGE && p2 === CardType.GREEN) return true;

  return false;
};
