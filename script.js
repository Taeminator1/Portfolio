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

// 주소 쿼리 읽기/쓰기. 값은 인코딩된 문자열 그대로 다루고, 다른 쿼리와 해시는 유지한다
function readQuery(name) {
  const param = location.search.slice(1).split('&').find((p) => p.startsWith(`${name}=`));
  return param ? param.slice(name.length + 1) : null;
}

function writeQuery(name, value) {
  const params = location.search.slice(1).split('&').filter((p) => p && !p.startsWith(`${name}=`));
  if (value) params.push(`${name}=${value}`);
  const query = params.length ? `?${params.join('&')}` : '';
  history.replaceState(null, '', location.pathname + query + location.hash);
}

// 화면 고정 문구. 콘텐츠는 data.json에 언어별로 있다
const strings = {
  ko: {
    description: '소프트웨어 엔지니어 윤태민의 포트폴리오',
    menuOpen: '메뉴 열기',
    filterLabel: '기술로 필터',
    all: '전체',
    more: '기타',
    featured: '주요',
    sortLabel: '정렬',
    sortImportance: '중요도순',
    sortDesc: '최신순',
    sortAsc: '오래된순',
    period: '기간',
    stack: '기술',
    present: '진행 중',
    demo: '실행 화면',
    overview: '개요',
    achievements: '성과',
    contributions: '주요 작업',
    langLabel: 'Language',
  },
  en: {
    description: 'Portfolio of Taemin Yun, software engineer',
    menuOpen: 'Open menu',
    filterLabel: 'Filter by stack',
    all: 'All',
    more: 'More',
    featured: 'Featured',
    sortLabel: 'Sort',
    sortImportance: 'Importance',
    sortDesc: 'Newest',
    sortAsc: 'Oldest',
    period: 'Period',
    stack: 'Stack',
    present: 'Present',
    demo: 'Demo',
    overview: 'Overview',
    achievements: 'Achievements',
    contributions: 'Key Contributions',
    langLabel: '언어',
  },
};

// 언어 이름은 화면 언어와 상관없이 각 언어로 표시한다
const languageNames = { en: 'English', ko: '한국어' };

// ?lang=ko|en 이 있으면 따르고, 없으면 브라우저 언어가 한국어일 때만 한국어
function detectLang() {
  const query = readQuery('lang');
  if (query && Object.hasOwn(strings, query)) return query;
  const preferred = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return preferred.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

let lang = detectLang();
let data = null;
// 프로젝트 정렬. 중요도순(importance, data.json에 나열된 순서)이 기본이고,
// 시작 시간 기준 최신순·오래된순은 주소에 ?sort=desc|asc 로 남긴다
const sortOrders = ['importance', 'desc', 'asc'];
let sortOrder = sortOrders.includes(readQuery('sort')) ? readQuery('sort') : 'importance';

// 드롭다운 메뉴(언어, 정렬). 바깥을 누르거나 Esc를 누르면 닫히고, 고른 항목은 굵게 표시한다
// 반환하는 함수에 항목 목록을 넘겨 다시 그린다. option: { value, text, lang? }
const dropdowns = [];

document.addEventListener('click', (e) => {
  dropdowns.forEach((d) => { if (!d.root.contains(e.target)) d.setOpen(false); });
});

function createDropdown(root, onSelect) {
  const toggle = root.querySelector('.dropdown-toggle');
  const list = root.querySelector('.dropdown-list');

  function setOpen(open) {
    list.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(list.hidden));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  dropdowns.push({ root, setOpen });

  return function renderDropdown(label, options, current) {
    // 버튼 안에 모든 항목을 겹쳐 두고 고른 것만 보이게 해서, 버튼 폭을 가장 긴 항목에 맞춘다
    // 목록은 버튼과 같은 폭으로 열리고, 무엇을 골라도 버튼 크기가 바뀌지 않는다
    const text = el('span', 'dropdown-label');
    options.forEach((o) => {
      const span = el('span', o.value === current ? null : 'dropdown-ghost', o.text);
      if (o.lang) span.lang = o.lang;
      text.append(span);
    });
    toggle.replaceChildren(text, el('span', 'chevron'));
    list.setAttribute('aria-label', label);
    list.replaceChildren(...options.map((o) => {
      const button = el('button', 'dropdown-option', o.text);
      button.type = 'button';
      if (o.lang) button.lang = o.lang;
      if (o.value === current) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => {
        setOpen(false);
        toggle.focus();
        if (o.value !== current) onSelect(o.value);
      });
      const li = el('li');
      li.append(button);
      return li;
    }));
  };
}

const renderLangMenu = createDropdown(document.querySelector('.lang-menu'), (code) => {
  lang = code;
  writeQuery('lang', lang);
  render();
});

const renderSortMenu = createDropdown(document.querySelector('.sort-menu'), (order) => {
  sortOrder = order;
  writeQuery('sort', sortOrder === 'importance' ? null : sortOrder);
  renderStatic();
  if (data) renderProjects(data.projects);
});

