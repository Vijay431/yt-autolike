import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { getWhitelist, setWhitelist } from '../lib/storage';
import type { Whitelist } from '../lib/types';

export default function OptionsApp() {
  const [whitelist, setWhitelistState] = useState<Whitelist>([]);

  useEffect(() => {
    getWhitelist().then(setWhitelistState);
  }, []);

  const removeChannel = async (channelId: string) => {
    const newList = whitelist.filter((c) => c.channelId !== channelId);
    setWhitelistState(newList);
    await setWhitelist(newList);
  };

  return (
    <div
      className="popup-root"
      style={{
        minWidth: '600px',
        maxWidth: '800px',
        margin: '0 auto',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <header className="popup-header">
        <div className="popup-header-left">
          <ShieldCheck className="popup-logo" size={32} color="var(--accent)" />
          <div>
            <h1 className="popup-title" style={{ fontSize: '20px' }}>
              Whitelist Management
            </h1>
            <p className="popup-version">Manage your trusted YouTube channels</p>
          </div>
        </div>
      </header>

      <main className="popup-body" style={{ padding: '24px' }}>
        <section className="section">
          <h2 className="section-title">Whitelisted Channels</h2>
          {whitelist.length === 0 ? (
            <div
              className="empty-state"
              style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}
            >
              <p>Your whitelist is empty.</p>
              <p style={{ fontSize: '12px' }}>
                Add channels from the extension popup while watching their videos.
              </p>
            </div>
          ) : (
            <div className="whitelist-grid" style={{ display: 'grid', gap: '12px' }}>
              <AnimatePresence>
                {whitelist.map((channel) => (
                  <motion.div
                    key={channel.channelId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mode-card"
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: '16px',
                      textAlign: 'left',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="mode-name" style={{ fontSize: '16px' }}>
                        {channel.channelName}
                      </span>
                      <span className="mode-desc" style={{ fontSize: '11px' }}>
                        ID: {channel.channelId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`https://youtube.com/channel/${channel.channelId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pause-toggle"
                        style={{
                          padding: '8px',
                          background: 'var(--bg-card-hover)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <ExternalLink size={18} />
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeChannel(channel.channelId)}
                        className="pause-toggle"
                        style={{
                          padding: '8px',
                          background: 'rgba(255,0,0,0.1)',
                          color: 'var(--accent)',
                        }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
