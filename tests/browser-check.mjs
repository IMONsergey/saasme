import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://127.0.0.1:4184';
const out = process.env.QA_OUTPUT || 'test-results/browser';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = [];
async function step(name, run) { await run(); results.push(name); console.log('PASS', name); }
async function screenshot(name) { await page.screenshot({ path: `${out}/${name}.png`, fullPage: true }); }
async function clickButton(name) { await page.getByRole('button', { name, exact: true }).last().click(); }
async function saved() { await page.getByText('Сохранено в этом браузере', { exact: true }).waitFor(); }
try {
  await page.goto(base);
  await page.getByRole('heading', { name: 'Всё под контролем.' }).waitFor();
  const data = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 900; const c = canvas.getContext('2d'); c.fillStyle = '#f1efe7'; c.fillRect(0, 0, 1200, 900); c.fillStyle = '#293229'; c.font = '54px sans-serif'; c.fillText('QA / Studio website', 75, 170); c.fillStyle = '#b9c6ab'; c.fillRect(75, 250, 1050, 480); return canvas.toDataURL('image/png').split(',')[1]; });
  const fixture = `${out}/reference.png`; await fs.writeFile(fixture, Buffer.from(data, 'base64'));
  const fixture2 = `${out}/duplicate.png`; await fs.copyFile(fixture, fixture2);
  await step('Desktop overview, navigation and search', async () => {
    expect(await page.locator('.project-card').count()).toBe(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder('Проекты, клиенты, замечания…').fill('MONO');
    await page.locator('.command-results').getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: 'MONO — цифровой продукт' })).toBeVisible();
    await page.goto(base + '/#/projects');
    await page.getByRole('tab', { name: 'Сданные', exact: true }).click();
    await expect(page.locator('.project-card')).toHaveCount(1);
    await clickButton('Список проектов');
    await expect(page.locator('.project-table-row')).toHaveCount(1);
  });
  await step('Create project and upload real PNG screens', async () => {
    await clickButton('Новый проект');
    await page.getByLabel('Название проекта', { exact: true }).fill('QA Acceptance');
    await page.getByLabel('Клиент', { exact: true }).fill('QA Studio');
    await clickButton('Создать проект');
    await expect(page.getByRole('heading', { name: 'QA Acceptance' })).toBeVisible();
    await clickButton('Добавить первый экран');
    await page.getByLabel('Название экрана').fill('QA Main');
    await page.getByLabel('Утверждённый макет', { exact: true }).setInputFiles(fixture);
    await page.getByLabel('Реализация — первая версия').setInputFiles(fixture);
    await page.getByRole('dialog').getByRole('button', { name: 'Добавить экран', exact: true }).click();
    await expect(page.getByText('Локальное сравнение изображений')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Принять экран', exact: true })).toBeEnabled();
  });
  const reviewUrl = page.url();
  const parts = reviewUrl.split('#/review/')[1].split('/');
  const projectUrl = `${base}/#/project/${parts[0]}`;
  const clientUrl = `${base}/#/client/${parts[0]}`;
  await step('All comparison modes and annotation creation', async () => {
    await clickButton('Шторка');
    await page.getByRole('slider', { name: 'Положение шторки' }).fill('70');
    await expect(page.locator('.curtain-line')).toHaveCSS('left', /.+px/);
    await clickButton('Наложение');
    await page.getByRole('slider', { name: 'Прозрачность макета' }).fill('35');
    await expect(page.locator('.overlay-image')).toHaveCSS('opacity', '0.35');
    await clickButton('Разница');
    await expect(page.locator('.difference-image')).toHaveCSS('mix-blend-mode', 'difference');
    await clickButton('Рядом');
    await page.getByLabel('Масштаб просмотра').selectOption('125');
    await page.getByLabel('Масштаб просмотра').selectOption('100');
    await page.locator('.image-stage.clickable').click({ position: { x: 80, y: 80 } });
    await page.getByLabel('Что нужно исправить').fill('Исправить отступ');
    await page.getByLabel('Описание', { exact: true }).fill('Выровнять заголовок по сетке.');
    await page.getByRole('dialog').getByRole('button', { name: 'Добавить замечание', exact: true }).click();
    await expect(page.locator('.annotation-pin')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Принять экран', exact: true })).toBeDisabled();
  });
  await step('Issue comments, status and revision history', async () => {
    await page.locator('.review-issue-card').click();
    await page.getByRole('textbox', { name: 'Комментарий', exact: true }).fill('Проверено на тестовом экране.');
    await clickButton('Отправить комментарий');
    await expect(page.locator('.comment')).toContainText('Проверено на тестовом экране.');
    await page.getByLabel('Статус замечания').selectOption('review');
    await clickButton('Закрыть окно');
    await clickButton('Новая версия');
    await page.getByLabel('Обновлённый экран').setInputFiles(fixture);
    await clickButton('Загрузить версию');
    await expect(page.getByLabel('Версия реализации')).toContainText('Версия 2');
    await expect(page.getByRole('button', { name: 'Принять экран', exact: true })).toBeDisabled();
    await page.locator('.review-issue-card').click();
    await page.getByLabel('Статус замечания').selectOption('resolved');
    await clickButton('Закрыть окно');
    await clickButton('Принять экран');
    await expect(page.getByText('Экран принят', { exact: true })).toBeVisible();
    await clickButton('Новая версия');
    await page.getByLabel('Обновлённый экран').setInputFiles(fixture);
    await clickButton('Загрузить версию');
    await expect(page.getByRole('button', { name: 'Принять экран', exact: true })).toBeEnabled();
    await expect(page.getByText('Экран принят', { exact: true })).toHaveCount(0);
    await clickButton('Принять экран');
  });
  await step('Client signoff, portable report and change request', async () => {
    await page.goto(clientUrl);
    await clickButton('Подтвердить результат');
    await page.getByLabel('Ваше имя', { exact: true }).fill('QA Client');
    await page.getByRole('checkbox').check();
    await page.getByRole('dialog').getByRole('button', { name: 'Подтвердить', exact: true }).click();
    await expect(page.getByText('Результат подтверждён', { exact: true })).toBeVisible();
    const download = page.waitForEvent('download'); await clickButton('Скачать отчёт');
    const report = await download; await report.saveAs(`${out}/report.html`);
    const html = await fs.readFile(`${out}/report.html`, 'utf8'); expect(html).toContain('QA Client'); expect(html).toContain('Версия 3'); expect(html).toContain('Сдача подтверждена');
    await clickButton('Вернуть на доработку');
    await page.getByLabel('Что нужно изменить').fill('Проверить мобильный отступ');
    await page.getByLabel('Подробности').fill('Новый запрос после согласования.');
    await clickButton('Отправить на доработку');
    await expect(page.getByText('Результат подтверждён', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Подтвердить результат', exact: true })).toBeDisabled();
  });
  await step('IndexedDB persistence and JSON backup restore', async () => {
    await page.goto(projectUrl); await saved(); await page.reload();
    await expect(page.getByRole('heading', { name: 'QA Acceptance' })).toBeVisible();
    await expect(page.locator('.screen-card')).toHaveCount(1);
    await page.goto(base + '/#/settings');
    const dl = page.waitForEvent('download'); await clickButton('Экспортировать пространство');
    const backup = await dl; await backup.saveAs(`${out}/backup.json`);
    const data = JSON.parse(await fs.readFile(`${out}/backup.json`, 'utf8'));
    expect(data.projects.some(p => p.name === 'QA Acceptance')).toBe(true);
    expect(data.issues.some(i => i.title === 'Исправить отступ' && i.comments.length === 1)).toBe(true);
    data.studio = 'QA Restored Studio'; await fs.writeFile(`${out}/restore.json`, JSON.stringify(data));
    await page.locator('input[type=file]').setInputFiles(`${out}/restore.json`);
    await page.getByRole('dialog').getByRole('button', { name: 'Восстановить', exact: true }).click();
    await saved(); await page.reload();
    await expect(page.getByLabel('Название студии')).toHaveValue('QA Restored Studio');
    await fs.writeFile(`${out}/invalid.json`, '{"schema":1,"studio":"invalid"}');
    await page.locator('input[type=file]').setInputFiles(`${out}/invalid.json`);
    await expect(page.getByRole('status')).toContainText('Формат резервной копии не поддерживается');
    await expect(page.getByLabel('Название студии')).toHaveValue('QA Restored Studio');
  });
  await step('Asset preflight dimensions, duplicates and CSV export', async () => {
    await page.goto(base + '/#/tools/preflight');
    await page.getByLabel('Ширина, px').fill('1080');
    await page.getByLabel('Ожидаемое количество файлов').fill('3');
    await page.locator('input[type=file]').setInputFiles([fixture, fixture2]);
    await expect(page.locator('.file-result')).toHaveCount(2);
    await expect(page.locator('.file-result').last()).toContainText('Идентичный файл');
    await expect(page.locator('.warning-notice')).toContainText('Ожидалось 3');
    const dl = page.waitForEvent('download'); await clickButton('Скачать CSV');
    const report = await dl; await report.saveAs(`${out}/preflight.csv`);
    expect(await fs.readFile(`${out}/preflight.csv`, 'utf8')).toContain('Ширина 1200 вместо 1080');
  });
  await step('Case outline Markdown export', async () => {
    await page.goto(base + '/#/tools/case');
    await page.getByLabel('Проект', { exact: true }).selectOption(parts[0]);
    await page.getByLabel('Решение', { exact: true }).fill('Согласованный процесс проверки.');
    await page.getByLabel('Подтверждённый результат').fill('Одна проверенная версия.');
    const dl = page.waitForEvent('download'); await clickButton('Скачать Markdown');
    const report = await dl; await report.saveAs(`${out}/case.md`);
    expect(await fs.readFile(`${out}/case.md`, 'utf8')).toContain('Одна проверенная версия.');
  });
  await step('Mobile routes, menu and layout at 390px', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/', '/projects', '/issues', '/tools', '/tools/preflight', '/tools/case', '/settings', '/activity', `/project/${parts[0]}`, `/review/${parts[0]}/${parts[1]}`, `/client/${parts[0]}`]) {
      await page.goto(base + '/#' + route); await page.locator('main').first().waitFor();
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, `Overflow on ${route}`).toBeLessThanOrEqual(391);
    }
    await page.goto(base); await page.getByRole('heading', { name: 'Всё под контролем.' }).waitFor();
    await clickButton('Открыть меню');
    await page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('link', { name: 'Проекты', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Проекты', exact: true })).toBeVisible();
    await expect(page.locator('.sidebar-open')).toHaveCount(0);
    await page.goto(reviewUrl); await page.getByText('Локальное сравнение изображений').waitFor();
    await screenshot('review-mobile');
  });
  expect(errors).toEqual([]);
  await fs.writeFile(`${out}/results.json`, JSON.stringify({ passed: results, browserErrors: errors, base }, null, 2));
  console.log('ALL PASSED', results.length, 'browser errors:', errors.length);
} catch (error) { await screenshot('failure'); console.error(error); console.log('BROWSER ERRORS', errors); process.exitCode = 1; }
finally { await browser.close(); }
