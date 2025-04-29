"use client";

/**
 * Match & Learn Game
 * Main game component that manages the card matching game
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

import GameBoard from './GameBoard';
import DifficultySelector from './DifficultySelector';
import ScorePanel from './ScorePanel';
import TurnIndicator from './TurnIndicator';
import MatchPopup from './MatchPopup';
import GameOverScreen from './GameOverScreen';

import { Card, Food, DifficultyLevel } from './types';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { log } from 'console';

// Define difficulty levels with corresponding card counts
const DIFFICULTY_LEVELS: Record<DifficultyLevel, number> = {
  easy: 12, // 6 pairs (will form a 3x4 grid)
  medium: 24, // 12 pairs (will form a 4x6 grid)
  hard: 40, // 20 pairs (will form a 5x8 grid)
};

// Sample food facts for matched cards
const FOOD_FACTS: Record<string, string> = {
  apple: "Apples are rich in fiber and vitamin C, helping your immune system stay strong!",
  banana: "Bananas give you energy with natural sugars and contain potassium for healthy muscles!",
  broccoli: "Broccoli is packed with vitamins that help your body grow and stay healthy!",
  carrot: "Carrots have vitamin A that helps keep your eyes healthy and strong!",
  chicken: "Chicken is full of protein that helps build strong muscles!",
  egg: "Eggs contain protein and vitamins that help your brain develop and stay sharp!",
  milk: "Milk has calcium that makes your bones and teeth strong!",
  orange: "Oranges are bursting with vitamin C that helps heal cuts and fight colds!",
  rice: "Rice gives you energy to run, play, and learn all day long!",
  salmon: "Salmon has omega-3 fats that help your brain think clearly!",
  spinach: "Spinach makes you strong with iron that helps carry oxygen in your blood!",
  strawberry: "Strawberries are sweet and full of vitamin C to keep you healthy!",
  tomato: "Tomatoes have lycopene that protects your cells and keeps you healthy!",
  yogurt: "Yogurt has friendly bacteria that help your tummy digest food properly!",
  potato: "Potatoes give you energy and contain vitamin C for a healthy immune system!",
  avocado: "Avocados are full of healthy fats that help your brain grow strong!",
  blueberry: "Blueberries are packed with antioxidants that protect your body's cells!",
  corn: "Corn provides energy and fiber to help your digestion work smoothly!",
  cucumber: "Cucumbers are full of water that keeps your body hydrated and healthy!",
  grape: "Grapes have antioxidants that help protect your heart as you grow!",
  lettuce: "Lettuce has water and fiber that keeps your body hydrated and helps digestion!",
  mushroom: "Mushrooms have vitamin D that helps your bones grow strong!",
  pea: "Peas have protein and fiber that help build muscles and keep your tummy happy!",
  pepper: "Peppers are full of vitamin C that helps heal cuts and keeps you healthy!",
  pineapple: "Pineapples have enzymes that help your body digest food properly!",
  watermelon: "Watermelons are full of water that keeps you hydrated on hot days!"
};

// Default foods for the game
const DEFAULT_FOODS = [
  "apple", "banana", "broccoli", "carrot", "chicken", "egg", 
  "milk", "orange", "rice", "salmon", "spinach", "strawberry", 
  "tomato", "yogurt", "potato", "avocado", "blueberry", "corn",
  "cucumber", "grape", "lettuce", "mushroom", "pea", "pepper",
  "pineapple", "watermelon"
];

/**
 * Prepares the food cards for the game based on difficulty
 */
