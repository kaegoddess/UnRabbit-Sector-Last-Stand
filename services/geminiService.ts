import { GAME_TEXT } from '../textConfig';

// Helper function to get a random element from a string array.
const getRandomText = (array: string[]): string => {
  if (!array || array.length === 0) {
    return ""; // Return an empty string if the array is empty or undefined.
  }
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generates a mission briefing by selecting a random one from the predefined list.
 * This is an async function to maintain the same interface for the caller component,
 * and allows for a small delay to show loading animations.
 * @returns A promise that resolves with a random mission briefing string.
 */
export const generateMissionBriefing = async (): Promise<string> => {
  // Simulate a network delay to keep the "decoding" animation visible for a moment.
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); 
  return getRandomText(GAME_TEXT.MISSION_BRIEFINGS);
};

/**
 * Generates an after-action report based on the player's performance.
 * This is an async function to maintain the same interface for the caller component.
 * @param score The player's final score.
 * @param kills The number of enemies killed.
 * @param wave The final wave reached.
 * @returns A promise that resolves with the after-action report string.
 */
export const generateAfterActionReport = async (score: number, kills: number, wave: number): Promise<string> => {
  // Simulate a network delay.
  await new Promise(resolve => setTimeout(resolve, 200)); 

  // Determine which pool of messages to use based on the score.
  const messagePool = score >= 500 ? GAME_TEXT.HIGH_SCORE_REPORTS : GAME_TEXT.LOW_SCORE_REPORTS;
  const flavorText = getRandomText(messagePool);
  
  // Format the final report string.
  return `${flavorText} (최종 점수: ${score}, 처치: ${kills})`;
};