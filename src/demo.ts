import type { Project, Screen, Workspace, Issue } from './domain';
import { uid, now, fingerprint } from './domain';
const encode = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
export function demoScreen(theme: number, changed = false, mobile = false, page = 'Главная'): string {
  const palettes = [['#f4f1e9', '#252c26', '#b6c6ae'], ['#ef6d44', '#32241c', '#ead9b8'], ['#e7edf8', '#273857', '#a9b9dc'], ['#272b24', '#e7edd6', '#8c9f72']];
  const [bg, ink, accent] = palettes[theme % palettes.length];
  const names = ['NORMA', 'form.', 'MONO', 'FIELD'];
  const titles = [['Пространство', 'для жизни.'], ['Хороший день', 'начинается здесь.'], ['Меньше шума.', 'Больше смысла.'], ['Ближе', 'к настоящему.']];
  const w = mobile ? 390 : 1440, h = mobile ? 1100 : 1020;
  const head = mobile ? 35 : 70, x = mobile ? 26 : 94;
  const tx = changed ? x + (mobile ? 6 : 20) : x;
  const font = mobile ? 42 : 88;
  const artwork = theme % 2 === 0
    ? `<rect x="${mobile ? 26 : 835}" y="${mobile ? 520 : 185}" width="${mobile ? 338 : 500}" height="${mobile ? 330 : 550}" rx="${theme === 0 ? 170 : 26}" fill="${accent}"/><path d="M${mobile ? 108 : 970} ${mobile ? 795 : 680}v-170q0-110 100-110t100 110v170z" fill="${ink}" opacity=".83"/><circle cx="${mobile ? 194 : 1080}" cy="${mobile ? 660 : 460}" r="60" fill="${bg}"/><path d="M${mobile ? 50 : 840} ${mobile ? 810 : 720}h${mobile ? 285 : 470}" stroke="${ink}" stroke-width="2" opacity=".2"/>`
    : `<circle cx="${mobile ? 195 : 1090}" cy="${mobile ? 700 : 450}" r="${mobile ? 155 : 240}" fill="${accent}"/><rect x="${mobile ? 130 : 990}" y="${mobile ? 580 : 280}" width="${mobile ? 140 : 200}" height="${mobile ? 220 : 340}" rx="18" fill="${bg}" transform="rotate(12 ${mobile ? 195 : 1090} ${mobile ? 700 : 450})"/><text x="${mobile ? 168 : 1045}" y="${mobile ? 695 : 445}" fill="${ink}" font-size="${mobile ? 30 : 50}" font-weight="700" transform="rotate(12 ${mobile ? 195 : 1090} ${mobile ? 700 : 450})">${names[theme % 4]}</text>`;
  return encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><g font-family="Arial, sans-serif" fill="${ink}"><text x="${x}" y="${head}" font-size="${mobile ? 24 : 32}" font-weight="700" letter-spacing="-1">${names[theme % 4]}</text>${!mobile ? `<text x="580" y="70" font-size="17">Проекты</text><text x="710" y="70" font-size="17">О нас</text><text x="810" y="70" font-size="17">Контакты</text><rect x="1145" y="36" width="200" height="52" rx="26" fill="${ink}"/><text x="1177" y="68" font-size="15" fill="${bg}">Обсудить проект ↗</text>` : '<path d="M330 28h30m-30 8h30" stroke="currentColor" stroke-width="2"/>'}<path d="M${x} ${head + 35}H${w - x}" stroke="${ink}" opacity=".18"/><text x="${x}" y="${mobile ? 150 : 200}" font-size="${mobile ? 11 : 14}" letter-spacing="2">${page === 'Главная' ? 'НЕЗАВИСИМАЯ СТУДИЯ / 2026' : page.toUpperCase()}</text><text x="${tx}" y="${mobile ? 235 : 345}" font-size="${changed ? font + 3 : font}" letter-spacing="-3">${titles[theme % 4][0]}</text><text x="${tx}" y="${mobile ? 285 : 445}" font-size="${font}" letter-spacing="-3">${titles[theme % 4][1]}</text><text x="${x}" y="${mobile ? 340 : 515}" font-size="${mobile ? 14 : 20}" opacity=".7">Создаём вещи, которые остаются с вами.</text><text x="${x}" y="${mobile ? 366 : 546}" font-size="${mobile ? 14 : 20}" opacity=".7">Внимание к деталям. Свобода быть собой.</text><rect x="${x}" y="${mobile ? 410 : 600}" width="${changed ? 200 : 230}" height="${mobile ? 52 : 62}" rx="${changed ? 10 : 32}" fill="${ink}"/><text x="${x + 27}" y="${mobile ? 442 : 638}" font-size="${mobile ? 14 : 17}" fill="${bg}">Посмотреть проекты ↗</text>${artwork}<path d="M${x} ${mobile ? 905 : 830}H${w - x}" stroke="${ink}" opacity=".18"/><text x="${x}" y="${mobile ? 960 : 900}" font-size="${mobile ? 26 : 40}">Продумано до деталей.</text><text x="${x}" y="${mobile ? 1000 : 940}" font-size="${mobile ? 13 : 18}" opacity=".6">Материалы. Форма. Ощущения.</text></g></svg>`);
}
function screen(theme: number, name: string, path: string, viewport = 1440, accepted = false): Screen {
  const s: Screen = { id: uid(), name, path, viewport, reference: demoScreen(theme, false, viewport === 390, name), referenceId: uid(), versions: [{ id: uid(), name: 'Версия 1', image: demoScreen(theme, !accepted, viewport === 390, name), createdAt: '2026-10-26T10:00:00Z', width: viewport, height: viewport === 390 ? 1100 : 1020 }] };
  if (accepted) s.accepted = { versionId: s.versions[0].id, referenceId: s.referenceId, at: '2026-10-27T12:00:00Z', by: 'Сергей' };
  return s;
}
export function createDemo(): Workspace {
  const specs = [
    { name: 'NORMA — архитектурное бюро', client: 'NORMA', color: '#e5eadf', kind: 'website' as const, deadline: '2026-11-02', description: 'Корпоративный сайт архитектурного бюро. Проверяем типографику, сетку и мобильную версию перед запуском.' },
    { name: 'form. — кофейная культура', client: 'form.', color: '#f5d3be', kind: 'brand' as const, deadline: '2026-11-05', description: 'Визуальная система и цифровые носители локального кофейного бренда.' },
    { name: 'MONO — цифровой продукт', client: 'MONO', color: '#dbe4f4', kind: 'product' as const, deadline: '2026-11-08', description: 'Продуктовый сайт и ключевые экраны цифрового сервиса.' },
    { name: 'FIELD — естественный ритм', client: 'FIELD', color: '#e5e7d9', kind: 'website' as const, deadline: '2026-10-27', description: 'Имиджевый сайт и мобильная версия. Согласованная демонстрационная работа.' }
  ];
  const projects: Project[] = specs.map((p, i) => ({ ...p, id: `demo-${i}`, archived: false, createdAt: '2026-10-21T10:00:00Z', example: true, signoffs: [], screens: [screen(i, 'Главная', '/', 1440, i === 3), screen(i, i === 1 ? 'Носители' : 'О проекте', '/about', 1440, i !== 2), screen(i, 'Мобильная версия', '/', 390, i === 3)] }));
  projects[3].signoffs = [{ id: uid(), fingerprint: fingerprint(projects[3]), at: '2026-10-27T15:30:00Z', by: 'Анна, FIELD' }];
  const issues: Issue[] = [
    { p: 0, s: 0, title: 'Восстановить отступ заголовка', description: 'В реализации заголовок смещён вправо. Выровнять по левой направляющей макета.', x: 9, y: 32, priority: 'high', status: 'open', kind: 'fix' },
    { p: 0, s: 0, title: 'Скругление основной кнопки', description: 'В макете кнопка с полным скруглением. В реализации радиус заметно меньше.', x: 18, y: 62, priority: 'medium', status: 'review', kind: 'fix' },
    { p: 0, s: 2, title: 'Проверить перенос заголовка на мобильном', description: 'Сохранить два смысловых ряда на ширине 390 px.', x: 44, y: 24, priority: 'medium', status: 'progress', kind: 'fix' },
    { p: 1, s: 0, title: 'Добавить альтернативную обложку', description: 'Новый запрос клиента: вариант первого экрана без слогана. Оценить отдельно.', x: 24, y: 36, priority: 'low', status: 'open', kind: 'change' },
    { p: 2, s: 0, title: 'Уточнить ширину кнопки', description: 'Использовать значение из утверждённого макета.', x: 16, y: 62, priority: 'medium', status: 'review', kind: 'fix' }
  ].map((i, index) => ({ id: `issue-${index}`, projectId: projects[i.p].id, screenId: projects[i.p].screens[i.s].id, versionId: projects[i.p].screens[i.s].versions[0].id, title: i.title, description: i.description, x: i.x, y: i.y, priority: i.priority as Issue['priority'], status: i.status as Issue['status'], kind: i.kind as Issue['kind'], assignee: index % 2 ? 'Разработчик' : 'Дизайнер', createdAt: '2026-10-28T09:00:00Z', comments: index === 1 ? [{ id: uid(), author: 'Разработчик', body: 'Подготовил исправление. Загружу новый экран для повторной проверки.', at: '2026-10-28T10:00:00Z' }] : [] }));
  return { schema: 1, studio: "I’MON Studio", person: 'Сергей', projects, issues, activity: [
    { id: uid(), projectId: projects[0].id, text: 'Скругление кнопки передано на повторную проверку', type: 'issue', at: '2026-10-28T10:10:00Z' },
    { id: uid(), projectId: projects[3].id, text: 'Анна подтвердила сдачу проекта FIELD', type: 'approval', at: '2026-10-27T15:30:00Z' },
    { id: uid(), projectId: projects[1].id, text: 'Добавлен запрос на альтернативную обложку', type: 'issue', at: '2026-10-27T12:00:00Z' },
    { id: uid(), projectId: projects[0].id, text: 'Принят экран «О проекте»', type: 'approval', at: '2026-10-27T11:00:00Z' }
  ] };
}
export const emptyWorkspace = (): Workspace => ({ schema: 1, studio: 'Моя студия', person: 'Дизайнер', projects: [], issues: [], activity: [] });
export const demoCreatedAt = now;
