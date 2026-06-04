import { describe, expect, test } from 'vitest';
import { isValidMessage } from '../src/lib/messages';
import type { LogEntry, Message } from '../src/lib/types';

const logEntry: LogEntry = {
  timestamp: 1,
  title: 'A video',
  channel: 'A channel',
  type: 'video',
  status: 'liked',
};

describe('runtime message validation', () => {
  test.each<Message>([
    { type: 'HEARTBEAT' },
    { type: 'SHOW_REMINDER' },
    { type: 'IS_POPUP_OPEN' },
    { type: 'IS_POPUP_OPEN_RESPONSE', open: true },
    { type: 'POPUP_OPENED' },
    { type: 'POPUP_CLOSED' },
    { type: 'GET_VIDEO_STATE' },
    { type: 'GET_ACTIVE_TAB_INFO' },
    { type: 'RECORD_LIKE', entry: logEntry },
    { type: 'RECORD_SKIP', entry: { ...logEntry, status: 'skipped' } },
    {
      type: 'ACTIVE_TAB_INFO',
      info: {
        tabId: 1,
        url: 'https://www.youtube.com/watch?v=abc',
        channelId: 'UC123',
        channelName: 'Creator',
        isYouTube: true,
      },
    },
  ])('accepts valid %s messages', (message) => {
    expect(isValidMessage(message)).toBe(true);
  });

  test.each([
    { type: 'RECORD_LIKE' },
    { type: 'RECORD_SKIP', entry: { ...logEntry, timestamp: 'yesterday' } },
    { type: 'ACTIVE_TAB_INFO', info: { tabId: '1' } },
    { type: 'SENDER_SHAPED_JUNK', id: 'test-extension-id', tab: {} },
    { type: 'UNKNOWN' },
    null,
  ])('rejects malformed messages %#', (message) => {
    expect(isValidMessage(message)).toBe(false);
  });
});
