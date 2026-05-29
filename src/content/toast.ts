/**
 * Toast overlay injector — Auto Like YT Videos
 *
 * Injects a styled overlay directly into document.body (NOT inside Shadow DOM)
 * so it appears on top of all YouTube content. Uses `all: initial` + scoped
 * class names to prevent YouTube styles from bleeding in.
 */

import {randomMessage} from '../lib/messages'
import {TOAST_DURATION_MS} from '../lib/constants'

const TOAST_ID = 'yt-autolike-toast'

/** Inject and display the hourly reminder toast. Auto-closes after TOAST_DURATION_MS. */
export function showReminderToast(): void {
  // Don't stack multiple toasts.
  if (document.getElementById(TOAST_ID)) return

  const message = randomMessage()

  // Create host element.
  const host = document.createElement('div')
  host.id = TOAST_ID

  // Inject styles into the document head (scoped to our ID).
  injectStyles()

  // Build inner content.
  host.innerHTML = `
    <div class="yt-al-toast-inner">
      <div class="yt-al-toast-icon">👍</div>
      <div class="yt-al-toast-body">
        <span class="yt-al-toast-title">Auto Like YT</span>
        <span class="yt-al-toast-msg">${escapeHtml(message)}</span>
      </div>
      <button class="yt-al-toast-close" aria-label="Dismiss">✕</button>
    </div>
  `

  document.body.appendChild(host)

  // Auto-close.
  const timer = setTimeout(() => dismiss(host), TOAST_DURATION_MS)

  // Manual dismiss.
  const closeBtn = host.querySelector('.yt-al-toast-close')
  closeBtn?.addEventListener('click', () => {
    clearTimeout(timer)
    dismiss(host)
  })

  // Trigger entrance animation on next frame.
  requestAnimationFrame(() => {
    host.classList.add('yt-al-toast-visible')
  })
}

function dismiss(host: HTMLElement): void {
  host.classList.remove('yt-al-toast-visible')
  host.classList.add('yt-al-toast-hiding')
  host.addEventListener(
    'transitionend',
    () => {
      host.remove()
    },
    {once: true},
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

let stylesInjected = false

function injectStyles(): void {
  if (stylesInjected) return
  stylesInjected = true

  const style = document.createElement('style')
  style.textContent = `
    #${TOAST_ID} {
      all: initial;
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 2147483647;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: auto;
    }

    #${TOAST_ID}.yt-al-toast-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #${TOAST_ID}.yt-al-toast-hiding {
      opacity: 0;
      transform: translateY(16px) scale(0.96);
    }

    .yt-al-toast-inner {
      all: initial;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-left: 3px solid #ff0000;
      border-radius: 12px;
      padding: 14px 16px;
      max-width: 340px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
      backdrop-filter: blur(8px);
      box-sizing: border-box;
    }

    .yt-al-toast-icon {
      all: initial;
      font-size: 22px;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .yt-al-toast-body {
      all: initial;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .yt-al-toast-title {
      all: initial;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #ff4444;
    }

    .yt-al-toast-msg {
      all: initial;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.45;
      color: #e8e8e8;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .yt-al-toast-close {
      all: initial;
      cursor: pointer;
      color: #888;
      font-size: 14px;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.2s ease, background 0.2s ease;
      flex-shrink: 0;
      font-family: inherit;
    }

    .yt-al-toast-close:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }
  `

  document.head.appendChild(style)
}
