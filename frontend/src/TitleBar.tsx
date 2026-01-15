import { Flame, Sparkles } from 'lucide-react';

interface Props {
  mode: 'manual' | 'ai';
  onModeChange: (mode: 'manual' | 'ai') => void;
}

export default function TitleBar({ mode, onModeChange }: Props) {
  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <Flame className="fire-icon" size={16} strokeWidth={2} />
        <span className="title-text">Boil-it UI</span>
      </div>
      <div className="title-bar-mode">
        <button
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => onModeChange('manual')}
        >
          Manual
        </button>
        <button
          className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
          onClick={() => onModeChange('ai')}
        >
          <Sparkles size={14} style={{ marginRight: '4px' }} />
          AI
        </button>
      </div>
    </div>
  );
}
