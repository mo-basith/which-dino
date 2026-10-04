// Words and links for sharing a card. Pure, no React.
// Relative imports (not "@/") so tests can run it compiled by tsc.

import { DINOS, type DinoId } from "../data/dinos";

/** "a T-rex", "an Ankylosaurus": "an" before a vowel sound. */
export function withArticle(name: string) {
  return `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;
}

/** "A T-rex": the same, starting a sentence. */
export const withCapitalArticle = (name: string) => {
  const phrase = withArticle(name);
  return phrase[0].toUpperCase() + phrase.slice(1);
};

/** The public page for a dino's card. Ids are permanent, so this link is too. */
export const cardPath = (id: DinoId) => `/c/${id}`;

/** "I'm a T-rex. Which dino are you?" */
export const shareText = (id: DinoId) => `I’m ${withArticle(DINOS[id].name)}. Which dino are you?`;

export const SHARE_TITLE = "Which Dino?";
