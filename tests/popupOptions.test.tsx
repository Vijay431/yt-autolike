import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PopupApp from '../src/popup/PopupApp';
import OptionsApp from '../src/options/OptionsApp';

describe('popup and options UI', () => {
  test('renders popup settings and disabled non-YouTube add-channel state', async () => {
    vi.mocked(chrome.tabs.query).mockImplementation(async () => [
      { id: 1, url: 'https://example.com/' } as chrome.tabs.Tab,
    ]);

    render(<PopupApp />);

    expect(await screen.findByText('YT AutoLike')).toBeInTheDocument();
    expect(screen.getByText('Auto-Like Mode')).toBeInTheDocument();
    expect(screen.getByText('Watch Threshold')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open a youtube video first/i })).toBeDisabled();
    });
  });

  test('renders empty options whitelist state', async () => {
    render(<OptionsApp />);

    expect(await screen.findByText('Whitelist Management')).toBeInTheDocument();
    expect(screen.getByText('Your whitelist is empty.')).toBeInTheDocument();
  });

  test('removes a whitelisted channel from options', async () => {
    await chrome.storage.sync.set({
      whitelist: {
        channels: [{ id: 'UC123', name: 'Creator One', added_at: 1 }],
      },
    });
    const user = userEvent.setup();

    render(<OptionsApp />);

    expect(await screen.findByText('Creator One')).toBeInTheDocument();
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.queryByText('Creator One')).not.toBeInTheDocument();
    });
  });
});
