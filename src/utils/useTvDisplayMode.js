import { useEffect, useRef, useState } from 'react';
import { DELI_API_ROOT } from '../Constants';

const POLL_INTERVAL_MS = 60_000;

// Powers the in-store TV display behavior on /sandwiches and /items: polls
// the admin-controlled tv-mode setting (so a remote toggle from /edit takes
// effect on an already-open TV tab without anyone touching it), and while
// it's on, keeps the screen awake and prompts once for fullscreen — browsers
// only allow requesting fullscreen from an actual user gesture, so that part
// can never happen fully automatically on page load.
export function useTvDisplayMode() {
  const [enabled, setEnabled] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const checkSetting = () => {
      fetch(`${DELI_API_ROOT}/api/settings/tv-mode`)
        .then((res) => res.json())
        .then((data) => { if (!cancelled) setEnabled(!!data.enabled); })
        .catch((err) => console.error('Error checking TV display mode:', err));
    };

    checkSetting();
    const interval = setInterval(checkSetting, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // The browser releases a wake lock whenever the tab isn't visible, so it
  // has to be re-requested on visibilitychange too — not just once when
  // tv-mode turns on — to stay correct across a reload or a wake from sleep.
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    const requestLock = () => {
      navigator.wakeLock.request('screen')
        .then((lock) => { wakeLockRef.current = lock; })
        .catch((err) => console.error('Error requesting wake lock:', err));
    };

    requestLock();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestLock();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [enabled]);

  // needsTap drives a one-time "tap to start" prompt. Assumes the TV tab is
  // never manually taken out of fullscreen once it's in — reasonable for an
  // unattended kiosk display, not something a real visitor is expected to do.
  useEffect(() => {
    if (!enabled) {
      setNeedsTap(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }

    if (!document.fullscreenElement) setNeedsTap(true);
  }, [enabled]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen()
      .then(() => setNeedsTap(false))
      .catch((err) => console.error('Error entering fullscreen:', err));
  };

  return { tvModeEnabled: enabled, needsTap, enterFullscreen };
}
