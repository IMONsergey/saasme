import { Component, useEffect, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createDemo } from './demo';
import type { Workspace } from './domain';
import { loadWorkspace } from './storage';
import './styles.css';
import './legibility.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Workspace error:', error.message, info.componentStack); }
  render() { return this.state.error ? <div className="boot"><h1>Не удалось открыть экран</h1><p>Сохранённые данные остаются в этом браузере. Перезагрузите страницу.</p><button className="btn btn-primary" onClick={() => location.reload()}>Перезагрузить</button></div> : this.props.children; }
}
function Boot() {
  const [state, setState] = useState<Workspace>(); const [error, setError] = useState('');
  useEffect(() => { loadWorkspace().then(saved => setState(saved ?? createDemo())).catch(err => setError(String(err.message))); }, []);
  if (error) return <div className="boot"><span className="eyebrow">SAASME</span><h1>Хранилище недоступно</h1><p>{error}</p><p>Откройте приложение в обычном окне браузера с разрешённым локальным хранилищем.</p><button className="btn btn-primary" onClick={() => location.reload()}>Повторить</button></div>;
  if (!state) return <div className="boot"><span className="boot-mark">s.</span><p>Открываем пространство студии</p></div>;
  return <App initial={state}/>;
}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><Boot/></ErrorBoundary>);
