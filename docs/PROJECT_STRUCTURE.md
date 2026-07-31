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
│  │  ├─ common/
│  │  │  ├─ ErrorState.vue
│  │  │  ├─ PriorityBadge.vue
│  │  │  └─ StatusBadge.vue
│  │  ├─ dashboard/
│  │  │  ├─ DashboardSkeleton.vue
│  │  │  ├─ DashboardSummaryCard.vue
│  │  │  ├─ PriorityDistribution.vue
│  │  │  └─ RecentInquiryList.vue
│  │  ├─ inquiry/
│  │  │  ├─ InquiryCardList.vue
│  │  │  ├─ InquiryDetailSkeleton.vue
│  │  │  ├─ InquiryFilterBar.vue
│  │  │  ├─ InquiryListSkeleton.vue
│  │  │  ├─ InquiryManagementPanel.vue
│  │  │  ├─ InquiryNotes.vue
│  │  │  ├─ InquiryOverview.vue
│  │  │  ├─ InquiryTable.vue
│  │  │  ├─ InquiryTimeline.vue
│  │  │  └─ PaginationControls.vue
│  │  └─ layout/
│  │     ├─ AppShell.vue
│  │     ├─ AppHeader.vue
│  │     └─ Navigation.vue
│  ├─ mocks/
│  │  ├─ browser.ts
│  │  ├─ data.ts
│  │  ├─ handlers.ts
│  │  └─ storage.ts
│  ├─ router/
│  │  └─ index.ts
│  ├─ services/
│  │  └─ api.ts
│  ├─ stores/
│  │  └─ inquiry.ts
│  ├─ types/
│  │  ├─ api.ts
│  │  └─ inquiry.ts
│  ├─ utils/
│  │  ├─ clone.ts
│  │  ├─ date.ts
│  │  ├─ inquiry-query.ts
│  │  └─ inquiry.ts
│  ├─ views/
│  │  ├─ DashboardView.vue
│  │  ├─ InquiryListView.vue
│  │  ├─ InquiryDetailView.vue
│  │  └─ NotFoundView.vue
│  ├─ App.vue
│  ├─ main.ts
│  └─ vite-env.d.ts
├─ tests/
│  ├─ accessibility/
│  │  └─ color-contrast.spec.ts
│  ├─ components/
│  │  ├─ AppShell.spec.ts
│  │  ├─ DashboardView.spec.ts
│  │  ├─ InquiryDetailView.spec.ts
│  │  └─ InquiryListView.spec.ts
│  ├─ mocks/
│  │  └─ server.ts
│  ├─ integration/
│  │  ├─ core-flows.spec.ts
│  │  └─ mock-api.spec.ts
│  ├─ stores/
│  │  └─ inquiry.spec.ts
│  ├─ utils/
│  │  └─ clone.spec.ts
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
- `common`은 상태·우선순위 Badge와 오류·재시도처럼 여러 화면에서 재사용하는 UI입니다.
- `dashboard`는 요약 카드, 최근 문의, 우선순위 분포, Skeleton처럼 운영 현황 화면에만 필요한 UI입니다.
- `inquiry`는 검색·필터·목록과 상세 본문, 처리 폼, 운영 메모, 처리 이력, 로딩 UI를 담당합니다.
- `layout`은 모든 화면이 공유하는 앱 셸과 내비게이션, 본문 바로가기와 시맨틱 랜드마크를 담당합니다.

### `src/router`

- URL, 화면 컴포넌트, 페이지 제목, 스크롤 복원과 경로 이동 후 첫 제목 포커스를 관리합니다.
- 서버 데이터나 화면 표시 로직을 넣지 않습니다.

### `src/mocks`

- 브라우저와 테스트가 공유하는 MSW 요청 핸들러를 관리합니다.
- `browser.ts`는 Service Worker 실행만 담당합니다.
- `data.ts`는 상대 시각 기반 초기 문의 24건과 담당자를 구성합니다.
- `storage.ts`는 버전이 있는 `localStorage` 영속화와 복구를 담당합니다.
- `handlers.ts`는 조회·수정·입력 검증·오류·지연을 포함한 REST 경계를 담당합니다.

### `src/services`

- 화면과 Store가 사용하는 `fetch` 요청 함수를 관리합니다.
- 실패 응답은 상태 코드와 오류 코드를 보존한 `ApiError`로 변환합니다.
- 요청 함수는 `AbortSignal`을 전달할 수 있어 화면에서 오래된 요청을 취소할 수 있습니다.

### `src/stores`

- 여러 문의 화면이 공유할 목록·상세 데이터와 페이지네이션, 조회·변경 상태를 Pinia로 관리합니다.
- 새 조회를 시작하면 이전 요청을 취소하고 요청 식별자를 확인해 오래된 응답이 최신 상태를 덮지 않게 합니다.
- 상태·담당자·메모 변경 결과를 상세 원본과 이미 조회한 목록 항목에 함께 반영합니다.
- 검색 입력과 모바일 필터 열림 여부처럼 화면에만 필요한 값은 Store에 넣지 않습니다.

### `src/types`

- 문의 도메인과 API 응답 계약을 한곳에서 관리합니다.
- 상태·우선순위·카테고리는 문자열 리터럴 유니온과 런타임 검사 함수를 함께 제공합니다.

### `src/utils`

- `inquiry.ts`는 도메인 코드와 한글 표시 문구를 연결합니다.
- `inquiry-query.ts`는 URL Query를 검증·정규화하고 API Query와 공유 가능한 URL 형식으로 변환합니다.
- `date.ts`는 문의 시각을 상대 시각과 접근 가능한 절대 시각으로 변환합니다.
- `clone.ts`는 JSON 직렬화 가능한 Mock 데이터의 독립된 복사본을 만들며 `structuredClone` 미지원 환경을 보완합니다.

### `src/assets/styles`

- `reset.css`: 브라우저 기본 스타일 차이 축소
- `tokens.css`: 색상, 간격, 크기, 반경 등 공통 디자인 값
- `global.css`: 문서 전체와 페이지 공통 스타일
- 컴포넌트에만 필요한 스타일은 해당 SFC의 `<style scoped>`에 둡니다.

### `tests`

- `accessibility`: 디자인 토큰과 상태·우선순위 색상 조합의 명도 대비
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
