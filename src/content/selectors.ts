import type { PageType } from '../lib/types';

// Cache to prevent flickers on navigation/swiping
interface VideoMetadata {
  title: string;
  channelName: string | null;
  channelId: string | null;
}
export const metadataCache = new Map<string, VideoMetadata>();

export function getActiveContainer(pageType: PageType | null): Element | Document {
  if (pageType === 'short') {
    const active = document.querySelector(
      'ytd-reel-video-renderer[is-active], ytd-reel-video-renderer[active]',
    );
    if (active) return active;

    const containers = document.querySelectorAll<Element>('ytd-reel-video-renderer');
    for (const container of containers) {
      if (isElementVisible(container as HTMLElement)) {
        return container;
      }
    }
  }
  return document;
}

export function getActiveVideo(pageType: PageType | null): HTMLVideoElement | null {
  const container = getActiveContainer(pageType);
  return container.querySelector<HTMLVideoElement>('video');
}

export function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function isLoggedIn(): boolean {
  const signInButton = document.querySelector('a[href*="accounts.google.com"]');
  const avatarButton = document.querySelector('#avatar-btn');
  if (avatarButton) return true;
  if (signInButton) return false;
  return true;
}

export function findVideoLikeButton(): HTMLButtonElement | null {
  const newStyle = document.querySelector<HTMLButtonElement>(
    'like-button-view-model button[aria-label]',
  );
  if (newStyle) return newStyle;

  const watchMeta = document.querySelector<HTMLButtonElement>(
    'ytd-watch-metadata #top-level-buttons-computed ytd-toggle-button-renderer:first-child button',
  );
  if (watchMeta) return watchMeta;

  const segmented = document.querySelector<HTMLButtonElement>(
    'ytd-segmented-like-dislike-button-renderer #like-button button',
  );
  if (segmented) return segmented;

  const all = document.querySelectorAll<HTMLButtonElement>('button[aria-label]');
  for (const btn of all) {
    const label = btn.getAttribute('aria-label')?.toLowerCase() ?? '';
    if (label.includes('like') && !label.includes('dislike')) {
      return btn;
    }
  }
  return null;
}

export function findVideoDislikeButton(): HTMLButtonElement | null {
  const newStyle = document.querySelector<HTMLButtonElement>(
    'dislike-button-view-model button[aria-label]',
  );
  if (newStyle) return newStyle;

  const segmented = document.querySelector<HTMLButtonElement>(
    'ytd-segmented-like-dislike-button-renderer #dislike-button button',
  );
  if (segmented) return segmented;

  const all = document.querySelectorAll<HTMLButtonElement>('button[aria-label]');
  for (const btn of all) {
    const label = btn.getAttribute('aria-label')?.toLowerCase() ?? '';
    if (label.includes('dislike')) return btn;
  }
  return null;
}

export function findShortsLikeButton(): HTMLButtonElement | null {
  const container = getActiveContainer('short');
  if (container && container !== document) {
    const btn = container.querySelector<HTMLButtonElement>(
      'like-button-view-model button, ytd-like-button-renderer button',
    );
    if (btn) return btn;
  }
  return document.querySelector<HTMLButtonElement>(
    'ytd-shorts like-button-view-model button, ytd-shorts ytd-like-button-renderer button',
  );
}

export function findShortsDislikeButton(): HTMLButtonElement | null {
  const container = getActiveContainer('short');
  if (container && container !== document) {
    const btn = container.querySelector<HTMLButtonElement>(
      'dislike-button-view-model button, ytd-dislike-button-renderer button',
    );
    if (btn) return btn;
  }
  return document.querySelector<HTMLButtonElement>(
    'ytd-shorts dislike-button-view-model button, ytd-shorts ytd-dislike-button-renderer button',
  );
}

