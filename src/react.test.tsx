import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createRef } from 'react';
import { usePasteCleaner } from './react.js';

describe('usePasteCleaner', () => {
  let element: HTMLDivElement;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    element = document.createElement('div');
    element.setAttribute('contenteditable', 'true');
    container.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should attach paste event listener', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = element;
    
    const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
    
    renderHook(() => usePasteCleaner(ref));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('paste', expect.any(Function));
  });

  it('should clean paste event', async () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = element;
    
    const onPaste = vi.fn();
    
    renderHook(() => usePasteCleaner(ref, { onPaste }));
    
    // Create a proper ClipboardEvent-like object that works with jsdom
    const clipboardData = {
      getData: vi.fn((type: string) => {
        if (type === 'text/html') return '<div class="notion-block">Test</div>';
        return '';
      }),
    };
    
    // Create event using jsdom's Event constructor
    const mockEvent = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    
    // Add clipboardData and target
    Object.defineProperty(mockEvent, 'clipboardData', {
      value: clipboardData,
      writable: false,
    });
    
    Object.defineProperty(mockEvent, 'target', {
      value: element,
      writable: false,
    });
    
    await act(async () => {
      element.dispatchEvent(mockEvent);
      // Wait for async cleaning
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    
    expect(onPaste).toHaveBeenCalled();
  });

  it('should not attach listener when disabled', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = element;
    
    const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
    
    renderHook(() => usePasteCleaner(ref, { enabled: false }));
    
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should clean up event listener on unmount', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = element;
    
    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
    
    const { unmount } = renderHook(() => usePasteCleaner(ref));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('paste', expect.any(Function));
  });
});

