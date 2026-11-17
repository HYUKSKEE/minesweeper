"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

interface Options {
  onClick: () => void;
  /** Fired after holding a touch/pen press for `delay` ms. */
  onLongPress: () => void;
  /** Fired for mouse right-click. */
  onContextMenu: () => void;
  delay?: number;
}

/**
 * Tap = click, long touch = long press, right-click = context action.
 * The native context menu is always suppressed.
 */
export function useLongPress({ onClick, onLongPress, onContextMenu, delay = 400 }: Options) {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);
  const isTouch = useRef(false);
  const latest = useRef({ onClick, onLongPress, onContextMenu });

  useEffect(() => {
    latest.current = { onClick, onLongPress, onContextMenu };
  });

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      isTouch.current = e.pointerType !== "mouse";
      fired.current = false;
      clear();
      if (!isTouch.current) return;
      timer.current = window.setTimeout(() => {
        timer.current = null;
        fired.current = true;
        navigator.vibrate?.(15);
        latest.current.onLongPress();
      }, delay);
    },
    [clear, delay],
  );

  const end = useCallback(() => {
    clear();
    // Keep `fired` just long enough to swallow the click that follows the release.
    if (fired.current) window.setTimeout(() => (fired.current = false), 300);
  }, [clear]);

  const handleClick = useCallback(() => {
    if (fired.current) {
      fired.current = false;
      return;
    }
    latest.current.onClick();
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    // On touch, the long-press timer already handled it.
    if (!isTouch.current) latest.current.onContextMenu();
  }, []);

  return {
    onPointerDown,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
    onClick: handleClick,
    onContextMenu: handleContextMenu,
  };
}
