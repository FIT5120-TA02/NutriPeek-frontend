import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// This file is needed to make TypeScript recognize JSX elements
// when the JSX namespace can't be found in the project.