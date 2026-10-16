import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import PopupApp from './PopupApp';
import './styles.css';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <MotionConfig reducedMotion="user">
    <PopupApp />
  </MotionConfig>,
);
