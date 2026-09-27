// 푸터 연도
document.getElementById('year').textContent = new Date().getFullYear();

// 모바일 메뉴 토글
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// data.json으로 콘텐츠 그리기
const lang = 'ko';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatMonth(ym) {
  const [y, m] = ym.split('-');
  return `${y}년 ${m}월`;
}

function list(items, className) {
  const ul = el('ul', className);
  items.forEach((text) => ul.append(el('li', null, text)));
  return ul;
}

function block(title, content) {
  const section = el('section', 'project-block');
  section.append(el('h4', null, title), content);
  return section;
}

// 일반 YouTube 주소(watch, youtu.be, shorts)를 임베드 주소로 변환. YouTube가 아니면 null
function youtubeEmbed(src) {
  let url;
  try { url = new URL(src); } catch (e) { return null; }
  const host = url.hostname.replace(/^(www|m)\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host === 'youtube.com') {
    const [, kind, value] = url.pathname.split('/');
    id = kind === 'watch' ? url.searchParams.get('v') : (kind === 'embed' || kind === 'shorts') ? value : null;
  }
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// media.src는 projects/<slug>/ 기준 상대 경로, 또는 YouTube 주소. 종류는 src로 판단
function renderMedia(project) {
  const wrap = el('div', 'media');
  project.media.forEach((item) => {
    const alt = item.alt ? item.alt[lang] : '';
    const embed = youtubeEmbed(item.src);
    let node;
    if (embed) {
      node = el('iframe', 'media-youtube');
      node.src = embed;
      node.allowFullscreen = true;
      node.title = alt;
    } else if (/\.(mp4|webm|mov)$/i.test(item.src)) {
      node = el('video', 'media-item');
      node.src = `projects/${project.slug}/${item.src}`;
      node.controls = true;
      node.playsInline = true;
      if (alt) node.setAttribute('aria-label', alt);
    } else {
      node = el('img', 'media-item');
      node.src = `projects/${project.slug}/${item.src}`;
      node.alt = alt;
      node.loading = 'lazy';
    }
    wrap.append(node);
  });
  return wrap;
}

function renderProject(project) {
  const content = project.content[lang];
  const item = el('details', 'project');

  const summary = el('summary');
  const head = el('div', 'project-head');
  head.append(el('h3', null, content.title), el('p', null, content.summary));
  summary.append(head, el('span', 'chevron'));

  const body = el('div', 'project-body');

  const meta = el('dl', 'meta');
  const periods = project.periods.map((p) => {
    const end = p.end ? formatMonth(p.end) : '진행 중';
    const label = p.label ? ` · ${p.label[lang]}` : '';
    return `${formatMonth(p.start)} – ${end}${label}`;
  });
  const periodsDd = el('dd');
  periodsDd.append(list(periods));
  const stackDd = el('dd');
  stackDd.append(list(project.stack, 'tags small'));
  meta.append(el('dt', null, '기간'), periodsDd, el('dt', null, '기술'), stackDd);
  body.append(meta);

  if (project.media && project.media.length) body.append(block('데모', renderMedia(project)));
  body.append(block('개요', list(content.overview, 'bullets')));
  body.append(block('성과', list(content.achievements, 'achievements')));

  const contributions = el('ul', 'bullets');
  content.contributions.forEach((c) => {
    const li = el('li', null, c.text);
    if (c.children) li.append(list(c.children));
    contributions.append(li);
  });
  body.append(block('주요 작업 내용', contributions));

  item.append(summary, body);
  return item;
}

function renderProjects(projects) {
  const container = document.querySelector('.project-list');
  const items = projects.map(renderProject);
  container.append(...items);
  renderStackFilter(projects, items);
}

// stack 값으로 필터. 여러 개를 고를 수 있고, 고른 기술 중 하나라도 쓴 프로젝트를 보여 준다
// 같은 버튼을 다시 누르면 해제, "전체"를 누르면 모두 해제
// 프로젝트 하나에만 쓰인 기술은 "기타" 버튼 하나로 묶고, 누르면 목록이 펼쳐진다
// 선택 상태는 주소의 ?stack=A,B 와 맞춘다. 기술 이름에 쉼표가 있어도 되도록 값마다 인코딩한다
function readStackQuery() {
  const param = location.search.slice(1).split('&').find((p) => p.startsWith('stack='));
  if (!param) return [];
  return param.slice('stack='.length).split(',').map((s) => {
    try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return ''; }
  });
}

