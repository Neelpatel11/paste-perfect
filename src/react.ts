import { useEffect, useRef, useCallback, type RefObject } from 'react';
import { cleanPaste } from './core.js';
import type { CleanPasteOptions } from './types.js';

export interface UsePasteCleanerOptions extends CleanPasteOptions {
  enabled?: boolean;
  onPaste?: (cleaned: string) => void;
}

/**
 * React hook for paste cleaning
 */
export function usePasteCleaner(
  ref: RefObject<HTMLElement>,
  options: UsePasteCleanerOptions = {}
): void {
  const { enabled = true, onPaste, ...cleanOptions } = options;
  const handlerRef = useRef<((e: ClipboardEvent) => Promise<void>) | null>(null);
  
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (!enabled || !ref.current) {
        return;
      }
      
      // Check if the paste is happening in the target element
      const target = event.target as Node;
      if (!ref.current.contains(target)) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      try {
        const cleaned = await cleanPaste(event, cleanOptions);
        
        if (cleaned && ref.current) {
          // Try to insert into contenteditable elements
          if (
            ref.current instanceof HTMLDivElement ||
            ref.current instanceof HTMLParagraphElement ||
            (ref.current as HTMLElement).isContentEditable
          ) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              
              if (cleanOptions.format === 'markdown') {
                // Insert as text for markdown
                const textNode = document.createTextNode(cleaned);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              } else {
                // Insert as HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleaned;
                const fragment = document.createDocumentFragment();
                const nodes: Node[] = [];
                while (tempDiv.firstChild) {
                  const node = tempDiv.firstChild;
                  fragment.appendChild(node);
                  nodes.push(node);
                }
                range.insertNode(fragment);
                // Get the last inserted node (fragment is empty after insertion)
                const lastNode = nodes[nodes.length - 1];
                if (lastNode && lastNode.parentNode) {
                  range.setStartAfter(lastNode);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } else {
                  // Fallback: set cursor to end of range
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          }
          
          // Call user callback
          if (onPaste) {
            onPaste(cleaned);
          }
        }
      } catch (error) {
        console.error('Paste cleaning failed:', error);
        // Fallback: allow default paste behavior
        if (ref.current instanceof HTMLElement) {
          ref.current.dispatchEvent(
            new ClipboardEvent('paste', {
              clipboardData: event.clipboardData,
              bubbles: true,
              cancelable: true,
            })
          );
        }
      }
    },
    [enabled, ref, cleanOptions, onPaste]
  );
  
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }
    
    handlerRef.current = handlePaste;
    const element = ref.current;
    
    element.addEventListener('paste', handlerRef.current);
    
    return () => {
      if (handlerRef.current) {
        element.removeEventListener('paste', handlerRef.current);
      }
    };
  }, [enabled, ref, handlePaste]);
}

