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

// 다크/라이트 테마 전환
const root = document.documentElement;

document.querySelector('.theme-toggle').addEventListener('click', () => {
  const current = root.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// data.json으로 콘텐츠 그리기
const lang = 'ko';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderProjects(projects) {
  const grid = document.querySelector('.projects-grid');
  projects.forEach((project, i) => {
    const content = project.content[lang];
    const card = el('article', 'card project');

    const thumb = el('div', 'project-thumb', String(i + 1).padStart(2, '0'));
    if (project.hue !== undefined) thumb.style.setProperty('--hue', project.hue);

    const tags = el('ul', 'tags small');
    project.stack.forEach((name) => tags.append(el('li', null, name)));

    card.append(thumb, el('h3', null, content.title), el('p', null, content.summary), tags);
    grid.append(card);
  });
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
