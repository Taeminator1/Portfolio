# Task

## 결정 사항

- 페이지 내용은 `data.json`을 읽어 JS로 구성한다. 내용 수정은 JSON만 고친다.
- 프로젝트 상세 페이지는 한 저장소 안에서 `projects/<slug>/` 폴더로 나눠 관리한다.

## 목표 구조

```
Portfolio/
├── index.html
├── style.css
├── script.js
├── data.json                   # Projects, Contact 내용
└── projects/
    └── <slug>/
        ├── index.html          # → /Portfolio/projects/<slug>/
        └── (이미지 등 프로젝트 자료)
```

## 할 일

### 1. JSON 기반 페이지 구성
- [x] `data.json` 만들기 (현재 샘플의 Projects, Contact 내용 이전)
- [x] `index.html`의 하드코딩된 내용을 빈 컨테이너로 교체
- [x] `script.js`에서 `fetch('data.json')`으로 읽어 렌더링

### 2. 프로젝트별 폴더
- [x] `data.json`의 각 프로젝트에 `slug` 필드 추가
- [ ] 프로젝트 카드에서 `projects/<slug>/`로 링크
- [ ] 상세 페이지 레이아웃 안 만들어 승인받기 (새 UI이므로)
- [ ] 승인 후 `projects/<slug>/index.html` 작성

## 주의 사항

- 경로는 모두 상대 경로로 쓴다. `/`로 시작하면 `/Portfolio/`가 빠져서 깨진다.
  - 상세 페이지에서 공통 파일: `../../style.css`
- 로컬 확인은 `python3 -m http.server` 후 `http://localhost:8000`에서 한다. `file://`로 열면 `fetch`가 막힌다.
- JSON 문법 오류가 있으면 해당 섹션이 표시되지 않으므로 수정 후 반드시 확인한다.
- 파일 하나가 100MB를 넘으면 push가 거부된다. 긴 영상은 YouTube 임베드를 쓴다.
- `CLAUDE.md` 규칙: 승인 없이 UI 추가 금지, 커밋 전 사용자 검토.