function renderStatic() {
  const t = strings[lang];
  document.documentElement.lang = lang;
  document.querySelector('meta[name="description"]').content = t.description;
  navToggle.setAttribute('aria-label', t.menuOpen);
  document.querySelector('.stack-filter').setAttribute('aria-label', t.filterLabel);
  const languages = Object.keys(languageNames).map((code) => ({ value: code, text: languageNames[code], lang: code }));
  renderLangMenu(t.langLabel, languages, lang);
  renderSortMenu(t.sortLabel, [
    { value: 'importance', text: t.sortImportance },
    { value: 'desc', text: t.sortDesc },
    { value: 'asc', text: t.sortAsc },
  ], sortOrder);
}

function render() {
  renderStatic();
  if (!data) return;
  renderTitle(data.title);
  renderIntro(data.intro);
  renderProjects(data.projects);
  renderContact(data.contact);
}

renderStatic();

// data.json으로 콘텐츠 그리기

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// data.json 문구 안의 **구절**은 굵게. HTML은 해석하지 않고 글자 그대로 둔다
// node.append(...rich(text)) 로 쓴다. 짝이 안 맞는 ** 는 글자로 남는다
function rich(text) {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? el('strong', null, part) : part));
}

// 속성(alt 등)에 넣을 때는 ** 를 지운다
function plain(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

function richEl(tag, className, text) {
  const node = el(tag, className);
  node.append(...rich(text));
  return node;
}

function formatMonth(ym) {
  const [y, m] = ym.split('-');
  return lang === 'ko' ? `${y}년 ${m}월` : `${m}/${y}`;
}

function list(items, className) {
  const ul = el('ul', className);
  items.forEach((text) => ul.append(richEl('li', null, text)));
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
    const alt = item.alt ? plain(item.alt[lang]) : '';
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
  const t = strings[lang];
  const content = project.content[lang];
  const item = el('details', 'project');

  const summary = el('summary');
  const head = el('div', 'project-head');
  const title = content.subtitle ? `${content.title} - ${content.subtitle}` : content.title;
  head.append(richEl('h3', null, title));
  summary.append(head, el('span', 'chevron'));

  const body = el('div', 'project-body');

  const meta = el('dl', 'meta');
  const periods = project.periods.map((p) => {
    const end = p.end ? formatMonth(p.end) : t.present;
    const label = p.label ? ` · ${p.label[lang]}` : '';
    return `${formatMonth(p.start)} – ${end}${label}`;
  });
  const periodsDd = el('dd');
  periodsDd.append(list(periods));
  const stackDd = el('dd');
  stackDd.append(list(project.stack, 'tags small'));
  meta.append(el('dt', null, t.period), periodsDd, el('dt', null, t.stack), stackDd);
  body.append(meta);

  body.append(block(t.overview, list(content.overview, 'bullets')));
  const achievements = block(t.achievements, list(content.achievements, 'bullets'));
  achievements.classList.add('achievements');
  body.append(achievements);

  const contributions = el('ul', 'bullets');
  content.contributions.forEach((c) => {
    const li = richEl('li', null, c.text);
    if (c.children) li.append(list(c.children));
    contributions.append(li);
  });
  body.append(block(t.contributions, contributions));
  if (project.media && project.media.length) body.append(block(t.demo, renderMedia(project)));

  item.append(summary, body);
  return item;
}

// 프로젝트 시작 시간은 periods 중 가장 이른 start. "YYYY-MM"이라 문자열 비교로 충분하다
function startOf(project) {
  return project.periods.map((p) => p.start).sort()[0] || '';
}

function sortProjects(projects) {
  if (sortOrder === 'importance') return [...projects];
  const sign = sortOrder === 'asc' ? 1 : -1;
  return [...projects].sort((a, b) => sign * startOf(a).localeCompare(startOf(b)));
}

function renderProjects(allProjects) {
  const container = document.querySelector('.project-list');
  const projects = sortProjects(allProjects);
  // 처음에는 모두 펼쳐 두고, 언어나 정렬을 바꿔 다시 그릴 때 접어 둔 프로젝트는 그대로 접는다
  const wasClosed = new Set([...container.children].filter((item) => !item.open).map((item) => item.dataset.slug));
  const items = projects.map(renderProject);
  items.forEach((item, i) => {
    item.dataset.slug = projects[i].slug;
    item.open = !wasClosed.has(projects[i].slug);
  });
  container.replaceChildren(...items);
  renderStackFilter(projects, items);
}

// stack 값으로 필터. 여러 개를 고를 수 있고, 고른 기술 중 하나라도 쓴 프로젝트를 보여 준다
// 같은 버튼을 다시 누르면 해제, "전체"를 누르면 모두 해제
// 프로젝트 하나에만 쓰인 기술은 "기타" 버튼 하나로 묶고, 누르면 목록이 펼쳐진다
// 선택 상태는 주소의 ?stack=A,B 와 맞춘다. 기술 이름에 쉼표가 있어도 되도록 값마다 인코딩한다
// "전체" 옆 "주요" 버튼은 featured: true 인 프로젝트를 고른다. 기술 버튼과 같이 고른 것 중 하나라도 해당하면 보여 주고,
// 켜진 상태는 ?featured=1 로 남긴다. 주요 프로젝트가 없으면 버튼을 만들지 않는다
function readStackQuery() {
  const param = readQuery('stack');
  if (!param) return [];
  return param.split(',').map((s) => {
    try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return ''; }
  });
}