function writeStackQuery(values) {
  const params = location.search.slice(1).split('&').filter((p) => p && !p.startsWith('stack='));
  if (values.length) params.push('stack=' + values.map(encodeURIComponent).join(','));
  const query = params.length ? `?${params.join('&')}` : '';
  history.replaceState(null, '', location.pathname + query + location.hash);
}

function renderStackFilter(projects, items) {
  const counts = new Map();
  projects.forEach((p) => p.stack.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1)));
  const stacks = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  const common = stacks.filter((s) => counts.get(s) > 1);
  const rare = stacks.filter((s) => counts.get(s) === 1);

  const bar = document.querySelector('.stack-filter');
  const more = el('div', 'filter-more');
  more.id = 'filter-more';
  more.hidden = true;
  const buttons = [];
  const selected = new Set();
  let moreToggle = null;

  function apply() {
    items.forEach((item, i) => {
      item.hidden = selected.size > 0 && !projects[i].stack.some((s) => selected.has(s));
    });
    buttons.forEach((b) => {
      const pressed = b.dataset.value === '' ? selected.size === 0 : selected.has(b.dataset.value);
      b.setAttribute('aria-pressed', pressed);
    });
    if (moreToggle) moreToggle.classList.toggle('has-selected', rare.some((s) => selected.has(s)));
  }

  function setMoreOpen(open) {
    more.hidden = !open;
    moreToggle.setAttribute('aria-expanded', String(open));
  }

  function toggle(value) {
    if (value === null) selected.clear();
    else if (selected.has(value)) selected.delete(value);
    else selected.add(value);
    apply();
    writeStackQuery([...selected]);
  }

  function addButton(parent, label, value, count) {
    const button = el('button', 'filter-chip', label);
    button.type = 'button';
    button.dataset.value = value ?? '';
    if (count !== undefined) button.append(el('span', 'filter-count', String(count)));
    button.addEventListener('click', () => toggle(value));
    buttons.push(button);
    parent.append(button);
  }

  addButton(bar, '전체', null);
  common.forEach((s) => addButton(bar, s, s, counts.get(s)));

  if (rare.length) {
    moreToggle = el('button', 'filter-chip filter-toggle', '기타');
    moreToggle.type = 'button';
    moreToggle.setAttribute('aria-expanded', 'false');
    moreToggle.setAttribute('aria-controls', more.id);
    moreToggle.append(el('span', 'filter-count', String(rare.length)), el('span', 'chevron'));
    moreToggle.addEventListener('click', () => setMoreOpen(more.hidden));
    bar.append(moreToggle);
    rare.forEach((s) => addButton(more, s, s));
    bar.append(more);
  }

  readStackQuery().filter((s) => counts.has(s)).forEach((s) => selected.add(s));
  if (rare.some((s) => selected.has(s))) setMoreOpen(true);
  apply();
}

// intro는 선택 값. 없거나 해당 언어 문구가 비어 있으면 자리까지 숨긴다
function renderIntro(intro) {
  const node = document.getElementById('intro');
  const text = intro && intro[lang];
  if (text) node.textContent = text;
  else node.hidden = true;
}

function renderContact(contact) {
  document.getElementById('contact-message').textContent = contact.message[lang];
  const links = document.querySelector('.contact-links');
  contact.links.forEach((link, i) => {
    const a = el('a', i === 0 ? 'btn btn-primary' : 'btn btn-ghost', link.label[lang]);
    a.href = link.url;
    if (!link.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    links.append(a);
  });
}

fetch('data.json')
  .then((res) => {
    if (!res.ok) throw new Error(`data.json ${res.status}`);
    return res.json();
  })
  .then((data) => {
    renderIntro(data.intro);
    renderProjects(data.projects);
    renderContact(data.contact);
  })
  .catch((err) => console.error('콘텐츠를 불러오지 못했습니다.', err));

// 스크롤 시 섹션 나타내기
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
