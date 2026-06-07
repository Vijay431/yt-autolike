import { describe, expect, test } from 'vitest';
import {
  findShortsLikeButton,
  findVideoDislikeButton,
  findVideoLikeButton,
  getActiveContainer,
  getChannelId,
  getChannelName,
  getVideoTitle,
  metadataCache,
} from '../src/content/selectors';

describe('YouTube selectors', () => {
  test('finds standard video like and dislike buttons', () => {
    document.body.innerHTML = `
      <ytd-segmented-like-dislike-button-renderer>
        <div id="like-button"><button aria-label="Like this video"></button></div>
        <div id="dislike-button"><button aria-label="Dislike this video"></button></div>
      </ytd-segmented-like-dislike-button-renderer>
    `;

    expect(findVideoLikeButton()?.getAttribute('aria-label')).toBe('Like this video');
    expect(findVideoDislikeButton()?.getAttribute('aria-label')).toBe('Dislike this video');
  });

  test('scopes Shorts selectors to the active container', () => {
    document.body.innerHTML = `
      <ytd-reel-video-renderer>
        <like-button-view-model><button aria-label="Like inactive"></button></like-button-view-model>
      </ytd-reel-video-renderer>
      <ytd-reel-video-renderer is-active>
        <like-button-view-model><button aria-label="Like active"></button></like-button-view-model>
      </ytd-reel-video-renderer>
    `;

    const activeContainer = getActiveContainer('short');
    expect(activeContainer).toBeInstanceOf(Element);
    expect((activeContainer as Element).hasAttribute('is-active')).toBe(true);
    expect(findShortsLikeButton()?.getAttribute('aria-label')).toBe('Like active');
  });

  test('extracts channel handles and channel ids', () => {
    document.body.innerHTML = `
      <ytd-watch-metadata>
        <a class="yt-simple-endpoint" href="/@greatcreator">Great Creator</a>
        <div id="owner-name"><a>Great Creator</a></div>
        <div id="title"><h1>Great Video</h1></div>
      </ytd-watch-metadata>
    `;

    expect(getChannelId('video', '/watch?v=1')).toBe('@greatcreator');
    expect(getChannelName('video', '/watch?v=1')).toBe('Great Creator');
    expect(getVideoTitle('video', '/watch?v=1')).toBe('Great Video');
  });

  test('uses metadata cache fallback and caps cache size', () => {
    metadataCache.clear();
    document.body.innerHTML = `
      <ytd-watch-metadata>
        <a class="yt-simple-endpoint" href="/channel/UCcached"></a>
        <div id="owner-name"><a>Cached Creator</a></div>
        <div id="title"><h1>Cached Title</h1></div>
      </ytd-watch-metadata>
    `;

    expect(getVideoTitle('video', '/watch?v=keep')).toBe('Cached Title');
    expect(getChannelId('video', '/watch?v=keep')).toBe('UCcached');
    document.body.innerHTML = '';
    document.title = 'YouTube';
    expect(getVideoTitle('video', '/watch?v=keep')).toBe('Cached Title');
    expect(getChannelId('video', '/watch?v=keep')).toBe('UCcached');

    for (let index = 0; index < 55; index += 1) {
      document.body.innerHTML = `<h1 class="title">Title ${index}</h1>`;
      getVideoTitle('video', `/watch?v=${index}`);
    }

    expect(metadataCache.size).toBeLessThanOrEqual(50);
  });
});
