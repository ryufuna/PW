import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../scripts/serve.mjs';
import { categories, posts, memories } from '../public/content.js';

test('preview serves public resources and refuses repository files and writes', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const resource of ['/', '/app.js', '/content.js', '/styles.css', '/manifest.webmanifest', '/sw.js', '/assets/map.svg', '/assets/landscape.svg', '/assets/icon.svg']) {
      const response = await fetch(origin + resource);
      assert.equal(response.status, 200, resource);
      assert.ok((await response.text()).length > 0);
    }
    for (const resource of ['/README.md', '/.git/config', '/.env', '/private/diary.json', '/..%5cREADME.md', '/%2e%2e%5c.git%5cconfig', '/missing.html']) {
      assert.equal((await fetch(origin + resource)).status, 404, resource);
    }
    assert.equal((await fetch(origin + '/', { method: 'POST', body: 'private data' })).status, 405);
    assert.equal((await fetch(origin + '/app.js', { method: 'HEAD' })).status, 200);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('content fixtures cover requested formats and music topic subdivisions', () => {
  assert.deepEqual([...new Set(posts.map(post => post.category))].sort(), [...categories].sort());
  assert.deepEqual([...new Set(posts.filter(post => post.category === '音乐').map(post => post.topic))].sort(), ['听后感', '圣地巡礼', '衍生小说'].sort());
  assert.ok(posts.some(post => post.type === '长文章'));
  assert.ok(posts.some(post => post.type === '短记'));
  assert.equal(new Set(posts.map(post => post.id)).size, posts.length);
  assert.ok(memories.every(item => item.text.includes('虚构')));
});
