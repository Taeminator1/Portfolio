# data.json 스키마

참고: `Docs/References.md`의 Notion 경력기술서(국문/영문).

## 원칙

- 국문과 영문은 항목 수와 순서가 다르다. 그래서 문장은 언어별로 통째로 나눠 두고(`content.ko`, `content.en`), 언어와 무관한 값(기간, 기술, 미디어)은 공통으로 둔다.
- 날짜는 `YYYY-MM` 문자열로 쓴다. 표기(`2023년 07월`, `07/2023`)는 렌더링할 때 언어별로 만든다.
- 파일 경로는 모두 상대 경로로 쓴다.
- 화면에 보이는 문구 안의 `**구절**`은 굵게 표시한다. Markdown의 굵게만 지원하고, 다른 서식과 HTML은 글자 그대로 보인다. `slug`, `stack`, `src`, `url`에는 쓰지 않는다.

## 최상위

```json
{
  "intro": { ko, en },
  "projects": [Project],
  "contact": Contact
}
```

- `intro`(선택): 페이지 맨 위, Projects 제목 위에 보이는 소개 문구. 없거나 해당 언어 값이 비어 있으면 표시하지 않는다.

## Project

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `slug` | string | O | 프로젝트 식별자. 자료 폴더명(`projects/<slug>/`)으로도 쓴다. 영문 소문자·숫자·`-`만 |
| `featured` | boolean | | 주요 프로젝트. `true`면 "주요" 필터에 포함된다. 생략하면 `false` |
| `periods` | Period[] | O | 개발 기간. 대부분 1개, YDSKit처럼 단계가 나뉘면 여러 개 |
| `stack` | string[] | O | 사용 기술. 카드 태그로도 쓴다 |
| `media` | Media[] | | Notion의 "Demo" 하위 페이지 내용. 없으면 생략 (예: 앱 실행 속도 최적화) |
| `content` | { ko: ProjectContent, en: ProjectContent } | O | 언어별 문장 |

### Period

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `start` | string | O | `YYYY-MM` |
| `end` | string | | `YYYY-MM`. 진행 중이면 생략 |
| `label` | { ko, en } | | 단계 이름. 기간이 하나면 생략 (예: `UIKit-based library`) |

### Media

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `src` | string | O | 파일 이름(`projects/<slug>/` 기준 상대 경로) 또는 YouTube 주소. 종류는 `src`로 판단한다: YouTube 주소 → 임베드, `.mp4`·`.webm`·`.mov` → 영상, 그 외 → 이미지(GIF 포함). 긴 영상은 YouTube를 쓴다 |
| `alt` | { ko, en } | | 대체 텍스트. 이미지의 `alt`, 영상의 `aria-label`, YouTube iframe의 `title`로 쓴다 |

### ProjectContent

| 필드 | 타입 | 필수 | Notion 대응 |
|---|---|---|---|
| `title` | string | O | 헤더 (예: `요마트`) |
| `subtitle` | string | | 헤더 괄호 안 (예: `식료품 배달 서비스`) |
| `summary` | string | O | 카드에 보일 한 줄 소개 |
| `overview` | string[] | O | 🗒️ 개요 / Overview (기간·기술 줄 제외) |
| `achievements` | string[] | O | 🏆 성과 / Achievements |
| `contributions` | Item[] | O | 🚀 주요 작업 내용 / Key Contributions |

### Item

Notion 글머리 기호가 최대 2단계라서, 하위 목록은 한 단계만 둔다.

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `text` | string | O | 항목 |
| `children` | string[] | | 하위 항목 |

## Contact

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `message` | { ko, en } | O | 섹션 안내 문구 |
| `links` | Link[] | O | 순서대로 버튼으로 표시 |

### Link

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `label` | { ko, en } | O | 버튼 문구 |
| `url` | string | O | `mailto:`, `https://` |

영문 페이지 상단 링크(LinkedIn, Design Work Samples, App Store, Company Website)가 여기에 들어간다.

## 예시

```json
{
  "intro": {
    "ko": "안녕하세요. 제가 진행한 프로젝트를 소개할게요",
    "en": "Hello. Let me introduce the projects I have worked on."
  },
  "projects": [
    {
      "slug": "yomart",
      "periods": [{ "start": "2022-12", "end": "2023-04" }],
      "stack": ["Clean Architecture", "Tuist", "SDUI", "Rx"],
      "media": [
        { "src": "demo.gif", "alt": { "ko": "요마트 시연", "en": "YoMart demo" } }
      ],
      "content": {
        "ko": {
          "title": "요마트",
          "subtitle": "식료품 배달 서비스",
          "summary": "웹뷰 기반 마트 서비스를 네이티브 앱으로 전환",
          "overview": ["웹뷰 기반의 마트 서비스를 완전한 네이티브 앱으로 변화하여 성능과 사용자 경험을 크게 향상시킴"],
          "achievements": ["앱 출시 후 매출 61%, 전환율(CVR) 3.2% 증가"],
          "contributions": [
            {
              "text": "Clean Architecture와 Tuist를 기반으로 모듈화를 구현",
              "children": ["Tuist를 활용해 계층별로 모듈을 생성하여 유지보수 및 확장성을 향상시킴"]
            }
          ]
        },
        "en": {
          "title": "YoMart",
          "subtitle": "Grocery Delivery Service",
          "summary": "Rebuilt a WebView-based grocery service as a native app",
          "overview": ["Rebuilt YoMart from a WebView-based service into a fully native architecture."],
          "achievements": ["Increased revenue by 61% and boosted conversion rate (CVR) by 3.2% after launching the native app."],
          "contributions": [
            { "text": "Modularized the project using Clean Architecture and Tuist." }
          ]
        }
      }
    },
    {
      "slug": "ydskit",
      "periods": [
        { "start": "2023-07", "end": "2023-10", "label": { "ko": "UIKit 기반", "en": "UIKit-based library" } },
        { "start": "2024-10", "end": "2024-12", "label": { "ko": "SwiftUI 기반", "en": "SwiftUI-based library" } }
      ],
      "stack": ["UIKit", "SwiftUI", "SwiftPM", "DocC", "Figma"],
      "content": { "ko": { "...": "..." }, "en": { "...": "..." } }
    }
  ],
  "contact": {
    "message": {
      "ko": "함께 일하거나 이야기 나누고 싶으시면 편하게 연락 주세요.",
      "en": "Feel free to reach out."
    },
    "links": [
      { "label": { "ko": "Email", "en": "Email" }, "url": "mailto:hello@example.com" },
      { "label": { "ko": "LinkedIn", "en": "LinkedIn" }, "url": "https://www.linkedin.com/in/taemin-yun-b590822b7" }
    ]
  }
}
```

## 정할 것

- `summary`는 Notion에 없는 필드다. 카드용 한 줄을 새로 쓰거나, `overview[0]`을 그대로 쓸지.
