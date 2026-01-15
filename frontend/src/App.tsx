import { useState, useMemo, useEffect } from 'react';
import { TreeNode, BoilResult, Template } from './types';
import * as api from './api';
import TitleBar from './TitleBar';
import BuilderPanel from './BuilderPanel';
import PreviewPanel from './PreviewPanel';
import LibraryView from './LibraryView';
import ForgeModal from './ForgeModal';
import SuccessModal from './SuccessModal';
import TemplateDetailModal from './TemplateDetailModal';
import PathSelectionModal from './PathSelectionModal';
import AIModal from './AIModal';
import Toast, { ToastMessage } from './Toast';
import Confirm from './Confirm';
import { Flame, Library, Hammer } from 'lucide-react';

function App() {
  const [view, setView] = useState<'builder' | 'library'>('builder');
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [projectName, setProjectName] = useState('my-project');
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [pathModalSource, setPathModalSource] = useState<'builder' | 'template' | null>(null);
  const [pendingTemplateNodes, setPendingTemplateNodes] = useState<TreeNode[] | null>(null);
  const [boilResult, setBoilResult] = useState<BoilResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const manifestData = useMemo(() => {
    const folderCount = nodes.filter(n => n.type === 'folder').length;
    const fileCount = nodes.filter(n => n.type === 'file').length;
    const warnings = api.validateStructure(nodes);
    return { folderCount, fileCount, warnings };
  }, [nodes]);

  const handleSaveTemplate = async (name: string, tags: string[]) => {
    try {
      await api.saveTemplate(name, tags, nodes);
      setShowForgeModal(false);
      await loadTemplates();
      showToast(`Template "${name}" saved successfully!`, 'success');
    } catch (error) {
      showToast('Failed to save template', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setConfirmDelete({ id, message: `Delete template "${template.name}"?` });
    }
  };

  const confirmDeleteTemplate = async () => {
    if (confirmDelete) {
      await api.deleteTemplate(confirmDelete.id);
      await loadTemplates();
      setConfirmDelete(null);
      showToast('Template deleted', 'success');
    }
  };

  const handleRenameTemplate = async (id: string, name: string, tags: string[]) => {
    await api.updateTemplate(id, name, tags);
    await loadTemplates();
    showToast('Template updated', 'success');
  };

  const handleBoilItClick = () => {
    setPathModalSource('builder');
    setShowPathModal(true);
  };

  const handleTemplateBoilClick = (templateNodes: TreeNode[]) => {
    setPendingTemplateNodes(templateNodes);
    setPathModalSource('template');
    setSelectedTemplate(null);
    setShowPathModal(true);
  };

  const handlePathConfirm = async (outputPath: string) => {
    setShowPathModal(false);
    try {
      const nodesToBoil = pathModalSource === 'template' ? pendingTemplateNodes : nodes;
      if (nodesToBoil) {
        const result = await api.createStructure(nodesToBoil, outputPath);
        setBoilResult(result);
      }
    } catch (error) {
      showToast('Failed to create structure', 'error');
    } finally {
      setPendingTemplateNodes(null);
      setPathModalSource(null);
    }
  };

  const handleAIGenerated = (name: string, generatedNodes: TreeNode[]) => {
    setProjectName(name);
    setNodes(generatedNodes);
    setShowAIModal(false);
    setMode('manual');
    showToast(`AI generated structure for "${name}"`, 'success');
  };

  const handleModeChange = (newMode: 'manual' | 'ai') => {
    if (newMode === 'ai') {
      setShowAIModal(true);
    } else {
      setMode('manual');
    }
  };

  return (
    <div className="app">
      <TitleBar mode={mode} onModeChange={handleModeChange} />
      <div className="title-bar" style={{ background: '#b8b4ac', padding: '6px 12px', borderTop: '1px solid #dfdfdf' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`toggle-btn ${view === 'builder' ? 'active' : ''}`} onClick={() => setView('builder')}>
            <Hammer size={14} style={{ marginRight: '4px' }} /> Builder
          </button>
          <button className={`toggle-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>
            <Library size={14} style={{ marginRight: '4px' }} /> Library
          </button>
        </div>
      </div>
      <div className="main-content">
        {view === 'builder' ? (
          <>
            <BuilderPanel projectName={projectName} nodes={nodes} onProjectNameChange={setProjectName}
              onAddNode={(n) => setNodes([...nodes, n])} onRenameNode={(id, name) => setNodes(nodes.map(n => n.id === id ? { ...n, name } : n))}
              onDeleteNode={(id) => setNodes(nodes.filter(n => n.id !== id && n.parentId !== id))}
              onDuplicateNode={(id) => { const node = nodes.find(n => n.id === id); if (node) setNodes([...nodes, { ...node, id: `node-${Date.now()}`, name: `${node.name}-copy` }]); }}
              onBoilIt={handleBoilItClick}
              onForgeIt={() => setShowForgeModal(true)} />
            <PreviewPanel projectName={projectName} nodes={nodes} manifestData={manifestData} />
          </>
        ) : (
          <LibraryView templates={templates} onDeleteTemplate={handleDeleteTemplate}
            onRenameTemplate={handleRenameTemplate} onSelectTemplate={setSelectedTemplate}
            onLoadToBuilder={(template) => { setNodes(template.structure); setProjectName(template.name); setView('builder'); showToast(`Loaded "${template.name}" to builder`, 'success'); }} />
        )}
      </div>
      <div className="footer"><Flame size={12} className="footer-icon" /><span>Boil-it UI v1.0</span></div>

      {showForgeModal && <ForgeModal onClose={() => setShowForgeModal(false)} onSave={handleSaveTemplate} />}

      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} onGenerated={handleAIGenerated} />}

      {boilResult && <SuccessModal result={boilResult} onClose={() => setBoilResult(null)}
        onOpenFolder={() => api.openFolder(boilResult.outputPath)} onOpenVSCode={() => api.openInVSCode(boilResult.outputPath)}
        onUndo={() => setBoilResult(null)} />}

      {selectedTemplate && <TemplateDetailModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)}
        onBoil={handleTemplateBoilClick}
        onForge={(template) => { setNodes(template.structure); setProjectName(template.name); setView('builder'); setSelectedTemplate(null); showToast(`Loaded "${template.name}" to builder`, 'success'); }} />}

      {showPathModal && <PathSelectionModal onClose={() => { setShowPathModal(false); setPendingTemplateNodes(null); setPathModalSource(null); }} onConfirm={handlePathConfirm} />}

      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {confirmDelete && <Confirm message={confirmDelete.message} onConfirm={confirmDeleteTemplate} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

export default App;
