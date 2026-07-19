import { useEffect, useCallback, useRef } from "react";

type ShortcutHandler = () => void;

interface Shortcut {
  keys: string[];
  handler: ShortcutHandler;
  /** When true, the shortcut only fires when no input/textarea/select is focused */
  ignoreWhenEditing?: boolean;
}

let sequenceBuffer: { keys: string[]; timeout: ReturnType<typeof setTimeout> | null } = {
  keys: [],
  timeout: null,
};

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  // Use a ref so the effect doesn't re-register on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // Don't trigger shortcuts when typing in inputs
    const tag = (e.target as HTMLElement).tagName;
    const isEditing =
      tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

    for (const shortcut of shortcutsRef.current) {
      // Separate actual modifier keys (ctrl, meta, shift, alt) from sequence keys
      const MODIFIER_KEYS = ["ctrl", "meta", "shift", "alt"];
      const allKeys = shortcut.keys;
      const modifierKeys = allKeys.filter((k) => MODIFIER_KEYS.includes(k));
      const sequenceKeys = allKeys.filter((k) => !MODIFIER_KEYS.includes(k));

      // Check modifiers (Ctrl, Meta, Shift, Alt)
      const requiresCtrl = modifierKeys.includes("ctrl");
      const requiresMeta = modifierKeys.includes("meta");
      const requiresShift = modifierKeys.includes("shift");
      const requiresAlt = modifierKeys.includes("alt");

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (requiresCtrl && !e.ctrlKey) continue;
      if (requiresMeta && !e.metaKey) continue;
      if (!requiresCtrl && !requiresMeta && ctrlOrMeta) continue;
      if (requiresShift && !e.shiftKey) continue;
      if (requiresAlt && !e.altKey) continue;

      // Multi-key sequences (e.g., "g" then "d")
      if (isEditing && shortcut.ignoreWhenEditing) continue;

      if (sequenceKeys.length === 2) {
        const [firstKey, secondKey] = sequenceKeys;
        if (key === firstKey) {
          // Start or continue sequence
          if (sequenceBuffer.timeout) clearTimeout(sequenceBuffer.timeout);
          sequenceBuffer.keys.push(key);
          sequenceBuffer.timeout = setTimeout(() => {
            sequenceBuffer.keys = [];
            sequenceBuffer.timeout = null;
          }, 1000);
          e.preventDefault();
          return;
        }

        if (sequenceBuffer.keys.length === 1 && sequenceBuffer.keys[0] === firstKey && key === secondKey) {
          sequenceBuffer.keys = [];
          if (sequenceBuffer.timeout) {
            clearTimeout(sequenceBuffer.timeout);
            sequenceBuffer.timeout = null;
          }
          e.preventDefault();
          shortcut.handler();
          return;
        }

        // Reset sequence on any other key
        if (sequenceBuffer.timeout) {
          clearTimeout(sequenceBuffer.timeout);
          sequenceBuffer.timeout = null;
        }
        sequenceBuffer.keys = [];
        continue;
      }

      // Single key — use the first non-modifier key as the trigger
      const triggerKey = sequenceKeys[0];
      if (triggerKey && key === triggerKey) {
        e.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
