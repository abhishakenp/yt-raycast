import { useEffect, useRef, useCallback, useState } from "react";

export interface AISelection {
  text: string;
  rect: DOMRect;
}

/**
 * Hook that detects text selection within a container.
 * When `aiEditMode` is true and user highlights text,
 * it returns the selection via `onSelect`.
 */
export function useAITextEdit(
  containerRef: React.RefObject<HTMLElement | null>,
  aiEditMode: boolean,
  onSelect: (selection: AISelection | null) => void,
) {
  const callbackRef = useRef(onSelect);
  callbackRef.current = onSelect;

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    callbackRef.current(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSelectionChange = () => {
      if (!aiEditMode) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        // User cleared selection — don't immediately null out,
        // let the UI component decide when to dismiss
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      if (!text || text.length < 2 || text.length > 500) return;

      // Ensure selection is inside our container
      const containerEl = containerRef.current;
      if (!containerEl) return;

      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      if (
        !containerEl.contains(startContainer) ||
        !containerEl.contains(endContainer)
      ) {
        return;
      }

      // Skip if selection is inside buttons, inputs, etc.
      const commonAncestor = range.commonAncestorContainer;
      const parentEl =
        commonAncestor.nodeType === Node.ELEMENT_NODE
          ? (commonAncestor as HTMLElement)
          : commonAncestor.parentElement;
      if (parentEl) {
        const tag = parentEl.tagName.toLowerCase();
        if (
          [
            "button",
            "a",
            "input",
            "textarea",
            "select",
            "svg",
            "img",
            "video",
            "audio",
            "script",
            "style",
          ].includes(tag)
        ) {
          return;
        }
      }

      const rect = range.getBoundingClientRect();
      callbackRef.current({ text, rect });
    };

    const handleMouseUp = () => {
      // Delay so selection is finalized
      setTimeout(handleSelectionChange, 50);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!aiEditMode) return;
      const target = e.target as Node;
      const containerEl = containerRef.current;
      if (containerEl && !containerEl.contains(target)) {
        clearSelection();
      }
    };

    container.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("click", handleClickOutside);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("click", handleClickOutside);
      clearSelection();
    };
  }, [containerRef, aiEditMode, clearSelection]);

  return { clearSelection };
}
