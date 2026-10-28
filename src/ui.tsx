import { useEffect, useId, useRef } from 'react';
import type { ReactNode, ButtonHTMLAttributes, FormEvent } from 'react';
import type { Issue, Project, Workspace } from './domain';
import { currentVersion, dateLabel, priorityLabels, projectStatus, statusLabels } from './domain';
export type IconName = 'grid' | 'folder' | 'check' | 'message' | 'tool' | 'settings' | 'search' | 'plus' | 'arrow' | 'chevron' | 'close' | 'clock' | 'upload' | 'download' | 'monitor' | 'mobile' | 'layers' | 'link' | 'external' | 'list' | 'bell' | 'help' | 'eye' | 'menu' | 'archive' | 'flag' | 'back' | 'compare' | 'pin' | 'undo' | 'file' | 'spark' | 'lock';
const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>,
  check: <path d="m5 12 4 4L19 6"/>, message: <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9z"/>,
  tool: <><rect x="3" y="4" width="7" height="7" rx="2"/><circle cx="17.5" cy="7.5" r="3.5"/><path d="m6.5 14 4 7h-8l4-7zM14 15h7m-3.5-3.5v7"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>, chevron: <path d="m9 5 7 7-7 7"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/></>, download: <path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></>, mobile: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>,
  layers: <><path d="m12 2 10 5-10 5L2 7l10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/></>,
  link: <><path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -2)"/></>,
  external: <path d="M14 3h7v7m-9 2 9-9M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>,
  list: <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1"/></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>, archive: <><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8M10 12h4"/></>,
  flag: <path d="M5 22V3h14l-3 5 3 5H5"/>, back: <path d="M19 12H5m6-6-6 6 6 6"/>,
  compare: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 1v22M7 9v6M17 9v6"/></>,
  pin: <><path d="m14 3 7 7-4 1-4 4-1 4-7-7 4-1 4-4 1-4zM8 16l-5 5"/></>,
  undo: <path d="M3 10h12a6 6 0 0 1 0 12M3 10l5-5m-5 5 5 5"/>, file: <><path d="M14 2H5v20h14V7l-5-5zM14 2v6h5M8 13h8M8 17h6"/></>,
  spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"/>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>
};
export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function Logo({ small = false }: { small?: boolean }) {
  return <span className={`logo ${small ? 'small' : ''}`}><span className="logo-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M9 11h23L22 20h10L8 32l10-12H9z" fill="currentColor"/></svg></span>{!small && <span>saasme<span className="logo-dot">.</span></span>}</span>;
}
export function Button({ children, icon, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; children?: ReactNode }) {
  return <button className={`btn btn-${variant} ${className}`} type="button" {...props}>{icon && <Icon name={icon}/ >}{children}</button>;
}
export function IconButton({ icon, label, onClick, className = '', disabled = false }: { icon: IconName; label: string; onClick: () => void; className?: string; disabled?: boolean }) {
  return <button type="button" className={`icon-btn ${className}`} title={label} aria-label={label} onClick={onClick} disabled={disabled}><Icon name={icon}/></button>;
}
export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}><i/>{children}</span>; }
export function ProjectBadge({ project, state }: { project: Project; state: Workspace }) { const s = projectStatus(state, project); return <Badge tone={s.tone}>{s.label}</Badge>; }
export function IssueBadge({ issue }: { issue: Issue }) { return <Badge tone={{ open: 'orange', progress: 'blue', review: 'purple', resolved: 'green' }[issue.status]}>{statusLabels[issue.status]}</Badge>; }
export function PriorityMark({ value }: { value: Issue['priority'] }) { return <span className={`priority priority-${value}`} title={`${priorityLabels[value]} приоритет`} aria-label={`${priorityLabels[value]} приоритет`}><i/><i/><i/></span>; }
export function Empty({ title, text, icon = 'folder', action }: { title: string; text: string; icon?: IconName; action?: ReactNode }) { return <div className="empty"><span className="empty-icon"><Icon name={icon} size={28}/></span><h3>{title}</h3><p>{text}</p>{action}</div>; }
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const id = useId(); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const focusable = () => [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea,select,a[href],[tabindex="0"]') ?? [])].filter(el => el.offsetParent !== null);
    const timer = setTimeout(() => { const first = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? focusable()[0]; first?.focus(); }, 10);
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab') { const els = focusable(), first = els[0], last = els.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    }
    document.addEventListener('keydown', key);
    return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className={`modal ${wide ? 'modal-wide' : ''}`}><header><h2 id={id}>{title}</h2><IconButton icon="close" label="Закрыть окно" onClick={onClose}/></header><div className="modal-body">{children}</div></div></div>;
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
export function PageHeader({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: ReactNode }) { return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>{action && <div className="heading-actions">{action}</div>}</div>; }
export function ProjectCover({ project, compact = false }: { project: Project; compact?: boolean }) {
  const image = project.screens[0]?.reference || (project.screens[0] && currentVersion(project.screens[0])?.image);
  return <div className={`project-cover ${compact ? 'compact' : ''}`} style={{ backgroundColor: project.color }}>{image ? <div className="cover-browser"><div className="cover-dots"><i/><i/><i/><span>{project.client || project.name}</span></div><img src={image} alt={`Превью проекта ${project.name}`} loading="lazy"/></div> : <span className="cover-placeholder">{project.name.slice(0, 2).toUpperCase()}<span>новая история</span></span>}<span className="cover-label">{project.example ? 'Пример проекта' : 'Проект студии'}</span></div>;
}
export function Avatar({ name, small = false }: { name: string; small?: boolean }) { return <span className={`avatar ${small ? 'avatar-small' : ''}`} title={name}>{name.slice(0, 1)}</span>; }
export function ActivityList({ state, projectId, limit = 6 }: { state: Workspace; projectId?: string; limit?: number }) {
  const entries = state.activity.filter(a => !projectId || a.projectId === projectId).slice(0, limit);
  return entries.length ? <div className="activity-list">{entries.map(a => <div className="activity-item" key={a.id}><span className={`activity-icon ${a.type === 'approval' ? 'approved' : ''}`}><Icon name={a.type === 'approval' ? 'check' : a.type === 'version' ? 'layers' : 'message'} size={15}/></span><div><p>{a.text}</p><small>{state.projects.find(p => p.id === a.projectId)?.client ?? 'Студия'} · {dateLabel(a.at)}</small></div></div>)}</div> : <p className="muted padded">Здесь появятся действия команды.</p>;
}
export function SubmitForm({ children, onSubmit, className }: { children: ReactNode; onSubmit: (data: FormData) => void; className?: string }) {
  return <form className={className} onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>{children}</form>;
}
