// Pollinations free image generation — $0, no API key, no signup.
// Legacy endpoint verified 2026-11-22: GET
// https://image.pollinations.ai/prompt/<url-encoded-prompt>?width=1024&height=1024&seed=42&model=flux
// returned HTTP 200, JPEG, ~102 KB, in ~5.9s. Returned size was 768x768 for a
// 1024x1024 request — the service returns the nearest size it supports.
// Free limit (observed/documented): 1 NEW image per ~45 seconds per IP.
// Cached prompts load instantly. Flux is the free/unlimited model.
// No key is embedded here, no paid API is called, nothing is sent to a server
// we control. The browser calls Pollinations directly.

export const POLLINATIONS_FREE_LIMIT_SECONDS = 45;
export const POLLINATIONS_FREE_HISTORY_KEY = 'magic_higgsfield_free_history';
export const POLLINATIONS_LAST_GENERATED_KEY = 'magic_higgsfield_free_last_generated';

export const FREE_ASPECTS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9 Landscape', width: 1280, height: 720 },
  { id: '9:16', label: '9:16 Portrait / Reel', width: 720, height: 1280 },
  { id: '4:3', label: '4:3', width: 1024, height: 768 },
  { id: '3:2', label: '3:2', width: 1200, height: 800 },
];

export function buildPollinationsUrl(prompt, { width = 1024, height = 1024, seed, model = 'flux' } = {}) {
  const clean = String(prompt || '').trim();
  if (!clean) throw new Error('Please enter a prompt to generate an image.');
  const s = seed === undefined || seed === null ? Math.floor(Math.random() * 1000000) : seed;
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(s),
    model,
    nologo: 'false',
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}?${params.toString()}`;
}

export function secondsUntilFreeAllowed(lastGeneratedAt) {
  if (!lastGeneratedAt) return 0;
  const elapsed = (Date.now() - Number(lastGeneratedAt)) / 1000;
  return Math.max(0, Math.ceil(POLLINATIONS_FREE_LIMIT_SECONDS - elapsed));
}

// Preload the image so a failed / rate-limited (402) generation surfaces as
// an error instead of a broken <img>. Returns the URL on success.
export async function generateFreeImage({ prompt, width, height, seed, model = 'flux' }) {
  const url = buildPollinationsUrl(prompt, { width, height, seed, model });
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    if (res.status === 402) {
      const retryAfter = res.headers.get('Retry-After');
      throw new Error(
        `Free limit reached (1 new image per ~45s).${retryAfter ? ` Try again in ${retryAfter}s.` : ' Please wait ~45 seconds and try again.'}`
      );
    }
    throw new Error(`Pollinations returned ${res.status}. Please try again in a few seconds.`);
  }
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('Pollinations did not return an image. Please try again.');
  return { url, blob, contentType: blob.type, sizeBytes: blob.size };
}

export function loadFreeHistory() {
  try {
    return JSON.parse(localStorage.getItem(POLLINATIONS_FREE_HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function saveFreeHistory(entry) {
  try {
    const prev = loadFreeHistory();
    const next = [entry, ...prev.filter((e) => e.url !== entry.url)].slice(0, 50);
    localStorage.setItem(POLLINATIONS_FREE_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch { return [entry]; }
}
