import React from 'react';

interface PolaLogoProps {
  size?: number;
  className?: string;
}

/**
 * Official Pola brand logo mark.
 * Replaces the old Sprout-in-circle pattern throughout the app.
 */
export const PolaLogo: React.FC<PolaLogoProps> = ({ size = 8, className = '' }) => (
  <img
    src="/pola-logo.jpg"
    alt="Pola"
    className={`w-${size} h-${size} object-contain rounded-full flex-shrink-0 ${className}`}
  />
);
