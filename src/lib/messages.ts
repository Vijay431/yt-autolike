/**
 * Pool of 100 positive creator-support messages for hourly reminder toasts.
 * Selected randomly by the toast injector.
 */
export const MESSAGES: readonly string[] = [
  'Your like encourages this creator to write and post better content.',
  'Training the algorithm starts with a simple click. Like this video!',
  'Refine your home feed by letting YouTube know you value this video.',
  'Creators write better scripts when they know their viewers appreciate it.',
  'Your likes help refine the algorithm to show you higher quality content.',
  'A quick thumbs up teaches the algorithm to recommend similar helpful videos.',
  'Support the writer who put hours of work into structuring this content.',
  'Curate your future feed by liking the videos that actually matter to you.',
  'Encouraging creators leads to more in-depth research and better videos.',
  'Teach YouTube what you enjoy; liking refines your daily recommendations.',
  'Every like is a vote of confidence that helps creators write better topics.',
  'Customize your algorithm feed one thumbs up at a time.',
  'Refine your content options by supporting videos that teach you something.',
  'Writing great content is hard; your like is the best encouragement.',
  'Clean up your YouTube recommendations by liking videos you want to see.',
  'The algorithm listens to your likes. Keep your feed clean and smart.',
  'Your like shows the writer their creative script hit the target.',
  'Guide your feed: liking tells YouTube to keep showing you this creator.',
  'Real encouragement makes content creators invest in better filming.',
  'Train your recommendation algorithm to value educational topics.',
  'Thumbs up helps this channel make even more detailed tutorials.',
  'Curate your content by letting YouTube know what standard you expect.',
  'Better writing, better editing, better videos—encouraged by your like.',
  'Likes tell the algorithm to prioritize quality over clickbait in your feed.',
  'Show the content writer some love so they keep researching new ideas.',
  'Tailor your homepage recommendations with a simple, quick thumbs up.',
  'When you like high-value videos, your algorithm gets smarter.',
  'Encourage creators to focus on detail instead of quick trends.',
  'A like is the easiest way to train YouTube to filter out the noise.',
  'Positive reinforcement motivates writers to explain complex ideas simply.',
  'Refining your feed starts with liking videos that add real value.',
  'Give a thumbs up to tell the algorithm you want more videos like this.',
  'Support the research and writing that helped you learn something new.',
  'Keep your YouTube homepage clean by feeding the algorithm good likes.',
  'Encouraged creators produce deeper content. Like to support them!',
  "Let YouTube's algorithm know you want to see more of this creator.",
  'A like guides the algorithm to recommend better content in your feed.',
  "Your thumbs up fuels the creator's next writing session.",
  'Filter out irrelevant videos by liking the ones you actually enjoy.',
  'Writing high-quality scripts takes time; show the creator it was worth it.',
  'Guide the algorithm: liking this keeps this topic on your homepage.',
  'Support independent writers who share their skills for free.',
  'A smart feed requires a trained algorithm. Keep liking quality content.',
  'Give the creator the motivation to tackle even bigger video ideas.',
  'Refine your daily content by giving thumbs up to trusted creators.',
  'Your like is a message to the writer that their effort was valued.',
  'Help the recommendation algorithm find more channels like this one.',
  'Encourage creators to prioritize depth over click-driven trends.',
  'Tell YouTube you want high-effort videos on your home feed.',
  'Your like is the fuel that keeps writers creative and inspired.',
  'Help YouTube understand your preferences and clean up your feed.',
  'Support detailed content by liking the scripts that taught you.',
  'A quick like keeps the algorithm aligned with your actual interests.',
  'Encouraging writers helps them focus on making better content for you.',
  'Refine your homepage to show you more educational and useful clips.',
  'Thumbs up teaches the algorithm to recommend higher standard videos.',
  'Let the writer know their script made a difference to your day.',
  'Help the creator stay motivated to write detailed explanations.',
  'Liking this video is a direct command to improve your algorithm.',
  'Clean your feed: your likes dictate what YouTube recommends next.',
  'Your appreciation drives creators to work harder on their next script.',
  'Train your algorithm to skip clickbait and recommend real value.',
  'Keep creator motivation high with a quick, supportive thumbs up.',
  'Every like helps the algorithm deliver better options to your feed.',
  'Writers put days into research. A like says thank you for the work.',
  'Shape your YouTube feed to match your personal learning goals.',
  'Encouraging creators means they can keep making high-quality guides.',
  'Liking this video is the fastest way to refine your recommendations.',
  'Support the creators who write content that makes you think.',
  'Your likes act as filters, keeping your homepage relevant.',
  'A simple thumbs up gives this creator the energy to write again.',
  'Teach the algorithm to bring you more insightful content.',
  'Help creators budget for better research by showing your support.',
  'A refined feed comes from liking the channels you trust.',
  'Encourage the writer behind the screen to keep sharing knowledge.',
  "Let the algorithm know you're interested in this specific topic.",
  'Thumbs up tells creators their long editing sessions are valued.',
  'Clear out the clutter on your feed by liking what you love.',
  'Your support drives writers to create more engaging tutorials.',
  'Liking lets writers focus on content depth instead of clickbait thumbnails.',
  'Refine your home feed: keep the algorithm focused on your goals.',
  'Encourage writers to produce authentic, non-sensationalized content.',
  'Tell the algorithm that you want to invest time in this creator.',
  'Support the writers who explain complex concepts step-by-step.',
  'A like is your signal to the algorithm to keep bringing you value.',
  'Encouraged creators make YouTube a place of learning and growth.',
  'Refine your suggestions: teach YouTube what topics you care about.',
  'Your feedback tells the writer that their effort was worth it.',
  'Liking a video acts as a vote for better content across the platform.',
  'Keep your recommendation feed aligned with your favorite niches.',
  'Supporting writers ensures they can keep producing independent views.',
  'Tell the algorithm you prefer research-backed content over noise.',
  'A thumbs up gives creators the freedom to write about important topics.',
  'Refine your viewing habits by backing the creators you learn from.',
  'Your algorithm listens to your thumbs up. Keep it well-trained.',
  'Give this content writer the motivation to publish their next script.',
  'A simple like tells YouTube to show you less generic content.',
  'Encourage the creator to share their expertise with the world.',
  'Support the hours of research that went into making this script.',
  'Refine your dashboard: likes help curate what you see next.',
] as const;

