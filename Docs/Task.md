# Task

## 결정 사항

- 페이지 내용은 `data.json`을 읽어 JS로 구성한다. 내용 수정은 JSON만 고친다.
- 프로젝트 상세는 별도 페이지 없이 목록에서 펼쳐 보여 준다(세로 목록 아코디언).
- 이미지 등 프로젝트 자료는 `projects/<slug>/` 폴더에 둔다.

## 목표 구조

```
Portfolio/
├── index.html
├── style.css
├── script.js                   # 메뉴, 테마, data.json 렌더링
├── data.json                   # Projects, Contact 내용
└── projects/
    └── <slug>/
        └── (GIF 등 프로젝트 자료)
```

## 할 일

### 1. JSON 기반 페이지 구성
- [x] `data.json` 만들기 (현재 샘플의 Projects, Contact 내용 이전)
- [x] `index.html`의 하드코딩된 내용을 빈 컨테이너로 교체
- [x] `script.js`에서 `fetch('data.json')`으로 읽어 렌더링

### 2. 프로젝트 상세
- [x] `data.json`의 각 프로젝트에 `slug` 필드 추가
- [x] 상세 레이아웃 안 만들어 승인받기 (새 UI이므로)
- [x] 프로젝트 목록을 펼치면 상세가 보이도록 변경
- [ ] 프로젝트별 데모 GIF를 `projects/<slug>/`에 넣고 `data.json`의 `media`에 등록

## 주의 사항

- 경로는 모두 상대 경로로 쓴다. `/`로 시작하면 `/Portfolio/`가 빠져서 깨진다.
- 로컬 확인은 `python3 -m http.server` 후 `http://localhost:8000`에서 한다. `file://`로 열면 `fetch`가 막힌다.
- JSON 문법 오류가 있으면 해당 섹션이 표시되지 않으므로 수정 후 반드시 확인한다.
- 파일 하나가 100MB를 넘으면 push가 거부된다. 긴 영상은 YouTube 임베드를 쓴다.
- `CLAUDE.md` 규칙: 승인 없이 UI 추가 금지, 커밋 전 사용자 검토.