function prepareCards(difficulty: DifficultyLevel): Card[] {
  const cardCount = DIFFICULTY_LEVELS[difficulty];
  const pairCount = cardCount / 2;
  
  // Take only the needed number of foods
  const selectedFoods = DEFAULT_FOODS.slice(0, pairCount);
  
  // Create pairs of cards
  const cards: Card[] = [];
  selectedFoods.forEach((food, index) => {
    // Create two cards for each food (a pair)
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${food}-${i}`,
        food: {
          id: index,
          name: food,
          imageUrl: getFoodImageUrl(food),
          fact: FOOD_FACTS[food] || `${food} is a nutritious food!`
        },
        isFlipped: false,
        isMatched: false
      });
    }
  });
  
  // Shuffle the cards
  return shuffleCards(cards);
}

/**
 * Shuffles an array of cards using Fisher-Yates algorithm
 */
function shuffleCards(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchAndLearnGame() {
  const t = useTranslations('MatchAndLearn');
  
  // Game state
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [computerScore, setComputerScore] = useState<number>(0);
  const [showMatch, setShowMatch] = useState<boolean>(false);
  const [matchedFood, setMatchedFood] = useState<Food | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [computerThinking, setComputerThinking] = useState<boolean>(false);
  const [computerMemory, setComputerMemory] = useState<Map<string, string>>(new Map());
  const [checkingMatch, setCheckingMatch] = useState<boolean>(false);
  const [lastMatchedByPlayer, setLastMatchedByPlayer] = useState<boolean>(true);
  const [turnCount, setTurnCount] = useState<number>(0); // Track turn count to help debug even/odd turn issues
  const [gameCompleted, setGameCompleted] = useState<boolean>(false); // New state to track if game is complete but not yet over
  
  // Store timeouts so they can be cleared if needed
  const timeoutRef = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});
  
  // Flag to prevent race conditions in computer's turn
  const isProcessingRef = useRef<boolean>(false);
  
  // Helper function to manage timeouts
  const setGameTimeout = useCallback((callback: () => void, delay: number, key: string) => {
    // Clear existing timeout with this key if it exists
    if (timeoutRef.current[key]) {
      clearTimeout(timeoutRef.current[key]);
    }
    
    // Set new timeout and store its reference
    timeoutRef.current[key] = setTimeout(() => {
      // Remove from refs after execution
      delete timeoutRef.current[key];
      callback();
    }, delay);
    
    // Return a function to clear this specific timeout
    return () => {
      if (timeoutRef.current[key]) {
        clearTimeout(timeoutRef.current[key]);
        delete timeoutRef.current[key];
      }
    };
  }, []);
  
  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts or difficulty changes
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
    };
  }, [difficulty]);
  
  // Add safety mechanism to prevent stuck states
  useEffect(() => {
    // If computer is thinking for too long (8 seconds), reset to player's turn
    if (computerThinking) {
      // Clear any existing stuck timeout first
      if (timeoutRef.current.stuckTimeout) {
        clearTimeout(timeoutRef.current.stuckTimeout);
      }
      
      timeoutRef.current.stuckTimeout = setTimeout(() => {
        // Reset all relevant states to ensure a clean state
        setComputerThinking(false);
        setCheckingMatch(false);
        isProcessingRef.current = false;
        
        // Fix potentially stuck cards by ensuring all non-matched cards are flipped back
        setCards(prevCards => 
          prevCards.map(c => 
            !c.isMatched ? { ...c, isFlipped: false } : c
          )
        );
        
        setFlippedCards([]);
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
      }, 8000);
      
      return () => {
        if (timeoutRef.current.stuckTimeout) {
          clearTimeout(timeoutRef.current.stuckTimeout);
          delete timeoutRef.current.stuckTimeout;
        }
      };
    }
  }, [computerThinking]);
  
  // Initialize game with selected difficulty
  const startGame = useCallback((selectedDifficulty: DifficultyLevel) => {
    // Clear all timeouts when starting a new game
    Object.values(timeoutRef.current).forEach(clearTimeout);
    timeoutRef.current = {};
    
    const newCards = prepareCards(selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsPlayerTurn(true);
    setPlayerScore(0);
    setComputerScore(0);
    setShowMatch(false);
    setMatchedFood(null);
    setGameOver(false);
    setGameCompleted(false); // Reset game completed state
    setComputerMemory(new Map());
    setCheckingMatch(false);
    setTurnCount(0); // Reset turn count when starting a new game
    isProcessingRef.current = false; // Reset processing flag
  }, []);
  
  // Total pairs in the game
  const totalPairs = difficulty ? DIFFICULTY_LEVELS[difficulty] / 2 : 0;
  
  // Check if the game is over (all pairs found)
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setGameCompleted(true); // Mark the game as completed, but don't show game over yet
    }
  }, [matchedPairs, totalPairs]);
  
  /**
   * Handles the dismissal of the match popup.
   * Controls turn flow after a match is found:
   * - Always switch turns after a match, regardless of who made the match
   * - If game is completed, show game over screen
   */
  const handleCloseMatchPopup = useCallback(() => {
    setShowMatch(false);
    setCheckingMatch(false);
    
    // If game is completed, show game over screen after match popup is closed
    if (gameCompleted) {
      // Add a small delay before showing the game over screen
      // This gives the match popup time to animate out completely
      setGameTimeout(() => {
        setGameOver(true);
      }, 300, 'showGameOver');
      return; // Don't continue with turn switching if game is over
    }
    
    // After showing match popup, always switch turns
    // This implements the rule: one turn per player, regardless of match outcome
    if (isPlayerTurn) {
      // It was player's turn, switch to computer
      setIsPlayerTurn(false);
      setTurnCount(prev => prev + 1);
      
      // Start computer's turn after a short delay
      setGameTimeout(() => {
        setComputerThinking(true);
      }, 500, 'switchToComputerTurn');
    } else {
      // It was computer's turn, switch to player
      setIsPlayerTurn(true);
      setTurnCount(prev => prev + 1);
      // No need to set any flags for player's turn
    }
    
    // Always reset the processing flag to prevent stuck states
    isProcessingRef.current = false;
  }, [isPlayerTurn, setGameTimeout, gameCompleted]);
  
  /**
   * Handles card flipping logic.
   * 1. Validates if card can be flipped
   * 2. Updates computer memory
   * 3. Flips card in the UI
   * 4. Checks for matches when two cards are flipped
   * 5. Updates scores and handles matched/unmatched cases
   */
  const handleCardFlip = useCallback((card: Card) => {
    // Don't allow card flips while popup is showing
    if (showMatch) {
      return;
    }
    
    // Guard clauses - don't flip if:
    // - Card is already matched
    // - Card is already flipped
    // - Two cards are already flipped
    // - We're currently checking a match
    if (card.isMatched || card.isFlipped || flippedCards.length >= 2 || checkingMatch) {
      return;
    }
    
    // Check if this card is already in flippedCards (additional safeguard against race conditions)
    if (flippedCards.some(c => c.id === card.id)) {
      return;
    }
    
    // Remember this card for the computer
    setComputerMemory(prev => {
      const updated = new Map(prev);
      updated.set(card.id, card.food.name);
      return updated;
    });
    
    // Flip the card
    setCards(prev => 
      prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c)
    );
    
    // Add to flipped cards
    setFlippedCards(prev => {
      // Another safeguard to prevent duplicates in flippedCards
      if (prev.some(c => c.id === card.id)) {
        return prev;
      }
      
      const newFlippedCards = [...prev, card];
      
      // If two cards are flipped, check for a match
      if (prev.length === 0) {
        return newFlippedCards; // Just one card flipped, return the updated array
      }
      
      // We now have two flipped cards
      const [firstCard] = prev;
      setCheckingMatch(true);
      
      // Check for match after a delay
      setGameTimeout(() => {
        // Store current player turn state for this match check
        const currentPlayerTurn = isPlayerTurn;
        
        if (firstCard.food.name === card.food.name) {
          // Match found!
          setCards(prevCards => 
            prevCards.map(c => 
              (c.id === firstCard.id || c.id === card.id) 
                ? { ...c, isMatched: true } 
                : c
            )
          );
          
          setMatchedPairs(prevPairs => prevPairs + 1);
          setMatchedFood(card.food);
          
          // Update score based on whose turn it is when the match is found
          if (currentPlayerTurn) {
            setPlayerScore(prev => prev + 1);
            setLastMatchedByPlayer(true);
          } else {
            setComputerScore(prev => prev + 1);
            setLastMatchedByPlayer(false);
          }
          
          // Show match popup - don't auto dismiss
          setShowMatch(true);
          
          // Clear the flipped cards immediately so they don't affect the next turn
          setFlippedCards([]);
          
          // Always reset computer thinking immediately when a match is found
          // This prevents any further computer actions until popup is closed
          setComputerThinking(false);
          isProcessingRef.current = false;
        } else {
          // No match, flip cards back
          setGameTimeout(() => {
            setCards(prevCards => 
              prevCards.map(c => 
                (c.id === firstCard.id || c.id === card.id) 
                  ? { ...c, isFlipped: false } 
                  : c
              )
            );
            
            setFlippedCards([]);
            setIsPlayerTurn(prev => !prev);
            setTurnCount(prev => prev + 1); // Increment turn count when switching turns
            
            setComputerThinking(false);
            setCheckingMatch(false);
            isProcessingRef.current = false;
          }, 1000, 'flipBackTimeout');
        }
      }, 1000, 'matchCheckTimeout');
      
      return newFlippedCards;
    });
    
  }, [flippedCards, isPlayerTurn, setGameTimeout, showMatch]);
  
  /**
   * Handles the computer's turn.
   * Logic:
   * 1. Computer only makes moves when it's its turn and no other actions are happening
   * 2. If knowing a match, computer will flip those cards
   * 3. Otherwise, makes strategic or random choices based on what it remembers
   * 4. Contains safeguards to prevent flipping more than 2 cards
   */
  useEffect(() => {
    // Don't take computer turn if popup is showing
    if (showMatch) {
      return;
    }
    
    // Only proceed if it's the computer's turn and game is active
    if (!isPlayerTurn && !gameOver && difficulty && !checkingMatch && !showMatch) {
      // Computer should only think when it has 0 or 1 flipped cards
      if (flippedCards.length >= 2) {
        // Reset computer thinking state
        setComputerThinking(false);
        return; // Don't proceed if already flipped 2 cards
      }
      
      // If we're already processing a computer move, don't start another one
      if (computerThinking) {
        return;
      }
      
      // Check the processing flag to prevent race conditions
      if (isProcessingRef.current) {
        return;
      }
      
      // Set processing flag to true and log the start of computer's turn
      isProcessingRef.current = true;
      setComputerThinking(true);
      
      // Delay the computer's move to make it feel more natural
      const computerTurnTimeout = setTimeout(() => {
        // Double-check that conditions are still valid before making a move
        if (checkingMatch || isPlayerTurn || flippedCards.length >= 2 || gameOver || showMatch) {
          setComputerThinking(false);
          isProcessingRef.current = false;
          return;
        }
        
        // Save the current flipped cards count to ensure we don't miss state updates
        const currentFlippedCount = flippedCards.length;
        
        // Proceed with computer's move based on current state
        try {
          // If computer already flipped one card, only choose the second card
          if (currentFlippedCount === 1) {
            handleComputerSecondCardFlip();
          } else if (currentFlippedCount === 0) {
            // Computer needs to choose both cards
            handleComputerBothCardsFlip();
          } else {
            // Shouldn't get here, but reset if we do
            setComputerThinking(false);
            isProcessingRef.current = false;
          }
        } catch (error) {
          // Safety in case of any errors during computer's turn
          console.error('Error during computer turn:', error);
          setComputerThinking(false);
          isProcessingRef.current = false;
        }
      }, 1500);
      
      // Store timeout reference so it can be cleared if needed
      timeoutRef.current.computerTurnTimeout = computerTurnTimeout;
      
      // Return cleanup function to clear the timeout if component unmounts or dependencies change
      return () => {
        clearTimeout(computerTurnTimeout);
        delete timeoutRef.current.computerTurnTimeout;
      };
    }
    
    // Helper function for flipping computer's second card
    function handleComputerSecondCardFlip() {
      const [firstCard] = flippedCards;
      let secondCard: Card | null = null;
      
      // Try to find a match for the first card in computer's memory
      const matchingCardId = Array.from(computerMemory.entries())
        .find(([id, food]) => id !== firstCard.id && food === firstCard.food.name)?.[0];
      
      if (matchingCardId) {
        secondCard = cards.find(card => 
          card.id === matchingCardId && 
          !card.isFlipped && 
          !card.isMatched
        ) || null;
      }
      
      // If no match in memory, pick randomly
      if (!secondCard) {
        const availableCards = cards.filter(card => 
          !card.isMatched && 
          !card.isFlipped && 
          card.id !== firstCard.id
        );
        
        if (availableCards.length === 0) {
          setComputerThinking(false);
          setIsPlayerTurn(true);
          setTurnCount(prev => prev + 1);
          isProcessingRef.current = false;
          return;
        }
        
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        secondCard = availableCards[randomIndex];
      }
      
      if (secondCard) {
        // Reset processing flag before flipping to allow handleCardFlip to run
        isProcessingRef.current = false;
        handleCardFlip(secondCard);
      } else {
        setComputerThinking(false);
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
        isProcessingRef.current = false;
      }
    }
    
    // Helper function for flipping both cards
    function handleComputerBothCardsFlip() {
      let firstCard: Card | null = null;
      let secondCard: Card | null = null;
      
      // Try to find a known matching pair
      const unmatched = cards.filter(card => !card.isMatched && !card.isFlipped);
      const unmatchedFoods = new Map<string, Card[]>();
      
      // Group unmatched cards by food name
      unmatched.forEach(card => {
        if (!unmatchedFoods.has(card.food.name)) {
          unmatchedFoods.set(card.food.name, []);
        }
        unmatchedFoods.get(card.food.name)?.push(card);
      });
      
      // Find a matching pair if computer knows one
      for (const [foodName, foodCards] of unmatchedFoods.entries()) {
        if (foodCards.length === 2 && 
            computerMemory.has(foodCards[0].id) && 
            computerMemory.has(foodCards[1].id)) {
          firstCard = foodCards[0];
          secondCard = foodCards[1];
          break;
        }
      }
      
      // If no known pair, pick randomly
      if (!firstCard) {
        const availableCards = unmatched.filter(card => !card.isFlipped);
        
        if (availableCards.length === 0) {
          setComputerThinking(false);
          setIsPlayerTurn(true);
          setTurnCount(prev => prev + 1);
          isProcessingRef.current = false;
          return;
        }
        
        // Randomly select first card
        const randomIndex1 = Math.floor(Math.random() * availableCards.length);
        firstCard = availableCards[randomIndex1];
        
        // Try to find a match for the first card
        const matchingCardId = Array.from(computerMemory.entries())
          .find(([id, food]) => id !== firstCard?.id && food === firstCard?.food.name)?.[0];
        
        if (matchingCardId) {
          secondCard = cards.find(card => 
            card.id === matchingCardId && 
            !card.isFlipped && 
            !card.isMatched
          ) || null;
        }
        
        // If no match, pick random second card
        if (!secondCard) {
          const remainingCards = availableCards.filter(card => card.id !== firstCard?.id);
          
          if (remainingCards.length === 0) {
            setComputerThinking(false);
            setIsPlayerTurn(true);
            setTurnCount(prev => prev + 1);
            isProcessingRef.current = false;
            return;
          }
          
          const randomIndex2 = Math.floor(Math.random() * remainingCards.length);
          secondCard = remainingCards[randomIndex2];
        }
      }
      
      if (firstCard) {        
        // Create a local copy of the second card to use in the timeout
        const localSecondCard = secondCard;
        
        // Reset processing flag before flipping first card
        isProcessingRef.current = false;
        handleCardFlip(firstCard);
        
        // Only flip second card after a delay
        if (localSecondCard) {
          const secondCardTimeout = setTimeout(() => {
            // Verify game state is still valid for flipping second card
            if (!isPlayerTurn && !gameOver && !gameCompleted && !checkingMatch && !showMatch && flippedCards.length < 2) {
              handleCardFlip(localSecondCard);
            } else {
              setComputerThinking(false);
            }
          }, 1000);
          
          // Store timeout reference
          timeoutRef.current.secondCardTimeout = secondCardTimeout;
        }
      } else {
        setComputerThinking(false);
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
        isProcessingRef.current = false;
      }
    }
  }, [isPlayerTurn, gameOver, gameCompleted, cards, computerMemory, difficulty, handleCardFlip, checkingMatch, flippedCards, setGameTimeout, showMatch, turnCount]);
  
  // Reset game
  const handleReset = useCallback(() => {
    if (difficulty) {
      startGame(difficulty);
    }
  }, [difficulty, startGame]);
  
  // Change difficulty
  const handleChangeDifficulty = useCallback(() => {
    setDifficulty(null);
  }, []);
  
  // If no difficulty selected, show selector
  if (!difficulty) {
    return <DifficultySelector onSelectDifficulty={startGame} />;
  }
  
  return (
    <div className="flex flex-col space-y-6">
      {/* Game header with scores and turn indicator */}
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
        <ScorePanel 
          playerScore={playerScore} 
          computerScore={computerScore} 
          totalPairs={totalPairs} 
        />
        
        <TurnIndicator 
          isPlayerTurn={isPlayerTurn}
          computerThinking={computerThinking}
        />
      </div>
      
      {/* Game board with cards */}
      <GameBoard 
        cards={cards} 
        onCardFlip={handleCardFlip}
        isPlayerTurn={isPlayerTurn}
        computerThinking={computerThinking}
        difficulty={difficulty}
      />
      
      {/* Match popup */}
      <AnimatePresence>
        {showMatch && matchedFood && (
          <MatchPopup 
            food={matchedFood} 
            isPlayerMatch={lastMatchedByPlayer}
            onClose={handleCloseMatchPopup}
          />
        )}
      </AnimatePresence>
      
      {/* Game over screen */}
      <AnimatePresence>
        {gameOver && (
          <GameOverScreen 
            playerScore={playerScore}
            computerScore={computerScore}
            onReset={handleReset}
            onChangeDifficulty={handleChangeDifficulty}
            onInit={() => {
              // Make sure all timeouts are cleared
              Object.values(timeoutRef.current).forEach(clearTimeout);
              timeoutRef.current = {};
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 