function writeStackQuery(values) {
  writeQuery('stack', values.map(encodeURIComponent).join(','));
}

function renderStackFilter(projects, items) {
  const counts = new Map();
  projects.forEach((p) => p.stack.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1)));
  const stacks = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  const common = stacks.filter((s) => counts.get(s) > 1);
  const rare = stacks.filter((s) => counts.get(s) === 1);

  const t = strings[lang];
  const bar = document.querySelector('.stack-filter');
  const wasMoreOpen = bar.querySelector('.filter-more:not([hidden])') !== null;
  bar.replaceChildren();
  const more = el('div', 'filter-more');
  more.id = 'filter-more';
  more.hidden = true;
  const buttons = [];
  const selected = new Set();
  let moreToggle = null;
  const featuredCount = projects.filter((p) => p.featured).length;
  let featuredOnly = featuredCount > 0 && readQuery('featured') === '1';
  let featuredButton = null;

  function apply() {
    items.forEach((item, i) => {
      const any = selected.size > 0 || featuredOnly;
      const matched = (featuredOnly && projects[i].featured) || projects[i].stack.some((s) => selected.has(s));
      item.hidden = any && !matched;
    });
    buttons.forEach((b) => {
      const pressed = b.dataset.value === '' ? selected.size === 0 && !featuredOnly : selected.has(b.dataset.value);
      b.setAttribute('aria-pressed', pressed);
    });
    if (featuredButton) featuredButton.setAttribute('aria-pressed', featuredOnly);
    if (moreToggle) moreToggle.classList.toggle('has-selected', rare.some((s) => selected.has(s)));
  }

  function setMoreOpen(open) {
    more.hidden = !open;
    moreToggle.setAttribute('aria-expanded', String(open));
  }

  function setFeaturedOnly(on) {
    featuredOnly = on;
    writeQuery('featured', on ? '1' : null);
  }

  function toggle(value) {
    if (value === null) {
      selected.clear();
      setFeaturedOnly(false);
    } else if (selected.has(value)) selected.delete(value);
    else selected.add(value);
    apply();
    writeStackQuery([...selected]);
  }

  function addButton(parent, label, value, count) {
    // "Firebase (Remote Config)"처럼 괄호가 있으면 버튼에는 앞부분만 쓰고, 괄호 안은 마우스를 올렸을 때 팝업으로 보여 준다
    const [, name, detail] = label.match(/^(.*?)\s*\((.+)\)$/) || [null, label, null];
    const button = el('button', 'filter-chip', name);
    button.type = 'button';
    if (detail) button.append(el('span', 'filter-tip', detail));
    button.dataset.value = value ?? '';
    if (count !== undefined) button.append(el('span', 'filter-count', String(count)));
    button.addEventListener('click', () => toggle(value));
    buttons.push(button);
    parent.append(button);
  }

  addButton(bar, t.all, null);

  if (featuredCount) {
    featuredButton = el('button', 'filter-chip');
    featuredButton.type = 'button';
    const star = el('span', null, '★');
    star.setAttribute('aria-hidden', 'true');
    featuredButton.append(star, t.featured, el('span', 'filter-count', String(featuredCount)));
    featuredButton.addEventListener('click', () => {
      setFeaturedOnly(!featuredOnly);
      apply();
    });
    bar.append(featuredButton);
  }

  common.forEach((s) => addButton(bar, s, s, counts.get(s)));

  if (rare.length) {
    moreToggle = el('button', 'filter-chip filter-toggle', t.more);
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
  if (wasMoreOpen || rare.some((s) => selected.has(s))) setMoreOpen(true);
  apply();
}

// intro는 선택 값. 없거나 해당 언어 문구가 비어 있으면 자리까지 숨긴다
function renderTitle(title) {
  document.getElementById('logo').textContent = title[lang];
}

function renderIntro(intro) {
  const node = document.getElementById('intro');
  const text = intro && intro[lang];
  node.replaceChildren(...rich(text || ''));
  node.hidden = !text;
}

function renderContact(contact) {
  document.getElementById('contact-message').replaceChildren(...rich(contact.message[lang]));
  const links = document.querySelector('.contact-links');
  links.replaceChildren();
  contact.links.forEach((link) => {
    const a = richEl('a', null, link.label[lang]);
    a.href = link.url;
    if (!link.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    const li = el('li');
    li.append(a);
    links.append(li);
  });
}

fetch('data.json')
  .then((res) => {
    if (!res.ok) throw new Error(`data.json ${res.status}`);
    return res.json();
  })
  .then((json) => {
    data = json;
    render();
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
