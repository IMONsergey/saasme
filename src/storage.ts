import type { Workspace } from './domain';
const DB_NAME = 'saasme-workspace';
const STORE = 'snapshots';
let connection: Promise<IDBDatabase> | undefined;
function db(): Promise<IDBDatabase> {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { connection = undefined; reject(new Error('Хранилище браузера недоступно. Экспортируйте данные перед закрытием.')); };
  });
  return connection;
}
export async function loadWorkspace(): Promise<Workspace | undefined> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, 'readonly').objectStore(STORE).get('workspace');
    request.onsuccess = () => {
      if (request.result === undefined) resolve(undefined);
      else if (validWorkspace(request.result)) resolve(request.result);
      else reject(new Error('Сохранённые данные имеют неподдерживаемый формат. Они не перезаписаны.'));
    };
    request.onerror = () => reject(request.error);
  });
}
let queue: Promise<void> = Promise.resolve();
export function saveWorkspace(workspace: Workspace): Promise<void> {
  queue = queue.catch(() => undefined).then(async () => {
    const database = await db();
    return new Promise<void>((resolve, reject) => {
      const tx = database.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(workspace, 'workspace');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Не удалось сохранить изменения: проверьте свободное место в браузере.'));
      tx.onabort = () => reject(new Error('Сохранение прервано. Экспортируйте резервную копию.'));
    });
  });
  return queue;
}
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const text = (v: unknown) => typeof v === 'string';
const image = (v: unknown) => text(v) && (v === '' || /^data:image\/(png|jpeg|webp|svg\+xml)[;,]/.test(v as string));
export function validWorkspace(value: unknown): value is Workspace {
  if (!record(value) || value.schema !== 1 || !text(value.studio) || !text(value.person) || !Array.isArray(value.projects) || !Array.isArray(value.issues) || !Array.isArray(value.activity)) return false;
  const ids = new Set<string>();
  for (const p of value.projects) {
    if (!record(p) || !text(p.id) || ids.has(p.id as string) || !text(p.name) || !text(p.client) || !text(p.description) || !text(p.color) || !['website', 'brand', 'product'].includes(p.kind as string) || typeof p.archived !== 'boolean' || !text(p.deadline) || !text(p.createdAt) || !Array.isArray(p.screens) || !Array.isArray(p.signoffs)) return false;
    ids.add(p.id as string);
    for (const s of p.screens) {
      if (!record(s) || !text(s.id) || !text(s.name) || !text(s.path) || !image(s.reference) || !text(s.referenceId) || typeof s.viewport !== 'number' || !Number.isFinite(s.viewport) || !Array.isArray(s.versions)) return false;
      if (!s.versions.every(v => record(v) && text(v.id) && text(v.name) && image(v.image) && text(v.createdAt) && Number.isFinite(v.width) && Number.isFinite(v.height))) return false;
      if (s.accepted && (!record(s.accepted) || !text(s.accepted.versionId) || !text(s.accepted.referenceId) || !text(s.accepted.by) || !text(s.accepted.at))) return false;
    }
    if (!p.signoffs.every(a => record(a) && text(a.id) && text(a.fingerprint) && text(a.by) && text(a.at))) return false;
  }
  for (const i of value.issues) {
    if (!record(i) || !text(i.id) || !text(i.title) || !text(i.description) || !ids.has(i.projectId as string) || !text(i.screenId) || !text(i.versionId) || !Number.isFinite(i.x) || !Number.isFinite(i.y) || !['open', 'progress', 'review', 'resolved'].includes(i.status as string) || !['high', 'medium', 'low'].includes(i.priority as string) || !['fix', 'change'].includes(i.kind as string) || !text(i.assignee) || !text(i.createdAt) || !Array.isArray(i.comments) || !i.comments.every(c => record(c) && text(c.id) && text(c.body) && text(c.author) && text(c.at))) return false;
    const p = value.projects.find(p => p.id === i.projectId);
    const s = p?.screens.find((s: { id: string }) => s.id === i.screenId);
    if (!s || !s.versions.some((v: { id: string }) => v.id === i.versionId)) return false;
  }
  return value.activity.every(a => record(a) && text(a.id) && text(a.projectId) && text(a.text) && text(a.at) && ['project', 'issue', 'version', 'approval'].includes(a.type as string));
}
export interface LoadedImage { data: string; width: number; height: number; name: string; bytes: number }
export function readImage(file: File): Promise<LoadedImage> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return Promise.reject(new Error('Поддерживаются PNG, JPG и WebP.'));
  if (file.size > 12 * 1024 * 1024) return Promise.reject(new Error('Максимальный размер изображения — 12 МБ.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.onload = () => {
      const data = String(reader.result);
      const img = new Image();
      img.onload = () => {
        if (img.width * img.height > 40_000_000) reject(new Error('Изображение слишком большое. Максимум — 40 мегапикселей.'));
        else resolve({ data, width: img.width, height: img.height, name: file.name, bytes: file.size });
      };
      img.onerror = () => reject(new Error('Файл не является корректным изображением.'));
      img.src = data;
    };
    reader.readAsDataURL(file);
  });
}
export function download(name: string, body: string, type: string): void {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
