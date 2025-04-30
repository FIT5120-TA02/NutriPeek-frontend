# Match & Learn Refactoring TODO

The Match & Learn game component works well, but the main `MatchAndLearnGame.tsx` file has grown too large (900+ lines) and complex. This document outlines plans to refactor the codebase for better maintainability and future development.

## Refactoring Goals

1. **Reduce complexity** of the main component by breaking it down into smaller, specialized components
2. **Improve code organization** by following a more modular pattern
3. **Enhance testability** by separating UI and game logic
4. **Optimize performance** by reducing unnecessary re-renders
5. **Improve accessibility** throughout the application

## Component Refactoring Plan

### 1. Extract Game Logic to Custom Hooks

- [ ] Create `useMatchGame.ts` hook to handle core game state and logic
- [ ] Create `useComputerPlayer.ts` hook to encapsulate AI logic
- [ ] Create `useGameTimer.ts` hook to handle all timeout management
- [ ] Create `useFunFactsApi.ts` hook to manage API calls and caching strategy
- [ ] Create `useQuizChallenge.ts` hook to manage the final quiz challenge logic

### 2. Create Smaller Components

- [ ] Split `MatchAndLearnGame.tsx` into smaller functional components:
  - [ ] `GameContainer.tsx` - Main container component
  - [ ] `GameControls.tsx` - Game controls UI (reset, change difficulty)
  - [ ] `GameStatus.tsx` - Game status display (combines score panel and turn indicator)
  - [ ] `MatchNotification.tsx` - Smaller version of match popup for quick feedback
  - [ ] `CardLoader.tsx` - Component to handle loading state for card data
  - [ ] `QuizOption.tsx` - Individual option item for the quiz challenge

### 3. State Management Improvements

- [ ] Consider using React Context for game state to avoid prop drilling
- [ ] Alternatively, evaluate using a state management library like Zustand for more complex state
- [ ] Create clear interfaces between components and state
- [ ] Implement proper loading states for API fetches
- [ ] Implement game phase management to control flow between game states (playing, quiz, game over)

### 4. Code Quality Improvements

- [ ] Add comprehensive unit tests for game logic
- [ ] Standardize error handling for API calls
- [ ] Optimize resource loading (preloading images)
- [ ] Improve performance by memoizing expensive operations
- [ ] Add comprehensive comments and documentation

### 5. API and Data Optimization

- [ ] Implement progressive loading for fun facts
- [ ] Add fallback content if API fails
- [ ] Store partially fetched data to prevent complete game failure
- [ ] Implement analytics to track game usage and API performance

### 6. Quiz Feature Enhancements

- [ ] Add difficulty levels to quiz (easier questions for easy mode)
- [ ] Create a larger pool of quiz questions (not just matched cards)
- [ ] Add animation hints for correct answer if time expires
- [ ] Track quiz performance across multiple games
- [ ] Add accessibility improvements to quiz component
- [ ] Add visual confetti effect when answering correctly
- [ ] Create multi-stage quiz for more advanced play

## UI/UX Test Cases

To consider the refactoring successful, the application must pass the following test cases without regression:

### Functionality Test Cases

1. **Game Initialization**
   - [ ] All difficulty levels (Easy, Medium, Hard) can be selected
   - [ ] Cards load correctly for each difficulty level
   - [ ] Game starts with player's turn

2. **Game Mechanics**
   - [ ] Cards flip correctly when clicked
   - [ ] Matched pairs remain flipped and are disabled
   - [ ] Unmatched pairs flip back after delay
   - [ ] Score updates correctly when matches are found
   - [ ] Turn switches correctly between player and computer

3. **Computer AI**
   - [ ] Easy mode: Computer makes random moves
   - [ ] Medium mode: Computer remembers its own flipped cards
   - [ ] Hard mode: Computer remembers all flipped cards
   - [ ] Computer doesn't get "stuck" in any game state

4. **Game Completion**
   - [ ] Game ends when all pairs are matched
   - [ ] Final score is displayed correctly
   - [ ] Game can be restarted with same difficulty (and new fun facts are fetched)
   - [ ] Difficulty can be changed after game completion (and new fun facts are fetched)

5. **Quiz Challenge**
   - [ ] Quiz appears after the last match is found
   - [ ] Quiz displays a random fun fact from matched cards
   - [ ] Quiz shows 4 food options with the correct food included
   - [ ] Timer countdown works correctly
   - [ ] Visual feedback for correct/incorrect answers works
   - [ ] Score adjustment (+10/-10) is applied correctly
   - [ ] Quiz results are displayed in the game over screen

6. **Error Handling**
   - [ ] Graceful handling of API failures
   - [ ] Retry mechanism works for loading fun facts
   - [ ] No console errors during normal gameplay
   - [ ] Appropriate feedback when API requests fail

7. **API Integration**
   - [ ] Appropriate number of fun facts are requested based on difficulty (N+10)
   - [ ] API calls are made only when needed (on initial load, restart, or difficulty change)
   - [ ] Fun facts are properly processed and displayed in game

### UI/UX Specific Tests

1. **Visual Feedback**
   - [ ] Card flip animations are smooth
   - [ ] Match found animation is displayed
   - [ ] Current turn is clearly indicated
   - [ ] Computer "thinking" state is visible
   - [ ] Loading states are clearly indicated during API calls
   - [ ] Quiz timer animation works correctly and intensifies as time runs out

2. **Responsiveness**
   - [ ] Game is playable on mobile devices (320px+)
   - [ ] Game is playable on tablets (768px+)
   - [ ] Game is playable on desktop (1024px+)
   - [ ] Card grid adjusts appropriately to screen size
   - [ ] Quiz options are easily tappable on mobile devices

3. **Accessibility**
   - [ ] All interactive elements are keyboard accessible
   - [ ] Proper focus management during gameplay
   - [ ] Color contrast meets WCAG AA standards
   - [ ] Screen reader support for game elements
   - [ ] Game state changes are announced to screen readers
   - [ ] Quiz is navigable by keyboard and works with screen readers

4. **Performance**
   - [ ] Initial load time < 3 seconds
   - [ ] API request time optimized
   - [ ] No visible lag during gameplay
   - [ ] Smooth transitions between game states
   - [ ] No memory leaks (verify with browser dev tools)

## Technical Debt Issues

- [ ] Reduce timeout complexity by using a more declarative approach
- [ ] Address race conditions in computer player logic
- [ ] Improve type safety throughout the codebase
- [ ] Remove redundant state updates
- [ ] Fix potential memory leaks from uncleaned timeouts
- [ ] Optimize API calls for fun facts (load appropriate amount based on difficulty)
- [ ] Implement error boundaries for API failure cases
- [ ] Add retry logic with exponential backoff for API calls
- [ ] Refactor the quiz state management to be more robust
- [ ] Ensure no regression in game logic when quiz is skipped 