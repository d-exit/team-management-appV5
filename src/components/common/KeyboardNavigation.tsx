import React, { useEffect, useRef, useState } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  trapFocus?: boolean;
}

/**
 * キーボードナビゲーションコンポーネント
 */
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  onEscape,
  onEnter,
  trapFocus = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // フォーカス可能な要素を取得
    const getFocusableElements = () => {
      const elements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements) as HTMLElement[];
    };

    setFocusableElements(getFocusableElements());

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
        case 'Enter':
          if (event.target === container) {
            event.preventDefault();
            onEnter?.();
          }
          break;
        case 'Tab':
          if (trapFocus) {
            event.preventDefault();
            const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
            const nextIndex = event.shiftKey
              ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
              : (currentIndex + 1) % focusableElements.length;
            focusableElements[nextIndex]?.focus();
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, trapFocus, focusableElements]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
};

/**
 * フォーカス管理フック
 */
export const useFocusManagement = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const focusableRefs = useRef<(HTMLElement | null)[]>([]);

  const registerFocusable = (index: number, element: HTMLElement | null) => {
    focusableRefs.current[index] = element;
  };

  const focusNext = () => {
    const nextIndex = (focusedIndex + 1) % focusableRefs.current.length;
    setFocusedIndex(nextIndex);
    focusableRefs.current[nextIndex]?.focus();
  };

  const focusPrevious = () => {
    const prevIndex = (focusedIndex - 1 + focusableRefs.current.length) % focusableRefs.current.length;
    setFocusedIndex(prevIndex);
    focusableRefs.current[prevIndex]?.focus();
  };

  const focusFirst = () => {
    setFocusedIndex(0);
    focusableRefs.current[0]?.focus();
  };

  const focusLast = () => {
    const lastIndex = focusableRefs.current.length - 1;
    setFocusedIndex(lastIndex);
    focusableRefs.current[lastIndex]?.focus();
  };

  return {
    focusedIndex,
    setFocusedIndex,
    registerFocusable,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
}; 