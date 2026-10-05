// Optional browser QA. Use an installed Playwright module or PW_PLAYWRIGHT_MODULE.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const origin = process.env.PW_PREVIEW_URL || 'http://127.0.0.1:4173';
try {
  await mkdir('test-artifacts', { recursive: true });
  await page.goto(origin);
  await page.getByRole('heading', { name: /风景在路上/ }).waitFor();
  await page.screenshot({ path: 'test-artifacts/home-desktop.png', fullPage: true });
  await page.getByRole('link', { name: '所有记录', exact: true }).click();
  await page.getByRole('button', { name: '语言与文化', exact: true }).click();
  assert.equal(await page.locator('.archive-grid .card').count(), 1);
  await page.getByRole('button', { name: '长文章', exact: true }).click();
  await page.getByText('这个筛选下暂时没有示例记录。').waitFor();
  await page.getByRole('button', { name: '全部', exact: true }).last().click();
  await page.getByRole('button', { name: '交通与地图', exact: true }).click();
  await page.getByRole('heading', { name: '在地图上，给一条慢路线留位置' }).click();
  await page.getByRole('button', { name: '较大', exact: true }).click();
  assert.ok(await page.locator('.article-body').evaluate(el => el.classList.contains('large')));
  await page.getByRole('link', { name: '夜鹿专题', exact: true }).click();
  for (const topic of ['听后感', '衍生小说', '圣地巡礼']) {
    await page.getByRole('button', { name: topic, exact: true }).click();
    assert.equal(await page.locator('.archive-grid .card').count(), 1);
  }
  await page.getByRole('link', { name: '记忆阁楼', exact: false }).click();
  await page.getByText('此原型尚无身份验证，也不是可用的私密空间。', { exact: true }).waitFor();
  await page.getByRole('link', { name: '查看虚构时间线演示', exact: false }).click();
  await page.getByLabel('事件', { exact: false }).selectOption('重逢');
  assert.equal(await page.locator('.memory').count(), 2);
  await page.getByLabel('日期', { exact: true }).fill('2026-09-12');
  assert.equal(await page.locator('.memory').count(), 1);
  await page.getByRole('button', { name: '清除筛选', exact: true }).click();
  assert.equal(await page.locator('.memory').count(), 3);
  await page.getByRole('link', { name: '管理演示', exact: false }).click();
  await page.getByLabel('示例标题', { exact: true }).fill('<script>测试标题</script>');
  await page.getByLabel('示例正文', { exact: true }).fill('测试文字 <img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: '暂存示例草稿', exact: true }).click();
  assert.equal(await page.locator('.draft').count(), 1);
  await page.getByRole('button', { name: '阅读预览', exact: true }).click();
  assert.equal(await page.locator('.preview-body img').count(), 0);
  await page.getByRole('button', { name: '返回管理演示', exact: false }).click();
  await page.getByRole('button', { name: '模拟公开发布', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '当前为私密状态演示' }).waitFor();
  assert.ok(page.url().endsWith('#/admin'));
  await page.getByLabel('可见范围（演示）', { exact: false }).selectOption('public');
  await page.getByRole('button', { name: '模拟公开发布', exact: true }).click();
  await page.getByRole('heading', { name: '<script>测试标题</script>', exact: true }).waitFor();
  assert.equal(await page.locator('.archive-grid script').count(), 0);
  await page.reload();
  assert.equal(await page.getByRole('heading', { name: '<script>测试标题</script>', exact: true }).count(), 0);
  await page.goto(origin + '/#/admin');
  await page.getByRole('heading', { name: '写下一点什么', exact: true }).waitFor();
  await page.getByLabel('测试照片 · 本地预览', { exact: true }).setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1cAAAAASUVORK5CYII=', 'base64') });
  await page.locator('.photo-preview img').waitFor();
  await page.getByRole('button', { name: '移除测试图片', exact: true }).click();
  assert.equal(await page.locator('.photo-preview img').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/archive', '/music', '/post/slow-route', '/private-demo', '/admin', '/about']) {
    await page.goto(origin + '/#' + route);
    await page.locator('main h1').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `mobile overflow: ${route}`);
    if (route === '/') await page.screenshot({ path: 'test-artifacts/home-mobile.png', fullPage: true });
    if (route === '/post/slow-route') await page.screenshot({ path: 'test-artifacts/article-mobile.png', fullPage: true });
  }
  await page.goto(origin + '/#/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.context().setOffline(true);
  await page.reload();
  await page.getByRole('heading', { name: /风景在路上/ }).waitFor();
  await page.context().setOffline(false);
  assert.deepEqual(errors, []);
  console.log('Browser QA passed: filters, reading size, topic, fictional timeline, draft/preview/publish, escaping, reset, photo preview, 7 mobile routes, public offline shell.');
} catch (error) {
  console.log('Page:', page.url(), 'Browser errors:', errors);
  await page.screenshot({ path: 'test-artifacts/failed-check.png', fullPage: true });
  throw error;
} finally { await browser.close(); }
