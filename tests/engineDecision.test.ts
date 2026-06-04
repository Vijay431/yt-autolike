import { describe, expect, test } from 'vitest';
import { canAutoLike, hasReachedThreshold } from '../src/content/engine';
import type { Settings, Whitelist } from '../src/lib/types';

const settings: Settings = {
  mode: 'global',
  target_percentage: 0.5,
  hourly_reminders_enabled: true,
};

const whitelist: Whitelist = {
  channels: [{ id: 'UC123', name: 'Creator', added_at: 1 }],
};

describe('engine decision helpers', () => {
  test('detects whether watch threshold has been reached', () => {
    expect(hasReachedThreshold(49, 100, 0.5)).toBe(false);
    expect(hasReachedThreshold(50, 100, 0.5)).toBe(true);
  });

  test.each([
    ['global', 'video', true],
    ['only_shorts', 'video', false],
    ['only_shorts', 'short', true],
    ['only_videos', 'short', false],
    ['whitelist_only', 'video', true],
  ] as const)('applies mode gate %s on %s', (mode, pageType, expected) => {
    expect(
      canAutoLike({
        settings: { ...settings, mode },
        pageType,
        whitelist,
        channelId: 'UC123',
        channelName: 'Other casing',
        voteState: 'none',
        isLoggedIn: true,
        isActivelyWatching: true,
      }).allowed,
    ).toBe(expected);
  });

  test('skips already voted videos instead of allowing a click', () => {
    expect(
      canAutoLike({
        settings,
        pageType: 'video',
        whitelist,
        channelId: null,
        channelName: null,
        voteState: 'disliked',
        isLoggedIn: true,
        isActivelyWatching: true,
      }),
    ).toEqual({ allowed: false, reason: 'already disliked' });
  });

  test('requires active watching for hidden tabs unless popup is open upstream', () => {
    expect(
      canAutoLike({
        settings,
        pageType: 'video',
        whitelist,
        channelId: null,
        channelName: null,
        voteState: 'none',
        isLoggedIn: true,
        isActivelyWatching: false,
      }),
    ).toEqual({ allowed: false, reason: 'not active' });
  });
});
