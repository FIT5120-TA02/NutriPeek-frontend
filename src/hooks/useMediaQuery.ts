import { useState, useEffect } from 'react';

/**
 * Custom hook that returns whether a media query matches
 * @param query - The media query to check, e.g. '(max-width: 768px)'
 * @returns boolean - True if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create MediaQueryList object
    const media = window.matchMedia(query);
    
    // Update the state with the match status
    const updateMatch = () => {
      setMatches(media.matches);
    };

    // Set the initial value
    updateMatch();
    
    // Add listener for changes
    media.addEventListener('change', updateMatch);
    
    // Clean up
    return () => {
      media.removeEventListener('change', updateMatch);
    };
  }, [query]);

  return matches;
} 