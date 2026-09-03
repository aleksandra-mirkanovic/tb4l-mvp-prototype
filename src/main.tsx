import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { SEMANTIC_COLORS } from './config/semanticColors';
import './styles/global.css';
import './styles/semantic-colors.css';

/* Easy revert: set SEMANTIC_COLORS = false in src/config/semanticColors.ts */
document.documentElement.classList.toggle('semantic-colors', SEMANTIC_COLORS);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
