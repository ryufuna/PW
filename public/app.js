import { categories, posts, memories } from './content.js';

const main = document.querySelector('#main');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const example = '<span class="example">示例</span>';
const categoryUrl = category => '#/category/' + encodeURIComponent(category);
let archiveCategory = '全部', archiveType = '全部', topic = '全部';
let memoryFilters = { date: '', event: '', person: '' };
let draftState = null, drafts = [], simulatedPosts = [], uploadedPhoto = null, toastTimer;
const allPosts = () => [...simulatedPosts, ...posts];
function meta(post) { return `<div class="meta"><span>${escape(post.category)}</span><span>· ${escape(post.type)}</span><time datetime="${escape(post.date)}">${escape(post.date)}</time>${example}</div>`; }
function cover(post) {
  return post.image ? `<img src="./assets/${post.image}.svg" alt="${post.image === 'map' ? '虚构线路示意地图，非真实地理数据' : '水边山景原创插画，非创建者实拍'}" loading="lazy">` : `<div class="text-cover ${post.category === '音乐' ? 'music' : ''}" aria-hidden="true"><span>${post.category === '音乐' ? '♪' : '札记'}</span><small>示例文字</small></div>`;
}
function card(post) { return `<a class="card" href="#/post/${encodeURIComponent(post.id)}">${meta(post)}<h3>${escape(post.title)}</h3><p>${escape(post.excerpt)}</p></a>`; }
function intro(title, subtitle, eyebrow = 'THE JOURNAL / 示例原型') { return `<div class="page-intro"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>`; }
function notice(text) { return `<div class="notice">${text}</div>`; }
function chips(items, current, action) { return items.map(item => `<button class="chip ${current === item ? 'active' : ''}" aria-pressed="${current === item}" data-action="${action}" data-value="${escape(item)}">${escape(item)}</button>`).join(''); }
function home() {
  const recent = [posts[0], posts[1], posts[3], posts[7]];
  main.innerHTML = `<section class="home-intro"><span class="eyebrow">个人网站 · 名称待定</span><h1>爱好、想法与日常。</h1><p>记录交通与地图、旅行、语言和音乐，也留下一些生活中的思考。</p><span class="sample-note">当前文章、日期与图像均为示例。</span></section>
    <nav class="category-strip" aria-label="公开栏目">${categories.map(cat => `<a href="${categoryUrl(cat)}">${cat}</a>`).join('')}<a href="#/about">关于我</a></nav>
    <section aria-label="最近的示例文章"><div class="section-head"><h2>最近记录</h2><a href="#/archive">全部记录 →</a></div><div class="entry-list">${recent.map(card).join('')}</div></section>`;
}
function archive(fixedCategory) {
  const selected = fixedCategory || archiveCategory;
  const filtered = allPosts().filter(post => (selected === '全部' || post.category === selected) && (archiveType === '全部' || post.type === archiveType));
  main.innerHTML = `${intro(fixedCategory ? escape(fixedCategory) : '所有记录', '长一点的文章，短一点的想法。这里的日期与文字均为展示用示例。')}
    ${!fixedCategory ? `<div class="filters" aria-label="筛选栏目">${chips(['全部', ...categories], selected, 'category')}</div>` : ''}
    <div class="filters" aria-label="筛选记录类型">${chips(['全部', '长文章', '短记'], archiveType, 'type')}</div>
    ${fixedCategory === '音乐' ? '<p><a class="text-link" href="#/music">夜鹿专题：听后感、衍生小说与圣地巡礼 ↗</a></p>' : ''}
    <div class="archive-grid">${filtered.map(card).join('') || '<p class="empty">这个筛选下暂时没有示例记录。</p>'}</div>`;
}
function article(id) {
  const post = allPosts().find(post => post.id === id);
  if (!post) { main.innerHTML = `${intro('记录未找到', '这条记录可能是刷新前的内存演示，或链接已经失效。')}<a class="button" href="#/archive">返回所有记录</a>`; return; }
  const caption = post.image === 'map' ? '原创示意地图 · 所有站点均为虚构，不用于导航或真实线路分析。' : '原创风景插画 · 用于演示照片版式，非实拍，不代表创建者旅行经历。';
  main.innerHTML = `<article class="article"><a class="back" href="${categoryUrl(post.category)}">← ${escape(post.category)}</a>${meta(post)}<h1>${escape(post.title)}</h1><p class="lead">${escape(post.excerpt)}</p>${notice('示例内容：本文不代表创建者真实经历或作品。日期用于演示排版。')}${post.image ? `<figure>${cover(post)}<figcaption>${caption}</figcaption></figure>` : ''}<div class="reading-tools"><span>阅读字号</span><button data-action="font" data-value="normal" aria-pressed="true">标准</button><button data-action="font" data-value="large" aria-pressed="false">较大</button><span>· ${escape(post.type)}示例</span></div><div class="article-body">${post.body.map(([title, text]) => `<section><h2>${escape(title)}</h2><p>${escape(text)}</p></section>`).join('')}</div><div class="tags">${post.tags.map(tag => `<span># ${escape(tag)}</span>`).join('')}</div>${post.topic ? '<p style="margin-top:30px"><a class="text-link" href="#/music">继续翻阅夜鹿专题 ↗</a></p>' : ''}</article>`;
}
function music() {
  const filtered = posts.filter(post => post.category === '音乐' && (topic === '全部' || post.topic === topic));
  main.innerHTML = `${intro('夜鹿 · ヨルシカ', '歌曲听后感、衍生小说与圣地巡礼。以下文字均为示例。', '音乐 / 夜鹿专题')}<div class="filters" aria-label="筛选夜鹿专题">${chips(['全部', '听后感', '衍生小说', '圣地巡礼'], topic, 'topic')}</div><div class="archive-grid">${filtered.map(card).join('')}</div>`;
}
function about() {
  main.innerHTML = `<div class="about">${intro('关于这个空间', '一个用于展示和记录爱好、思维与日常生活的个人空间。', 'ABOUT / 个人介绍待填写')}<h2>先为生活留一个位置。</h2><p>这里计划围绕交通与地图、NIMBY Rails、旅行与散步、语言与文化、音乐和日常随笔展开。长文章与短记并存，让不同长度的想法都能被留下。</p><dl><dt>网站名称</dt><dd>待确定；PW 是当前项目代号。</dd><dt>创建者介绍</dt><dd>待创建者填写，不推断姓名、职业、所在地或经历。</dd><dt>头像与联系</dt><dd>待创建者决定公开范围。</dd><dt>这个阶段</dt><dd>使用明确示例内容验证阅读、栏目和管理流程。</dd></dl>${notice('记忆阁楼计划仅供创建者使用。当前只提供公开的虚构界面演示，尚未接入登录、私密存储与后台。')}<a class="text-link" href="#/archive">回到记录 ↗</a></div>`;
}
function privateGate() {
  main.innerHTML = `<div class="about">${intro('记忆阁楼', '一些往事，一些日记，一些只想留给自己的照片。', 'PRIVATE SPACE / 待实现')}${notice('<strong>此原型尚无身份验证，也不是可用的私密空间。</strong><br>真实内容不能放在此处。后续将对日记、原图、缩略图与附件实施服务端权限检查。')}<h2>仅看一眼，未来的样子。</h2><p>下面的时间线只包含公开的虚构示例，用于验证日期、事件与人物标签的组织方式。进入演示不代表登录。</p><a class="button" href="#/private-demo">查看虚构时间线演示 →</a><p style="margin-top:20px;font-size:12px;color:var(--muted)">真实日记、往事和照片请等待安全后台完成后再保存。</p></div>`;
}
function privateDemo() {
  const filtered = memories.filter(item => (!memoryFilters.date || item.date === memoryFilters.date) && (!memoryFilters.event || item.event === memoryFilters.event) && (!memoryFilters.person || item.person === memoryFilters.person));
  main.innerHTML = `${intro('记忆的时间线', '公开的虚构示例 · 日期、事件和人物均不对应创建者真实经历。', 'FICTIONAL DEMO / 非私密存储')}${notice('你正在查看公开原型，尚未登录。以下内容均为虚构，不可在这里保存真实私密资料。')}<form class="filter-form" id="memory-filters"><label>日期<input type="date" name="date" value="${escape(memoryFilters.date)}"></label><label>事件<select name="event"><option value="">全部事件</option>${['重逢', '散步'].map(value => `<option ${memoryFilters.event === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>人物<select name="person"><option value="">全部人物</option>${['虚构人物 A', '仅自己（示例）'].map(value => `<option ${memoryFilters.person === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><button class="chip" type="button" data-action="reset-memory">清除筛选</button></form><div class="timeline">${filtered.map(item => `<article class="memory"><div class="meta"><time datetime="${item.date}">${item.date}</time>${example}</div><h3>${item.title}</h3><p>${item.text}</p><div class="tags"><span>${item.event}</span><span>${item.person}</span></div></article>`).join('') || '<p class="empty">没有符合筛选条件的虚构记录。</p>'}</div>`;
}
const blankDraft = () => ({ title: '', category: categories[0], type: '长文章', visibility: 'private', body: '', caption: '', id: null });
function captureEditor() {
  const form = document.querySelector('#editor');
  if (!form) return;
  const values = Object.fromEntries(new FormData(form));
  draftState = { ...draftState, ...values };
}
function admin() {
  draftState ||= blankDraft();
  main.innerHTML = `${intro('写下一点什么', '管理流程演示 · 输入内容仅存在当前页面内存中，刷新即清除。', 'EDITOR / 示例专用')}${notice('<strong>只输入测试文字与测试图片。</strong>没有登录、后台或持久保存；照片仅本地预览，不会上传。私密默认选中，不能保存真实资料。')}<div class="editor-layout"><form class="editor" id="editor"><label>示例标题<input name="title" required maxlength="120" placeholder="给这段示例文字起个名字" value="${escape(draftState.title)}"></label><div class="field-pair"><label>栏目<select name="category">${categories.map(value => `<option ${draftState.category === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>记录类型<select name="type">${['长文章', '短记'].map(value => `<option ${draftState.type === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div><label>可见范围（演示）<select name="visibility"><option value="private" ${draftState.visibility === 'private' ? 'selected' : ''}>私密 · 仅模拟状态，非安全存储</option><option value="public" ${draftState.visibility === 'public' ? 'selected' : ''}>公开 · 需要点击模拟发布</option></select></label><label>示例正文<textarea name="body" rows="10" required placeholder="这里只写用于测试的示例内容。">${escape(draftState.body)}</textarea></label><label>测试照片 · 本地预览<input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp"></label><label>照片说明与替代文本<input name="caption" maxlength="200" placeholder="描述测试图片的内容" value="${escape(draftState.caption)}"></label><div class="photo-preview" id="photo-preview">${photoMarkup()}</div><div class="actions"><button class="button secondary" type="button" data-action="save-draft">暂存示例草稿</button><button class="button secondary" type="button" data-action="preview-draft">阅读预览</button><button class="button" type="submit">模拟公开发布</button></div><p style="font-size:12px;color:var(--muted)">模拟发布只把测试文字加入本次会话的公开列表；图片不会发布或上传。刷新后全部清空。</p></form><aside class="editor-aside"><h3>本次演示草稿</h3><p>仅当前会话 · 刷新即清除</p>${drafts.length ? drafts.map(draft => `<div class="draft"><button data-action="load-draft" data-value="${draft.id}">${escape(draft.title)}</button><span>${escape(draft.type)} · ${draft.visibility === 'private' ? '私密状态演示' : '公开草稿演示'}</span></div>`).join('') : '<p>还没有暂存的示例草稿。</p>'}<button class="chip" data-action="new-draft">新建示例</button><hr style="border:0;border-top:1px solid var(--line);margin:24px 0"><p>后续接入后台后，才可真正保存、上传、发布，并在其他设备读取。</p></aside></div>`;
}
function photoMarkup() { return uploadedPhoto ? `<img src="${uploadedPhoto.url}" alt="${escape(draftState?.caption || '未填写说明的测试图片')}"><p>测试图片仅本地显示 · 未上传</p><button class="chip" type="button" data-action="remove-photo">移除测试图片</button>` : ''; }
function clearPhoto() { if (uploadedPhoto) URL.revokeObjectURL(uploadedPhoto.url); uploadedPhoto = null; }
function previewDraft() {
  captureEditor();
  if (!draftState.title.trim() || !draftState.body.trim()) { toast('请填写示例标题和正文。'); return; }
  main.innerHTML = `<article class="article"><button class="chip" data-action="back-editor">← 返回管理演示</button>${notice('未发布的示例阅读预览 · 本次会话内存数据，刷新即清除。')}<h1>${escape(draftState.title)}</h1><div class="meta">${escape(draftState.category)} · ${escape(draftState.type)} ${example}</div>${uploadedPhoto ? `<figure>${photoMarkup()}<figcaption>${escape(draftState.caption || '照片说明待填写')}</figcaption></figure>` : ''}<div class="preview-body">${escape(draftState.body)}</div></article>`;
  window.scrollTo(0, 0);
}
function toast(text) { const status = document.querySelector('#status'); status.textContent = text; status.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => status.classList.remove('visible'), 4500); }
function route() {
  const hash = location.hash.slice(1) || '/';
  let parts;
  try { parts = hash.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent); }
  catch { parts = ['404']; }
  document.querySelectorAll('[data-nav]').forEach(link => { const active = (parts[0] || 'home') === link.dataset.nav; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  switch (parts[0]) {
    case undefined: home(); break;
    case 'archive': if (hash.includes('?type=')) archiveType = new URLSearchParams(hash.split('?')[1]).get('type') === '短记' ? '短记' : '全部'; archive(); break;
    case 'category': if (categories.includes(parts[1])) archive(parts[1]); else notFound(); break;
    case 'post': article(parts[1]); break;
    case 'music': music(); break;
    case 'about': about(); break;
    case 'private': privateGate(); break;
    case 'private-demo': privateDemo(); break;
    case 'admin': admin(); break;
    default: notFound();
  }
  document.title = `${main.querySelector('h1')?.textContent || '沿途的记录'} · PW 示例原型`;
}
function notFound() { main.innerHTML = `${intro('这一页还没有写下', '请回到首页或所有记录。')}<a class="button" href="#/">返回首页</a>`; }
main.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action, value } = control.dataset;
  if (action === 'category') { archiveCategory = value; archive(); }
  if (action === 'type') { archiveType = value; const parts = location.hash.split('/'); archive(parts[1] === 'category' ? decodeURIComponent(parts[2]) : undefined); }
  if (action === 'topic') { topic = value; music(); }
  if (action === 'font') { document.querySelector('.article-body').classList.toggle('large', value === 'large'); document.querySelectorAll('[data-action="font"]').forEach(button => button.setAttribute('aria-pressed', button.dataset.value === value)); }
  if (action === 'reset-memory') { memoryFilters = { date: '', event: '', person: '' }; privateDemo(); }
  if (action === 'save-draft') {
    captureEditor();
    if (!draftState.title.trim() || !draftState.body.trim()) return toast('请填写示例标题和正文。');
    draftState.id ||= crypto.randomUUID();
    const index = drafts.findIndex(draft => draft.id === draftState.id);
    if (index < 0) drafts.push({ ...draftState }); else drafts[index] = { ...draftState };
    admin(); toast('示例草稿已暂存在页面内存，刷新后清除。');
  }
  if (action === 'new-draft') { draftState = blankDraft(); clearPhoto(); admin(); }
  if (action === 'load-draft') { draftState = { ...drafts.find(draft => draft.id === value) }; clearPhoto(); admin(); toast('已载入示例文字。照片仅供临时预览，不随草稿保存。'); }
  if (action === 'preview-draft') previewDraft();
  if (action === 'back-editor') admin();
  if (action === 'remove-photo') { captureEditor(); clearPhoto(); const preview = document.querySelector('#photo-preview'); if (preview) { preview.innerHTML = ''; document.querySelector('#photo-input').value = ''; } else previewDraft(); }
});
main.addEventListener('input', event => { if (event.target.closest('#editor')) captureEditor(); });
main.addEventListener('change', event => {
  if (event.target.closest('#memory-filters')) { memoryFilters = Object.fromEntries(new FormData(document.querySelector('#memory-filters'))); privateDemo(); }
  if (event.target.id === 'photo-input') {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { event.target.value = ''; return toast('请选择 10 MB 以内的 JPEG、PNG 或 WebP 测试图片。'); }
    clearPhoto(); uploadedPhoto = { url: URL.createObjectURL(file) }; document.querySelector('#photo-preview').innerHTML = photoMarkup();
  }
});
main.addEventListener('submit', event => {
  if (event.target.id !== 'editor') return;
  event.preventDefault(); captureEditor();
  if (!draftState.title.trim() || !draftState.body.trim()) return toast('请填写示例标题和正文。');
  if (draftState.visibility !== 'public') return toast('当前为私密状态演示；请明确选择“公开”后再模拟发布。');
  const now = new Date();
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  simulatedPosts.unshift({ id: 'demo-' + crypto.randomUUID(), title: draftState.title, category: draftState.category, type: draftState.type, date, excerpt: draftState.body.slice(0, 100), tags: ['会话内示例'], body: [['测试文字 · 模拟发布', draftState.body]] });
  toast('已模拟加入公开列表，仅本次会话可见，刷新即清除。');
  archiveCategory = '全部'; archiveType = '全部'; location.hash = '#/archive';
});
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
window.addEventListener('pagehide', clearPhoto);
route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost')) navigator.serviceWorker.register('./sw.js').catch(() => {});
