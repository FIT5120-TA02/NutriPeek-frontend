'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component with:
 * - Built-in error handling with fallback
 * - Loading state indicator
 * - Better CDN URL validation
 * - Automatic retry on error
 */

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236b7280"%3EImage not available%3C/text%3E%3C/svg%3E',
  showLoadingSpinner = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`Failed to load image: ${imgSrc}`);
    
    // Only use fallback if we haven't already
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Validate CDN URL
  const validateSrc = () => {
    if (typeof imgSrc === 'string') {
      // Check if CDN URL contains 'undefined'
      if (imgSrc.includes('undefined')) {
        console.error('CDN URL is not properly configured. Please check your NEXT_PUBLIC_CDN_URL environment variable.');
        return fallbackSrc;
      }
    }
    return imgSrc;
  };

  return (
    <div className="relative inline-block w-full h-full">
      {showLoadingSpinner && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        {...props}
        src={validateSrc()}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
          Using fallback
        </div>
      )}
    </div>
  );
}

