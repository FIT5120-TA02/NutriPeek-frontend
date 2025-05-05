/**
 * Match & Learn Game Types
 */

/**
 * Food object type
 */
export interface Food {
  id: number;
  name: string;
  imageUrl: string;
  fact: string;
}

/**
 * Card object type
 */
export interface Card {
  id: string;
  food: Food;
  isFlipped: boolean;
  isMatched: boolean;
}

/**
 * Game difficulty level
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Props for the GameBoard component
 */
export interface GameBoardProps {
  cards: Card[];
  onCardFlip: (card: Card) => void;
  isPlayerTurn: boolean;
  computerThinking: boolean;
  difficulty: DifficultyLevel;
  isMobile: boolean;
}

/**
 * Props for the GameCard component
 */
export interface GameCardProps {
  card: Card;
  onFlip: (card: Card) => void;
  isDisabled: boolean;
  isMobile: boolean;
}

/**
 * Props for the DifficultySelector component
 */
export interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: DifficultyLevel) => Promise<void>;
}

/**
 * Props for the ScorePanel component
 */
export interface ScorePanelProps {
  playerScore: number;
  computerScore: number;
  totalPairs: number;
}

/**
 * Props for the TurnIndicator component
 */
export interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  computerThinking: boolean;
}

/**
 * Props for the MatchPopup component
 */
export interface MatchPopupProps {
  food: Food;
  isPlayerMatch: boolean;
  onClose: () => void;
}

/**
 * Props for the GameOverScreen component
 */
export interface GameOverScreenProps {
  playerScore: number;
  computerScore: number;
  onReset: () => void;
  onChangeDifficulty: () => void;
  onInit?: () => void;
  quizResult?: boolean | null;
}

/**
 * Props for the PageWrapper component
 */
export interface PageWrapperProps {
  title: string;
  description: string;
} 