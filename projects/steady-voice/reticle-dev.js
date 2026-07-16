// Dev-only Reticle SDK — ponytail: esm.sh CDN; token from local dev server
const host = location.hostname;
if (host === 'localhost' || host === '127.0.0.1') {
  const { reticle, SESSION_AUTO, registerCapabilities } = await import(
    'https://esm.sh/@reticlehq/react'
  );
  const token = await fetch('/reticle-token').then((r) => (r.ok ? r.text() : ''));
  reticle.connect({ session: SESSION_AUTO, ...(token ? { token: token.trim() } : {}) });
  registerCapabilities({
    testids: [
      'nav-home',
      'nav-daf',
      'nav-pacing',
      'nav-breathing',
      'nav-techniques',
      'nav-reading',
      'nav-confidence',
      'nav-learn',
      'nav-progress',
      'log-practice-btn',
      'done-challenge-btn',
      'textsize-btn',
    ],
    signals: [],
    stores: [],
  });
}
