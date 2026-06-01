/**
 * Toast overlay injector — YT AutoLike
 *
 * Injects a styled overlay directly into document.body (NOT inside Shadow DOM)
 * so it appears on top of all YouTube content. Uses `all: initial` + scoped
 * class names to prevent YouTube styles from bleeding in.
 */

import { randomMessage } from '../lib/messages';
import { TOAST_DURATION_MS } from '../lib/constants';

const TOAST_ID = 'yt-autolike-toast';

/** Inject and display a generic toast message. Auto-closes after TOAST_DURATION_MS. */
export function showToast(title: string, message: string): void {
  // Force remove existing toast if it somehow stuck around.
  const existing = document.getElementById(TOAST_ID);
  if (existing) {
    existing.remove();
  }

  // Create host element.
  const host = document.createElement('div');
  host.id = TOAST_ID;

  console.log('YT AutoLike: Injecting toast into DOM...');

  // Inject styles into the document head (scoped to our ID).
  injectStyles();

  // Build inner content with modern glassmorphism.
  host.innerHTML = `
    <div class="yt-al-toast-inner">
      <div class="yt-al-toast-content">
        <div class="yt-al-toast-icon-wrap">
          <svg class="yt-al-toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 9V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V9H5.5C4.67157 9 4 9.67157 4 10.5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V10.5C20 9.67157 19.3284 9 18.5 9H14Z" fill="currentColor" opacity="0.2"/>
            <path d="M14 9V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V9M14 9H18.5C19.3284 9 20 9.67157 20 10.5V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10.5C4 9.67157 4.67157 9 5.5 9H10M14 9H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 14L11 16L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="yt-al-toast-body">
          <span class="yt-al-toast-title">${escapeHtml(title)}</span>
          <span class="yt-al-toast-msg">${escapeHtml(message)}</span>
        </div>
      </div>
      <div class="yt-al-toast-progress" style="animation-duration: ${TOAST_DURATION_MS}ms;"></div>
    </div>
  `;

  document.body.appendChild(host);

  // Timer logic.
  setTimeout(() => dismiss(host), TOAST_DURATION_MS);

  // Trigger entrance animation on next frame reliably
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      host.classList.add('yt-al-toast-visible');
    });
  });
}

/** Inject and display the hourly reminder toast. Auto-closes after TOAST_DURATION_MS. */
export function showReminderToast(): void {
  const message = randomMessage();
  showToast('YT AutoLike Tip', message);
}

function dismiss(host: HTMLElement): void {
  host.classList.remove('yt-al-toast-visible');
  host.classList.add('yt-al-toast-hiding');

  let removed = false;
  const doRemove = () => {
    if (!removed) {
      removed = true;
      host.remove();
    }
  };

  host.addEventListener('transitionend', doRemove, { once: true });
  // Fallback in case transitionend doesn't fire (e.g. background tab)
  setTimeout(doRemove, 500);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectStyles(): void {
  if (document.getElementById('yt-al-toast-styles')) return;

  const style = document.createElement('style');
  style.id = 'yt-al-toast-styles';
  style.textContent = `
    #${TOAST_ID} {
      all: initial;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      pointer-events: auto;
      filter: drop-shadow(0 10px 30px rgba(0,0,0,0.5));
      opacity: 0;
      transform: translateY(24px) scale(0.95);
      transition: opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #${TOAST_ID}.yt-al-toast-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #${TOAST_ID}.yt-al-toast-hiding {
      opacity: 0;
      transform: translateY(16px) scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .yt-al-toast-inner {
      all: initial;
      display: flex;
      flex-direction: column;
      background: #212121;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      min-width: 300px;
      max-width: 360px;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
      font-family: 'Roboto', Arial, sans-serif;
      color: #f1f1f1;
    }

    .yt-al-toast-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .yt-al-toast-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ff0000;
      flex-shrink: 0;
      color: #ffffff;
    }

    .yt-al-toast-icon {
      width: 22px;
      height: 22px;
      display: block;
    }

    .yt-al-toast-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
      padding-top: 2px;
    }

    .yt-al-toast-title {
      font-size: 14px;
      font-weight: 500;
      color: #f1f1f1;
      line-height: 1.2;
      display: block;
      margin: 0;
    }

    .yt-al-toast-msg {
      font-size: 13px;
      line-height: 1.4;
      color: #aaaaaa;
      display: block;
      margin: 0;
    }


    .yt-al-toast-progress {
      height: 3px;
      background: linear-gradient(90deg, #cc0000, #ff4444);
      width: 100%;
      transform-origin: left;
      animation: yt-al-progress linear forwards;
      display: block;
    }

    @keyframes yt-al-progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `;

  document.head.appendChild(style);
}
