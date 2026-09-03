import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HubSectionNav } from '../components/HubSectionNav';
import { HubSourcesPanel } from '../components/HubSourcesPanel';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';

export function KnowledgeHubSourcesPage() {
  const navigate = useNavigate();
  const {
    selectedDocumentIds,
    m360Selected,
    toggleDocumentSelection,
    clearDocumentSelection,
    toggleM360Selection,
    setActiveSourcesFromSelection,
    clearSources,
    setGenieEnabled,
  } = useApp();

  const askInChat = () => {
    if (m360Selected) {
      clearSources();
      setGenieEnabled(true);
      clearDocumentSelection();
      navigate('/chat');
      return;
    }
    setGenieEnabled(false);
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  return (
    <div className="hub-page hub-page--workspace hub-page--overview section-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'Sources' },
        ]}
      />

      <HubSectionNav mode="full" />

      <HubSourcesPanel />

      <SelectedDocumentsBar
        selectedIds={selectedDocumentIds}
        m360Selected={m360Selected}
        onClear={clearDocumentSelection}
        onRemove={(id) => toggleDocumentSelection(id)}
        onRemoveM360={toggleM360Selection}
        onAskInChat={askInChat}
      />
    </div>
  );
}