/** Returns a random message from the pool. */
export function randomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

import type { Message, LogEntry } from './types';

/** Type guard for LogEntry objects received at runtime. */
export function isValidLogEntry(entry: unknown): entry is LogEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  if (typeof e.timestamp !== 'number') return false;
  if (typeof e.title !== 'string') return false;
  if (typeof e.channel !== 'string') return false;
  if (e.type !== 'video' && e.type !== 'short') return false;
  if (e.status !== 'liked' && e.status !== 'skipped' && e.status !== 'error') return false;
  if (e.reason !== undefined && typeof e.reason !== 'string') return false;
  return true;
}

/** Type guard for Message objects exchanged between extension scripts. */
export function isValidMessage(msg: unknown): msg is Message {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  if (typeof m.type !== 'string') return false;

  switch (m.type) {
    case 'HEARTBEAT':
    case 'SHOW_REMINDER':
    case 'IS_POPUP_OPEN':
    case 'POPUP_OPENED':
    case 'POPUP_CLOSED':
    case 'GET_VIDEO_STATE':
    case 'GET_ACTIVE_TAB_INFO':
      return true;

    case 'IS_POPUP_OPEN_RESPONSE':
      return typeof m.open === 'boolean';

    case 'RECORD_LIKE':
    case 'RECORD_SKIP':
      return isValidLogEntry(m.entry);

    case 'ACTIVE_TAB_INFO': {
      if (!m.info || typeof m.info !== 'object') return false;
      const info = m.info as Record<string, unknown>;
      if (typeof info.tabId !== 'number') return false;
      if (typeof info.url !== 'string') return false;
      if (info.channelId !== null && typeof info.channelId !== 'string') return false;
      if (info.channelName !== null && typeof info.channelName !== 'string') return false;
      if (typeof info.isYouTube !== 'boolean') return false;
      return true;
    }

    default:
      return false;
  }
}
