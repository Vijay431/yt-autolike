import React from 'react';
import { MotionConfig } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import OptionsApp from './OptionsApp';
import '../popup/styles.css';
import './options.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <OptionsApp />
      </MotionConfig>
    </React.StrictMode>,
  );
}
