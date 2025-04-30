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

### 2. Create Smaller Components

- [ ] Split `MatchAndLearnGame.tsx` into smaller functional components:
  - [ ] `GameContainer.tsx` - Main container component
  - [ ] `GameControls.tsx` - Game controls UI (reset, change difficulty)
  - [ ] `GameStatus.tsx` - Game status display (combines score panel and turn indicator)
  - [ ] `MatchNotification.tsx` - Smaller version of match popup for quick feedback
  - [ ] `CardLoader.tsx` - Component to handle loading state for card data

### 3. State Management Improvements

- [ ] Consider using React Context for game state to avoid prop drilling
- [ ] Alternatively, evaluate using a state management library like Zustand for more complex state
- [ ] Create clear interfaces between components and state
- [ ] Implement proper loading states for API fetches

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

5. **Error Handling**
   - [ ] Graceful handling of API failures
   - [ ] Retry mechanism works for loading fun facts
   - [ ] No console errors during normal gameplay
   - [ ] Appropriate feedback when API requests fail

6. **API Integration**
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

2. **Responsiveness**
   - [ ] Game is playable on mobile devices (320px+)
   - [ ] Game is playable on tablets (768px+)
   - [ ] Game is playable on desktop (1024px+)
   - [ ] Card grid adjusts appropriately to screen size

3. **Accessibility**
   - [ ] All interactive elements are keyboard accessible
   - [ ] Proper focus management during gameplay
   - [ ] Color contrast meets WCAG AA standards
   - [ ] Screen reader support for game elements
   - [ ] Game state changes are announced to screen readers

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