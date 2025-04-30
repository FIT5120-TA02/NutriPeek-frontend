# Match & Learn Game

A memory card game where users match food cards while learning fun facts about different food categories.

## Component Structure

### Main Components

- **MatchAndLearnGame.tsx**: The core component that orchestrates the entire game flow, including state management, game logic, and turn handling.
- **GameBoard.tsx**: Renders the card grid and manages the layout of cards based on difficulty.
- **DifficultySelector.tsx**: Allows players to select a difficulty level before starting the game.

### UI Components

- **GameCard.tsx**: Individual card component with flipping animation and content display.
- **ScorePanel.tsx**: Displays the current score for both player and computer.
- **TurnIndicator.tsx**: Shows whose turn it is (player or computer) and indicates when the computer is "thinking".
- **MatchPopup.tsx**: Modal that appears when a match is found, displaying the food image and fun fact.
- **QuizPopup.tsx**: Final challenge popup that tests if players were paying attention to the fun facts.
- **GameOverScreen.tsx**: Shown when the game ends, displaying the final score and options to restart.
- **PageWrapper.tsx**: Layout wrapper component for the Match & Learn game page.

### Helper Files

- **types.ts**: Contains TypeScript interfaces and types used throughout the game components.

## Game Mechanics

### Difficulty Levels

- **Easy**: 12 cards (6 pairs) - Computer has no memory
- **Medium**: 24 cards (12 pairs) - Computer remembers only cards it has flipped
- **Hard**: 40 cards (20 pairs) - Computer remembers all flipped cards

### Game Flow

1. Player selects a difficulty level
2. Game loads fun facts about food categories from the API (N+10 fun facts where N is the number of pairs needed)
3. Cards are generated with matching pairs and shuffled
4. Players take turns flipping two cards:
   - If cards match, the player scores a point and gets another turn
   - If cards don't match, it's the opponent's turn
5. When all pairs are found, the game ends and shows the final score
6. When player chooses to play again or change difficulty, new fun facts are fetched from the API

### Final Challenge Quiz

After all pairs are matched, players face a final challenge:
1. A fun fact from one of the matched foods is displayed
2. Players must identify which food the fun fact belongs to from 4 options
3. A correct answer gives a +10 point bonus
4. An incorrect answer results in a -10 point penalty
5. This can potentially change the outcome of the game
6. Players have 15 seconds to answer, with visual cues as time runs out

### Computer AI

The computer opponent has varying levels of "intelligence" based on the selected difficulty:
- In Easy mode, the computer makes completely random choices
- In Medium mode, the computer remembers cards it has flipped
- In Hard mode, the computer remembers all flipped cards

## Data Structure

The game uses fun facts about food categories fetched from the NutriPeek API. Each card represents a food category and contains:
- A unique ID
- Food data (name, image URL, fun fact)
- Game state (isFlipped, isMatched)

### API Data Fetching

- The game fetches N+10 fun facts where N is the number of pairs required for the selected difficulty
- New fun facts are fetched every time the game is restarted or the difficulty is changed
- This ensures variety in the fun facts shown to the player and prevents repetition

## Animations

The game uses Framer Motion for animations, including:
- Card flipping effects
- Match popup animations
- Quiz countdown animation with visual feedback
- Game over screen transitions

## Dependencies

- React (with hooks for state management)
- next-intl (for internationalization)
- Framer Motion (for animations)
- NutriPeek API (for food category fun facts) 