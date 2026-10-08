import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgeHubBrowsePage } from './pages/KnowledgeHubBrowsePage';
import { KnowledgeHubPage } from './pages/KnowledgeHubPage';
import { KnowledgeHubSectionPage } from './pages/KnowledgeHubSectionPage';
import { KnowledgeHubSourcesPage } from './pages/KnowledgeHubSourcesPage';
import { TeamPage } from './pages/TeamPage';
import { WelcomePage } from './pages/WelcomePage';

function LegacySectionRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/knowledge-hub/${slug ?? ''}`} replace />;
}

function AppRoutes() {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');

  return (
    <>
      <AppHeader />
      <main id="main-content" className={`app-main${isChat ? ' app-main--chat' : ''}`}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="/knowledge-hub/browse" element={<KnowledgeHubBrowsePage />} />
          <Route path="/knowledge-hub/sources" element={<KnowledgeHubSourcesPage />} />
          <Route path="/knowledge-hub/team" element={<TeamPage />} />
          <Route path="/knowledge-hub/:slug" element={<KnowledgeHubSectionPage />} />
          <Route path="/team" element={<Navigate to="/knowledge-hub/team" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/ai-assistant" element={<Navigate to="/ai-assistant/market" replace />} />
          <Route path="/ai-assistant/:pane" element={<AiAssistantPage key="assistant-classic" variant="classic" />} />
          <Route path="/ai-assistant-v2" element={<Navigate to="/ai-assistant-v2/market" replace />} />
          <Route path="/ai-assistant-v2/:pane" element={<AiAssistantPage key="assistant-v2" variant="v2" />} />
          <Route path="/ai-assistant-v3" element={<Navigate to="/ai-assistant-v3/market" replace />} />
          <Route path="/ai-assistant-v3/:pane" element={<AiAssistantPage key="assistant-v3" variant="v3" />} />
          <Route path="/sections/:slug" element={<LegacySectionRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isChat ? <AppFooter /> : null}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="app-shell">
          <a className="visually-hidden-focusable btn btn-secondary" href="#main-content">
            Skip to content
          </a>
          <AppRoutes />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
