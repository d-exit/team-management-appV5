import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isReducedMotion: boolean;
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    // システムの設定を検出
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // フォントサイズの設定をローカルストレージから読み込み
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    // フォントサイズをCSS変数として設定
    const root = document.documentElement;
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    };
    root.style.setProperty('--base-font-size', sizes[fontSize]);
  }, [fontSize]);

  const handleSetFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const value: AccessibilityContextType = {
    isReducedMotion,
    isHighContrast,
    fontSize,
    setFontSize: handleSetFontSize,
    toggleHighContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div
        className={`${isReducedMotion ? 'motion-reduce' : ''} ${
          isHighContrast ? 'high-contrast' : ''
        }`}
        style={{
          '--base-font-size': fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}; 