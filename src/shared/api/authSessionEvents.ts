const authSessionExpiredEvent = 'auth-session-expired';

export function notifyAuthSessionExpired() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(authSessionExpiredEvent));
}

export function subscribeToAuthSessionExpired(listener: () => void) {
  window.addEventListener(authSessionExpiredEvent, listener);

  return () => {
    window.removeEventListener(authSessionExpiredEvent, listener);
  };
}
