# 프로젝트 구조

이 문서는 실제 저장소 구조와 각 폴더의 책임, 기능이 추가될 때의 확장 기준을 설명합니다. 빈 폴더나 사용하지 않는 파일을 미리 만들지 않고, 해당 책임이 생기는 기능 브랜치에서 코드와 테스트를 함께 추가합니다.

## 현재 구조

```text
player-support-desk/
├─ .github/
│  └─ pull_request_template.md
├─ docs/
├─ public/
│  └─ mockServiceWorker.js
├─ src/
│  ├─ assets/
│  │  └─ styles/
│  │     ├─ reset.css
│  │     ├─ tokens.css
│  │     └─ global.css
│  ├─ components/
│  │  └─ layout/
│  │     ├─ AppShell.vue
│  │     ├─ AppHeader.vue
│  │     └─ Navigation.vue
│  ├─ mocks/
│  │  ├─ browser.ts
│  │  └─ handlers.ts
│  ├─ router/
│  │  └─ index.ts
│  ├─ views/
│  │  ├─ DashboardView.vue
│  │  ├─ InquiryListView.vue
│  │  ├─ InquiryDetailView.vue
│  │  └─ NotFoundView.vue
│  ├─ App.vue
│  ├─ main.ts
│  └─ vite-env.d.ts
├─ tests/
│  ├─ components/
│  │  └─ DashboardView.spec.ts
│  ├─ mocks/
│  │  └─ server.ts
│  └─ setup.ts
├─ eslint.config.js
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## 책임

### `src/views`

- Vue Router가 직접 연결하는 페이지 컴포넌트입니다.
- URL과 페이지 수준의 데이터 조회, 하위 컴포넌트 조합을 담당합니다.
- 상세 페이지는 동적 import로 Lazy Loading합니다.

### `src/components`

- 페이지에서 조합하는 재사용 UI입니다.
- 부모에게 받은 값은 Props로 사용하고 사용자 동작은 Emit으로 전달합니다.
- 현재는 모든 화면이 공유하는 `layout`만 있으며 기능 브랜치에서 `common`, `dashboard`, `inquiry`를 추가합니다.

### `src/router`

- URL, 화면 컴포넌트, 페이지 제목, 스크롤 복원을 관리합니다.
- 서버 데이터나 화면 표시 로직을 넣지 않습니다.

### `src/mocks`

- 브라우저와 테스트가 공유하는 MSW 요청 핸들러를 관리합니다.
- `browser.ts`는 Service Worker 실행만 담당합니다.
- 도메인 데이터, 저장소, REST 핸들러는 `feature/mock-api`에서 추가합니다.

### `src/assets/styles`

- `reset.css`: 브라우저 기본 스타일 차이 축소
- `tokens.css`: 색상, 간격, 크기, 반경 등 공통 디자인 값
- `global.css`: 문서 전체와 페이지 공통 스타일
- 컴포넌트에만 필요한 스타일은 해당 SFC의 `<style scoped>`에 둡니다.

### `tests`

- `components`: 하나의 컴포넌트 계약과 사용자 동작
- `integration`: 여러 컴포넌트·Store·API를 잇는 사용자 흐름
- `mocks`: Node 환경의 MSW 서버
- `setup.ts`: 테스트 공통 생명주기와 정리

## 기능 구현 시 확장 구조

다음 구조는 실제 책임이 생길 때만 추가합니다.

```text
src/
├─ components/
│  ├─ common/
│  ├─ dashboard/
│  ├─ inquiry/
│  └─ layout/
├─ mocks/
│  ├─ browser.ts
│  ├─ data.ts
│  ├─ handlers.ts
│  └─ storage.ts
├─ services/
│  └─ api.ts
├─ stores/
│  └─ inquiry.ts
├─ types/
│  ├─ api.ts
│  └─ inquiry.ts
└─ utils/
   ├─ date.ts
   └─ inquiry.ts
```

## 의존 방향

```text
View
├─ UI Component
├─ Pinia Store
└─ API Service
      └─ fetch
          └─ MSW Handler
              └─ Mock data + localStorage
```

- View와 Store는 MSW를 직접 호출하지 않고 `services/api.ts`의 `fetch` 함수를 사용합니다.
- MSW는 브라우저 네트워크 경계에서 요청을 처리하므로 실제 API로 교체할 때 View와 컴포넌트를 바꾸지 않습니다.
- 순수 포맷 함수는 `utils`, API와 도메인 계약은 `types`에 둡니다.
- 하나의 입력이나 펼침 상태는 Store로 올리지 않고 해당 컴포넌트의 로컬 상태로 유지합니다.

## 구조를 나누는 기준

다음 중 하나에 해당할 때 파일이나 폴더를 분리합니다.

- 둘 이상의 화면에서 같은 UI나 로직을 사용합니다.
- 한 파일이 데이터 조회, 표시, 변경 등 둘 이상의 책임을 가집니다.
- 독립된 테스트로 계약을 설명할 가치가 있습니다.
- 변경 이유와 영향 범위가 기존 파일과 명확히 다릅니다.

단순히 파일 수를 늘리거나 일반적인 프로젝트 구조처럼 보이기 위해 분리하지 않습니다.