export function getChannelId(pageType: PageType, currentPath: string): string | null {
  const container = getActiveContainer(pageType);
  let channelId: string | null = null;

  const channelLink = container.querySelector<HTMLAnchorElement>(
    'ytd-video-owner-renderer a, ytd-watch-metadata a.yt-simple-endpoint[href*="/channel/"], ytd-watch-metadata a.yt-simple-endpoint[href*="/@"], ytd-reel-player-header-renderer ytd-channel-name a, ytd-reel-player-header-renderer a.yt-simple-endpoint, ytd-reel-player-header-renderer a, ytd-channel-name a, #channel-info a',
  );
  if (channelLink) {
    const href = channelLink.getAttribute('href') ?? '';
    const match = href.match(/\/channel\/(UC[^/?]+)/);
    if (match) {
      channelId = match[1];
    } else {
      const handleMatch = href.match(/\/@([^/?]+)/) || href.match(/@([^/?]+)/);
      if (handleMatch) {
        channelId = '@' + handleMatch[1];
      } else {
        const userMatch = href.match(/\/user\/([^/?]+)/) || href.match(/\/c\/([^/?]+)/);
        if (userMatch) {
          channelId = userMatch[1];
        }
      }
    }
  }

  if (channelId) {
    const existing = metadataCache.get(currentPath) || {
      title: 'Unknown title',
      channelName: null,
    };
    metadataCache.set(currentPath, { ...existing, channelId });
    return channelId;
  }

  const cached = metadataCache.get(currentPath);
  if (cached?.channelId) {
    return cached.channelId;
  }
  return null;
}

export function getChannelName(pageType: PageType, currentPath: string): string | null {
  const container = getActiveContainer(pageType);
  let channelName = '';

  if (pageType === 'video') {
    const ownerName = container.querySelector<HTMLElement>(
      'ytd-video-owner-renderer #channel-name a, ytd-watch-metadata #owner-name a',
    );
    if (ownerName?.textContent?.trim()) {
      channelName = ownerName.textContent.trim();
    }
  } else {
    const shortsOwner = container.querySelector<HTMLElement>(
      'ytd-reel-player-header-renderer ytd-channel-name a, ytd-reel-player-header-renderer ytd-channel-name, ytd-reel-player-header-renderer #channel-name a, ytd-reel-player-header-renderer #channel-name, ytd-channel-name a, ytd-channel-name, yt-formatted-string.ytd-channel-name, #channel-name a, #channel-info a, ytd-reel-channel-bar-renderer #channel-name a, .channel-name',
    );
    if (shortsOwner?.textContent?.trim()) {
      channelName = shortsOwner.textContent.trim();
    }
  }

  const isGeneric =
    !channelName ||
    channelName.toLowerCase() === 'loading...' ||
    channelName.toLowerCase() === 'loading';

  if (!isGeneric) {
    const existing = metadataCache.get(currentPath) || { title: 'Unknown title', channelId: null };
    metadataCache.set(currentPath, { ...existing, channelName });
    return channelName;
  }

  const cached = metadataCache.get(currentPath);
  if (cached?.channelName) {
    return cached.channelName;
  }
  return null;
}

export function getVideoTitle(pageType: PageType, currentPath: string): string {
  const container = getActiveContainer(pageType);
  let title = '';

  if (pageType === 'short') {
    const shortTitle =
      container.querySelector<HTMLElement>('#video-title') ||
      container.querySelector<HTMLElement>('h2.style-scope.ytd-reel-player-overlay') ||
      container.querySelector<HTMLElement>('#overlay h2') ||
      container.querySelector<HTMLElement>('h2.title') ||
      container.querySelector<HTMLElement>('h2');

    if (shortTitle?.textContent?.trim()) {
      title = shortTitle.textContent.trim();
    }
  } else {
    title =
      container.querySelector<HTMLElement>('ytd-watch-metadata #title h1')?.textContent?.trim() ||
      container.querySelector<HTMLElement>('h1.title')?.textContent?.trim() ||
      container.querySelector<HTMLElement>('h2.title')?.textContent?.trim() ||
      '';
  }

  if (!title) {
    title = document.title?.trim() || '';
  }

  if (!title) {
    title = 'Unknown title';
  }

  const isGeneric =
    title.toLowerCase() === 'youtube' ||
    title.toLowerCase() === 'youtube shorts' ||
    title.toLowerCase() === 'shorts' ||
    title.toLowerCase() === 'loading...' ||
    title.toLowerCase() === 'loading' ||
    title === 'Unknown title';

  if (!isGeneric) {
    const existing = metadataCache.get(currentPath) || { channelName: null, channelId: null };
    metadataCache.set(currentPath, { ...existing, title });

    if (metadataCache.size > 50) {
      const firstKey = metadataCache.keys().next().value;
      if (firstKey) metadataCache.delete(firstKey);
    }
    return title;
  }

  const cached = metadataCache.get(currentPath);
  if (cached?.title) {
    return cached.title;
  }
  return title;
}
