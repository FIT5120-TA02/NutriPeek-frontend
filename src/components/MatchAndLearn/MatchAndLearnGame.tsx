"use client";

/**
 * Match & Learn Game
 * Main game component that manages the card matching game
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';

import GameBoard from './GameBoard';
import DifficultySelector from './DifficultySelector';
import ScorePanel from './ScorePanel';
import TurnIndicator from './TurnIndicator';
import MatchPopup from './MatchPopup';
import GameOverScreen from './GameOverScreen';
import QuizPopup from './QuizPopup';

import { Card, Food, DifficultyLevel } from './types';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { nutripeekApi } from '@/api/nutripeekApi';
import { FoodCategoryFunFactResponse } from '@/api/types';

// Define difficulty levels with corresponding card counts
const DIFFICULTY_LEVELS: Record<DifficultyLevel, number> = {
  easy: 12, // 6 pairs (will form a 3x4 grid)
  medium: 24, // 12 pairs (will form a 4x6 grid)
  hard: 40, // 20 pairs (will form a 5x8 grid)
};

/**
 * Prepares the food cards for the game based on difficulty and available fun facts
 */
function prepareCards(difficulty: DifficultyLevel, funFacts: FoodCategoryFunFactResponse[] = []): Card[] {
  const cardCount = DIFFICULTY_LEVELS[difficulty];
  const pairCount = cardCount / 2;
  
  // Create cards using fun facts from the API
  const cards: Card[] = [];
  
  if (funFacts.length > 0) {
    // Get unique food categories from fun facts
    const uniqueCategories = Array.from(new Set(funFacts.map(fact => fact.category)));
    
    // Create a mapping of categories to fun facts (taking the first fun fact for each category)
    const categoryFactsMap: Record<string, string> = {};
    funFacts.forEach(fact => {
      if (!categoryFactsMap[fact.category]) {
        categoryFactsMap[fact.category] = fact.fun_fact;
      }
    });
    
    // If we don't have enough unique categories, we'll use some categories multiple times
    let selectedCategories: string[] = [];
    
    if (uniqueCategories.length >= pairCount) {
      // Shuffle categories and take what we need
      selectedCategories = [...uniqueCategories]
        .sort(() => Math.random() - 0.5)
        .slice(0, pairCount);
    } else {
      // We need to reuse some categories
      const timesToRepeat = Math.ceil(pairCount / uniqueCategories.length);
      for (let i = 0; i < timesToRepeat; i++) {
        const shuffled = [...uniqueCategories].sort(() => Math.random() - 0.5);
        selectedCategories = [...selectedCategories, ...shuffled];
      }
      // Trim to exact number needed
      selectedCategories = selectedCategories.slice(0, pairCount);
    }
    
    // Create pairs of cards for each selected category
    selectedCategories.forEach((category, index) => {
      const foodName = category.toLowerCase(); // Convert category to lowercase for image URL
      const funFact = categoryFactsMap[category];
      
      // Create two cards for each category (a pair)
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${category}-${i}-${index}-${Date.now()}`, // Added timestamp to ensure unique IDs on restart
          food: {
            id: index,
            name: foodName,
            imageUrl: getFoodImageUrl(foodName),
            fact: funFact
          },
          isFlipped: false,
          isMatched: false
        });
      }
    });
  }
  
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
  const [turnCount, setTurnCount] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [funFacts, setFunFacts] = useState<FoodCategoryFunFactResponse[]>([]);
  const [isLoadingFunFacts, setIsLoadingFunFacts] = useState<boolean>(false);
  const [cachedFunFacts, setCachedFunFacts] = useState<FoodCategoryFunFactResponse[]>([]);
  
  // New state for the quiz feature
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizFood, setQuizFood] = useState<Food | null>(null);
  const [incorrectOptions, setIncorrectOptions] = useState<Food[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  
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
  
  /**
   * Prepares card game data from existing fun facts
   * This function allows reusing cached fun facts to avoid API calls
   */
  const prepareCardsFromExistingFunFacts = useCallback((selectedDifficulty: DifficultyLevel, existingFunFacts: FoodCategoryFunFactResponse[]) => {
    if (existingFunFacts.length === 0) return [];
    
    const newCards = prepareCards(selectedDifficulty, existingFunFacts);
    setCards(newCards);
    return newCards;
  }, []);
  
  // Fetch fun facts when component mounts or when needed
  useEffect(() => {
    const fetchFunFacts = async () => {
      if (difficulty) {
        try {
          setIsLoadingFunFacts(true);
          // Calculate how many fun facts we need based on difficulty
          // We get N+10 fun facts where N is the number of pairs needed for the difficulty
          const pairsNeeded = DIFFICULTY_LEVELS[difficulty] / 2;
          const funFactsToRequest = pairsNeeded + 10; // Request 10 more than needed to ensure variety
          
          // Cap at API maximum (50)
          const count = Math.min(funFactsToRequest, 50);
          
          const response = await nutripeekApi.getFoodCategoryFunFacts(count);
          
          if (response.fun_facts?.length > 0) {
            // Store the new fun facts, replacing previous cached ones
            setFunFacts(response.fun_facts);
            setCachedFunFacts(response.fun_facts);
            
            // Always create new cards with the latest fun facts
            const newCards = prepareCards(difficulty, response.fun_facts);
            setCards(newCards);
          } else {
            console.warn('Received empty fun facts array from API');
            // Show an error message or handle empty state
            setFunFacts([]);
            setCards([]);
          }
        } catch (error) {
          console.error('Failed to fetch food category fun facts:', error);
          // Clear any existing fun facts and cards
          setFunFacts([]);
          setCards([]);
        } finally {
          setIsLoadingFunFacts(false);
        }
      }
    };
    
    fetchFunFacts();
    // Only re-run when difficulty changes
  }, [difficulty]);
  
  // Function to retry loading fun facts
  const handleRetryLoading = useCallback(() => {
    if (difficulty) {
      // Clear cached fun facts to force a new fetch
      setCachedFunFacts([]);
      
      // Re-trigger the fetch by changing and resetting the difficulty
      const currentDifficulty = difficulty;
      setDifficulty(null);
      
      // Use a small timeout to ensure state updates properly
      setTimeout(() => {
        setDifficulty(currentDifficulty);
      }, 100);
    }
  }, [difficulty]);
  
  // Initialize game with selected difficulty
  const startGame = useCallback((selectedDifficulty: DifficultyLevel) => {
    // Clear all timeouts when starting a new game
    Object.values(timeoutRef.current).forEach(clearTimeout);
    timeoutRef.current = {};
    
    // Reset all game state
    setDifficulty(selectedDifficulty);
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsPlayerTurn(true);
    setPlayerScore(0);
    setComputerScore(0);
    setShowMatch(false);
    setMatchedFood(null);
    setGameOver(false);
    setGameCompleted(false);
    setComputerMemory(new Map());
    setCheckingMatch(false);
    setTurnCount(0);
    isProcessingRef.current = false;
    
    // Reset quiz-related states
    setShowQuiz(false);
    setQuizFood(null);
    setIncorrectOptions([]);
    setQuizCompleted(false);
    setQuizResult(null);
    
    // If we have cached fun facts, use them right away instead of showing loading indicator
    if (cachedFunFacts.length > 0) {
      const newCards = prepareCards(selectedDifficulty, cachedFunFacts);
      setCards(newCards);
    } else {
      // Otherwise, set cards to empty array initially
      // The useEffect hook will fetch fun facts and create the cards
      setCards([]);
    }
  }, [cachedFunFacts]);
  
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
   * - If game is completed, show quiz popup before game over screen
   */
  const handleCloseMatchPopup = useCallback(() => {
    setShowMatch(false);
    setCheckingMatch(false);
    
    // If game is completed, prepare and show quiz popup after match popup is closed
    if (gameCompleted && !quizCompleted) {
      // Add a small delay before showing the quiz
      setGameTimeout(() => {
        prepareQuiz();
        setShowQuiz(true);
      }, 300, 'showQuiz');
      return; // Don't continue with turn switching if game is over
    }
    
    // If quiz was completed, show game over screen
    if (gameCompleted && quizCompleted) {
      // Add a small delay before showing the game over screen
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
  }, [isPlayerTurn, setGameTimeout, gameCompleted, quizCompleted]);
  
  /**
   * Prepares the quiz by selecting a random matched food and three incorrect options
   */
  const prepareQuiz = useCallback(() => {
    // Find all the matched foods
    const matchedFoods: Food[] = [];
    cards.forEach(card => {
      if (card.isMatched) {
        // Check if this food is already in the matchedFoods array
        const exists = matchedFoods.some(food => food.name === card.food.name);
        if (!exists) {
          matchedFoods.push(card.food);
        }
      }
    });
    
    // If we have at least 4 matched foods (1 correct + 3 incorrect), proceed
    if (matchedFoods.length >= 4) {
      // Select a random food for the quiz
      const randomIndex = Math.floor(Math.random() * matchedFoods.length);
      const selectedFood = matchedFoods[randomIndex];
      
      // Remove the selected food from the array and shuffle remaining foods
      const remainingFoods = matchedFoods.filter(food => food.name !== selectedFood.name);
      
      // Fisher-Yates shuffle
      for (let i = remainingFoods.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingFoods[i], remainingFoods[j]] = [remainingFoods[j], remainingFoods[i]];
      }
      
      // Take the first 3 shuffled foods as incorrect options
      const incorrectFoods = remainingFoods.slice(0, 3);
      
      setQuizFood(selectedFood);
      setIncorrectOptions(incorrectFoods);
    } else {
      // Not enough unique foods for a quiz, skip to game over
      setQuizCompleted(true);
      setGameTimeout(() => {
        setGameOver(true);
      }, 300, 'showGameOver');
    }
  }, [cards, setGameTimeout]);
  
  /**
   * Handles the answer from the quiz
   * Adjusts scores based on the answer and shows game over screen
   */
  const handleQuizAnswer = useCallback((isCorrect: boolean) => {
    setQuizResult(isCorrect);
    setQuizCompleted(true);
    setShowQuiz(false);
    
    // Adjust the scores based on the answer
    if (isCorrect) {
      if (isPlayerTurn || lastMatchedByPlayer) {
        // Player gets +10 points for correct answer
        setPlayerScore(prev => prev + 10);
      } else {
        // Computer gets +10 points for correct answer
        setComputerScore(prev => prev + 10);
      }
    } else {
      if (isPlayerTurn || lastMatchedByPlayer) {
        // Player gets -10 points for wrong answer
        setPlayerScore(prev => Math.max(0, prev - 10)); // Prevent negative score
      } else {
        // Computer gets -10 points for wrong answer
        setComputerScore(prev => Math.max(0, prev - 10)); // Prevent negative score
      }
    }
    
    // Show game over screen after quiz is completed
    setGameTimeout(() => {
      setGameOver(true);
    }, 500, 'showGameOver');
  }, [isPlayerTurn, lastMatchedByPlayer, setGameTimeout]);
  
  /**
   * Determine if the computer should remember a card based on difficulty level
   * Easy: No memory of any cards
   * Medium: Only remembers its own flipped cards 
   * Hard: Remembers all flipped cards (both player's and computer's)
   */
  const shouldComputerRememberCard = useCallback((isComputerFlipping: boolean) => {
    if (!difficulty) return false;
    
    switch (difficulty) {
      case 'easy':
        return false; // Computer has no memory in easy mode
      case 'medium':
        return !isPlayerTurn; // In medium, computer only remembers cards it flips
      case 'hard':
        return true; // In hard mode, computer remembers all flipped cards
      default:
        return false;
    }
  }, [difficulty, isPlayerTurn]);
  
  /**
   * Handles card flipping logic.
   * 1. Validates if card can be flipped
   * 2. Updates computer memory based on difficulty level
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
    
    // Remember this card for the computer based on difficulty level
    const isComputerFlipping = !isPlayerTurn;
    if (shouldComputerRememberCard(isComputerFlipping)) {
      setComputerMemory(prev => {
        const updated = new Map(prev);
        updated.set(card.id, card.food.name);
        return updated;
      });
    }
    
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
    
  }, [flippedCards, isPlayerTurn, setGameTimeout, showMatch, shouldComputerRememberCard]);
  
  /**
   * Helper function to get cards known to the computer based on difficulty level
   * Returns only the card IDs that computer should know about
   */
  const getCardsKnownToComputer = useCallback(() => {
    if (!difficulty) return new Map<string, string>();
    
    // For 'easy', computer knows nothing
    if (difficulty === 'easy') {
      return new Map<string, string>();
    }
    
    // For medium and hard, return the current memory
    return computerMemory;
  }, [difficulty, computerMemory]);
  
  /**
   * Handles the computer's turn.
   * Logic:
   * 1. Computer only makes moves when it's its turn and no other actions are happening
   * 2. If knowing a match, computer will flip those cards
   * 3. Otherwise, makes strategic or random choices based on difficulty level
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
      
      // Get cards that the computer knows about based on difficulty
      const knownCards = getCardsKnownToComputer();
      
      // Try to find a match for the first card in computer's memory
      const matchingCardId = Array.from(knownCards.entries())
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
      
      // Get cards that the computer knows about based on difficulty
      const knownCards = getCardsKnownToComputer();
      
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
            knownCards.has(foodCards[0].id) && 
            knownCards.has(foodCards[1].id)) {
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
        
        // Try to find a match for the first card in what the computer knows
        const matchingCardId = Array.from(knownCards.entries())
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
  }, [isPlayerTurn, gameOver, gameCompleted, cards, difficulty, handleCardFlip, checkingMatch, flippedCards, setGameTimeout, showMatch, turnCount, getCardsKnownToComputer]);
  
  // Reset game
  const handleReset = useCallback(() => {
    if (difficulty) {
      // Clear all states before starting a new game
      setFlippedCards([]);
      setMatchedPairs(0);
      setIsPlayerTurn(true);
      setPlayerScore(0);
      setComputerScore(0);
      setShowMatch(false);
      setMatchedFood(null);
      setGameOver(false);
      setGameCompleted(false);
      setComputerMemory(new Map());
      setCheckingMatch(false);
      setTurnCount(0);
      setComputerThinking(false);
      isProcessingRef.current = false;
      
      // Reset quiz-related states
      setShowQuiz(false);
      setQuizFood(null);
      setIncorrectOptions([]);
      setQuizCompleted(false);
      setQuizResult(null);
      
      // Clear all timeouts
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
      
      // Clear cached fun facts to force a new API fetch
      setCachedFunFacts([]);
      
      // Re-initialize the game with the same difficulty
      // This will trigger the useEffect to fetch new fun facts
      setDifficulty(null);
      setTimeout(() => {
        setDifficulty(difficulty);
      }, 100);
    }
  }, [difficulty]);
  
  // Change difficulty
  const handleChangeDifficulty = useCallback(() => {
    // Clear all timeouts when changing difficulty
    Object.values(timeoutRef.current).forEach(clearTimeout);
    timeoutRef.current = {};
    
    // Reset all game states before changing difficulty
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsPlayerTurn(true);
    setPlayerScore(0);
    setComputerScore(0);
    setShowMatch(false);
    setMatchedFood(null);
    setGameOver(false);
    setGameCompleted(false);
    setComputerMemory(new Map());
    setCheckingMatch(false);
    setTurnCount(0);
    setComputerThinking(false);
    isProcessingRef.current = false;
    
    // Reset quiz-related states
    setShowQuiz(false);
    setQuizFood(null);
    setIncorrectOptions([]);
    setQuizCompleted(false);
    setQuizResult(null);
    
    // Clear cached fun facts to force a new API fetch when new difficulty is selected
    setCachedFunFacts([]);
    
    // Finally, set difficulty to null to show the difficulty selector
    setDifficulty(null);
  }, []);
  
  // If no difficulty selected, show selector
  if (!difficulty) {
    return <DifficultySelector onSelectDifficulty={startGame} />;
  }
  
  // Show loading state if we're loading fun facts or if we have difficulty set but no cards yet
  const isLoading = isLoadingFunFacts || (difficulty && cards.length === 0);
  const hasError = !isLoading && cards.length === 0 && difficulty !== null;
  
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
      
      {/* Loading state for fun facts */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      )}
      
      {/* Error state with retry button */}
      {hasError && (
        <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
          <p className="mb-3">{t('error_loading_cards')}</p>
          <button 
            onClick={handleRetryLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {t('retry_button')}
          </button>
        </div>
      )}
      
      {/* Show game board only when there are cards */}
      {cards.length > 0 && (
        <GameBoard 
          cards={cards} 
          onCardFlip={handleCardFlip}
          isPlayerTurn={isPlayerTurn}
          computerThinking={computerThinking}
          difficulty={difficulty}
        />
      )}
      
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
      
      {/* Quiz popup - shown after the last match is found */}
      <AnimatePresence>
        {showQuiz && quizFood && (
          <QuizPopup 
            quizFood={quizFood}
            incorrectOptions={incorrectOptions}
            onAnswer={handleQuizAnswer}
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
            quizResult={quizResult}
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