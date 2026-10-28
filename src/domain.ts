export type IssueStatus = 'open' | 'progress' | 'review' | 'resolved';
export type Priority = 'high' | 'medium' | 'low';
export type ProjectKind = 'website' | 'brand' | 'product';
export interface Version { id: string; name: string; image: string; createdAt: string; width: number; height: number }
export interface Screen { id: string; name: string; path: string; viewport: number; reference: string; referenceId: string; versions: Version[]; accepted?: { versionId: string; referenceId: string; at: string; by: string } }
export interface Signoff { id: string; fingerprint: string; at: string; by: string }
export interface Project { id: string; name: string; client: string; description: string; color: string; kind: ProjectKind; deadline: string; archived: boolean; screens: Screen[]; signoffs: Signoff[]; createdAt: string; example: boolean }
export interface Comment { id: string; body: string; author: string; at: string }
export interface Issue { id: string; projectId: string; screenId: string; versionId: string; title: string; description: string; x: number; y: number; status: IssueStatus; priority: Priority; kind: 'fix' | 'change'; assignee: string; createdAt: string; comments: Comment[] }
export interface Activity { id: string; projectId: string; text: string; at: string; type: 'project' | 'issue' | 'version' | 'approval' }
export interface Workspace { schema: 1; studio: string; person: string; projects: Project[]; issues: Issue[]; activity: Activity[] }
export type Update = (recipe: (state: Workspace) => Workspace) => void;
export const statusLabels: Record<IssueStatus, string> = { open: 'Открыто', progress: 'В работе', review: 'На проверке', resolved: 'Готово' };
export const priorityLabels: Record<Priority, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
export const kindLabels: Record<ProjectKind, string> = { website: 'Веб-сайт', brand: 'Айдентика', product: 'Интерфейс' };
export const uid = () => globalThis.crypto.randomUUID();
export const now = () => new Date().toISOString();
export const currentVersion = (screen: Screen) => screen.versions.at(-1);
export const issuesFor = (state: Workspace, projectId: string, screenId?: string) => state.issues.filter(i => i.projectId === projectId && (!screenId || i.screenId === screenId));
export const pendingFor = (state: Workspace, projectId: string, screenId?: string) => issuesFor(state, projectId, screenId).filter(i => i.status !== 'resolved');
export function isAccepted(screen: Screen): boolean { return !!screen.accepted && !!screen.reference && screen.accepted.referenceId === screen.referenceId && screen.accepted.versionId === currentVersion(screen)?.id; }
export function readiness(project: Project): number { return project.screens.length ? Math.round(project.screens.filter(isAccepted).length / project.screens.length * 100) : 0; }
export function fingerprint(project: Project): string { return JSON.stringify(project.screens.map(s => [s.id, s.referenceId, currentVersion(s)?.id, s.accepted?.at])); }
export function canSign(state: Workspace, project: Project): boolean { return project.screens.length > 0 && project.screens.every(isAccepted) && pendingFor(state, project.id).length === 0; }
export function isSigned(state: Workspace, project: Project): boolean { return canSign(state, project) && project.signoffs.at(-1)?.fingerprint === fingerprint(project); }
export function projectStatus(state: Workspace, project: Project): { label: string; tone: string } {
  if (project.archived) return { label: 'В архиве', tone: 'gray' };
  if (isSigned(state, project)) return { label: 'Сдан', tone: 'green' };
  if (canSign(state, project)) return { label: 'К сдаче', tone: 'green' };
  if (pendingFor(state, project.id).length) return { label: 'Есть правки', tone: 'orange' };
  return { label: 'На проверке', tone: 'blue' };
}
export function log(state: Workspace, projectId: string, text: string, type: Activity['type']): Workspace {
  return { ...state, activity: [{ id: uid(), projectId, text, type, at: now() }, ...state.activity].slice(0, 200) };
}
export function editProject(state: Workspace, id: string, recipe: (p: Project) => Project): Workspace {
  return { ...state, projects: state.projects.map(p => p.id === id ? recipe(p) : p) };
}
export function editScreen(state: Workspace, projectId: string, screenId: string, recipe: (s: Screen) => Screen): Workspace {
  return editProject(state, projectId, p => ({ ...p, screens: p.screens.map(s => s.id === screenId ? recipe(s) : s) }));
}
export function addIssue(state: Workspace, issue: Issue): Workspace {
  const project = state.projects.find(p => p.id === issue.projectId);
  const screen = project?.screens.find(s => s.id === issue.screenId);
  if (!screen || !screen.versions.some(v => v.id === issue.versionId)) throw new Error('Экран или версия не найдены.');
  if (!issue.title.trim()) throw new Error('Укажите заголовок замечания.');
  const next = editScreen({ ...state, issues: [...state.issues, { ...issue, x: Math.max(0, Math.min(100, issue.x)), y: Math.max(0, Math.min(100, issue.y)) }] }, issue.projectId, issue.screenId, s => ({ ...s, accepted: undefined }));
  return log(next, issue.projectId, `Добавлено замечание «${issue.title}»`, 'issue');
}
export function setIssueStatus(state: Workspace, id: string, status: IssueStatus): Workspace {
  const issue = state.issues.find(i => i.id === id);
  if (!issue) return state;
  let next = { ...state, issues: state.issues.map(i => i.id === id ? { ...i, status } : i) };
  if (status !== 'resolved') next = editScreen(next, issue.projectId, issue.screenId, s => ({ ...s, accepted: undefined }));
  return log(next, issue.projectId, `«${issue.title}» → ${statusLabels[status]}`, 'issue');
}
export function acceptScreen(state: Workspace, projectId: string, screenId: string): Workspace {
  const screen = state.projects.find(p => p.id === projectId)?.screens.find(s => s.id === screenId);
  if (!screen?.reference || !currentVersion(screen)) throw new Error('Сначала загрузите макет и реализацию.');
  if (pendingFor(state, projectId, screenId).length) throw new Error('Сначала закройте все замечания этого экрана.');
  return log(editScreen(state, projectId, screenId, s => ({ ...s, accepted: { versionId: currentVersion(s)!.id, referenceId: s.referenceId, at: now(), by: state.person } })), projectId, `Принят экран «${screen.name}»`, 'approval');
}
export function addVersion(state: Workspace, projectId: string, screenId: string, version: Version): Workspace {
  const next = editScreen(state, projectId, screenId, s => ({ ...s, versions: [...s.versions, version], accepted: undefined }));
  return log(next, projectId, `Загружена версия «${version.name}»`, 'version');
}
export function signProject(state: Workspace, id: string, by: string): Workspace {
  const project = state.projects.find(p => p.id === id);
  if (!project || !canSign(state, project)) throw new Error('Для сдачи примите все экраны и закройте замечания.');
  if (!by.trim()) throw new Error('Укажите имя согласующего.');
  if (isSigned(state, project)) return state;
  return log(editProject(state, id, p => ({ ...p, signoffs: [...p.signoffs, { id: uid(), fingerprint: fingerprint(p), at: now(), by: by.trim() }] })), id, `${by.trim()} подтвердил сдачу проекта`, 'approval');
}
export function createProject(name: string, client: string, kind: ProjectKind, deadline: string): Project {
  return { id: uid(), name: name.trim(), client: client.trim(), kind, deadline, description: '', color: '#e5e9de', archived: false, screens: [], signoffs: [], createdAt: now(), example: false };
}
export function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
export function dateLabel(value: string): string { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(value)); }
export function safeUrl(value: string): string { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
