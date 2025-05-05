"use client";

import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
}

/**
 * Custom hook for detecting device type based on screen width
 * @returns DeviceInfo object with device type and boolean flags
 */
export default function useDeviceDetection(): DeviceInfo {
  // Default to desktop when server rendering
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      
      if (width < 640) { // Tailwind's sm breakpoint
        setDeviceInfo({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          deviceType: 'mobile',
        });
      } else if (width < 1024) { // Tailwind's lg breakpoint
        setDeviceInfo({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          deviceType: 'tablet',
        });
      } else {
        setDeviceInfo({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          deviceType: 'desktop',
        });
      }
    };

    // Initial check
    updateDeviceInfo();

    // Add event listener for resize
    window.addEventListener('resize', updateDeviceInfo);

    // Cleanup
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
} 