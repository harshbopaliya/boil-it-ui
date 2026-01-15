import { useState } from 'react';
import { X, Sparkles, Settings } from 'lucide-react';
import * as api from './api';

interface Props {
    onClose: () => void;
    onGenerated: (name: string, nodes: any[]) => void;
}

export default function AIModal({ onClose, onGenerated }: Props) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<'openai' | 'ollama'>('openai');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('openai-key') || import.meta.env.VITE_OPENAI_API_KEY || '');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [showSettings, setShowSettings] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            if (provider === 'openai' && openaiKey) {
                localStorage.setItem('openai-key', openaiKey);
            }

            const result = await api.generateAIStructure({
                prompt: prompt.trim(),
                provider,
                model,
                openai_key: openaiKey,
                ollama_url: ollamaUrl,
            });

            onGenerated(result.name, result.nodes);
        } catch (error: any) {
            alert(error.message || 'Failed to generate structure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal ai-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="text-primary" />
                        <h2 className="modal-title">AI Scaffold Generator</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
                            <Settings size={16} />
                        </button>
                        <button onClick={onClose} className="icon-btn">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="modal-body">
                    {showSettings && (
                        <div className="settings-panel" style={{ background: '#f0f0f0', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                            <div className="field-group">
                                <label className="field-label">Provider</label>
                                <select
                                    value={provider}
                                    onChange={(e: any) => {
                                        setProvider(e.target.value);
                                        if (e.target.value === 'ollama') setModel(import.meta.env.VITE_OLLAMA_MODEL || 'llama3');
                                        else setModel('gpt-3.5-turbo');
                                    }}
                                    className="text-input"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="ollama">Ollama (Local)</option>
                                </select>
                            </div>

                            {provider === 'openai' ? (
                                <>
                                    <div className="field-group">
                                        <label className="field-label">API Key</label>
                                        <input
                                            type="password"
                                            value={openaiKey}
                                            onChange={(e) => setOpenaiKey(e.target.value)}
                                            placeholder="sk-..."
                                            className="text-input"
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Model</label>
                                        <input
                                            type="text"
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            placeholder="gpt-3.5-turbo"
                                            className="text-input"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="field-group">
                                        <label className="field-label">Ollama URL</label>
                                        <input
                                            type="text"
                                            value={ollamaUrl}
                                            onChange={(e) => setOllamaUrl(e.target.value)}
                                            className="text-input"
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Model</label>
                                        <input
                                            type="text"
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            placeholder="llama3"
                                            className="text-input"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="field-group">
                        <label className="field-label">What are you building?</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="text-input"
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder="e.g. A React app with TypeScript, Tailwind, and a components folder containing a Button and Input file..."
                            autoFocus
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="secondary-btn" disabled={loading}>Cancel</button>
                    <button
                        onClick={handleGenerate}
                        className="primary-btn"
                        disabled={loading || !prompt.trim() || (provider === 'openai' && !openaiKey)}
                    >
                        {loading ? 'Generating...' : 'Generate Scaffold'}
                    </button>
                </div>
            </div>
        </div>
    );
}
