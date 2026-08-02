# Vue 학습 노트

이 문서는 일반적인 Vue 이론을 복사하는 곳이 아닙니다. 실제 구현에서 사용한 개념, 사용한 파일, React 경험과의 차이, 선택 이유를 연결해 기록합니다.

현재는 구현 전 학습 기준이며, 코드가 추가될 때 `예정`을 `적용`으로 바꾸고 실제 파일과 사례를 기록합니다.

## 1. Vue Single-File Component

- 상태: 적용
- 적용 파일:
  - `src/components/layout/AppShell.vue`
  - `src/components/layout/Navigation.vue`
  - `src/views/InquiryDetailView.vue`
- 구현 경험:
  - `<script setup lang="ts">`에서 컴포넌트 import와 라우트 접근 로직을 작성하고, `<template>`에서 선언적으로 화면 구조를 표현했습니다.
  - 컴포넌트에만 필요한 반응형 레이아웃과 상태 스타일은 `<style scoped>`에 두고 전역 디자인 값은 CSS Token으로 분리했습니다.
- React 비교:
  - React TSX는 JavaScript 표현식 안에서 UI를 구성하지만 Vue SFC는 Template, 로직, 스타일의 역할이 구획으로 드러납니다.
  - Vue Template에서는 `v-for`, `:to` 같은 Directive로 반복과 속성 바인딩을 표현합니다.

## 2. ref와 reactive

- 상태: 적용
- 적용 파일: `src/views/DashboardView.vue`, `src/views/InquiryListView.vue`, `src/views/InquiryDetailView.vue`, `src/components/inquiry/InquiryFilterBar.vue`, `src/components/inquiry/InquiryManagementPanel.vue`
- 적용 사례:
  - API 결과, 최초 로딩, 오류 메시지를 각각 `ref`로 관리했습니다.
  - Template에서는 `.value` 없이 값을 읽고, 스크립트에서 요청 결과를 변경할 때는 `.value`를 사용했습니다.
  - 문의 목록 검색 입력값과 모바일 필터 열림 여부를 화면에 가까운 로컬 `ref`로 관리했습니다.
  - 상세 화면의 메모 입력·검증·성공 알림과 처리 폼의 선택값도 저장 전 로컬 `ref`로 유지했습니다.
- React 비교:
  - `ref`는 `.value`를 통해 값을 변경하지만 Template에서는 자동으로 언래핑됩니다.
  - React의 `useState`는 setter로 새 값을 전달하고 다시 렌더링합니다.

## 3. computed

- 상태: 적용
- 적용 파일: `src/views/DashboardView.vue`, `src/views/InquiryListView.vue`, `src/views/InquiryDetailView.vue`, `src/components/inquiry/InquiryManagementPanel.vue`
- 적용 사례:
  - API 응답의 통계 값을 요약 카드 Props 배열로 변환했습니다.
  - 원본 응답을 복사해 별도 상태로 유지하지 않고 `dashboard`가 바뀌면 카드 정보가 함께 갱신되게 했습니다.
  - 정규화한 URL Query, 활성화된 필터 개수, 빈 결과 안내 문구를 원본 상태에서 파생했습니다.
  - 상세 API 오류가 404인지와 처리 폼에 실제 변경 사항이 있는지를 원본 상태에서 파생했습니다.
- React 비교:
  - Vue `computed`는 반응형 의존성을 추적해 파생 값을 캐시합니다.
  - React에서는 일반 계산이나 `useMemo`를 상황에 따라 사용합니다.

## 4. watch와 watchEffect

- 상태: 적용
- 적용 파일: `src/views/InquiryListView.vue`, `src/views/InquiryDetailView.vue`, `src/components/inquiry/InquiryManagementPanel.vue`
- 적용 사례:
  - URL Query 변경을 관찰해 목록을 다시 조회하고 검색 입력값을 복원했습니다.
  - 검색 입력은 350ms 타이머가 지난 뒤 URL Query를 갱신하고, Query 변경이 실제 조회를 시작하게 했습니다.
  - 상세 라우트 ID 변경을 관찰해 새 문의를 조회하고, 저장 성공으로 확정 원본이 바뀌면 처리 폼의 선택값을 동기화했습니다.
- React 비교:
  - Vue `watch`는 명시한 반응형 소스의 변화를 관찰합니다.
  - `watchEffect`는 실행 중 읽은 반응형 의존성을 자동으로 추적합니다.
  - React `useEffect`는 렌더링 이후 외부 시스템과 동기화하고 의존성 배열을 사용합니다.
- 주의:
  - 파생 값 계산을 위해 `watch`를 남용하지 않고 `computed`를 우선합니다.

## 5. Props와 Emit

- 상태: 적용
- 적용 파일:
  - `src/components/dashboard/DashboardSummaryCard.vue`
  - `src/components/dashboard/RecentInquiryList.vue`
  - `src/components/common/ErrorState.vue`
  - `src/components/inquiry/InquiryFilterBar.vue`
  - `src/components/inquiry/PaginationControls.vue`
  - `src/components/inquiry/InquiryManagementPanel.vue`
  - `src/components/inquiry/InquiryNotes.vue`
- 적용 사례:
  - 대시보드가 통계와 문의 배열을 Props로 전달하고 하위 컴포넌트는 이를 표시만 합니다.
  - `ErrorState`는 다시 시도 동작을 `retry`로 Emit하고 실제 API 재호출은 부모가 담당합니다.
  - 목록 화면이 필터 값을 Props로 전달하고 `InquiryFilterBar`는 검색·필터 변경과 초기화를 Emit합니다.
  - `PaginationControls`는 현재 페이지 정보를 받아 유효한 페이지 변경만 Emit합니다.
  - 상세 처리와 메모 컴포넌트는 원본·저장 상태를 Props로 받고 저장 의도와 입력 변경을 Emit합니다.
- React 비교:
  - Vue는 Props와 Emit으로 입력과 출력 계약을 구분합니다.
  - React는 Props로 값과 Callback을 함께 전달하는 방식이 일반적입니다.

## 6. Pinia

- 상태: 적용
- 적용 파일: `src/stores/inquiry.ts`
- 적용 사례:
  - 문의 목록, 페이지네이션, 로딩과 API 오류 상태를 관리합니다.
  - 이전 요청을 취소하고 요청 식별자를 비교해 늦게 도착한 응답이 최신 목록을 덮지 않게 했습니다.
  - 상세 문의와 담당자, 저장 중 상태를 공유하고 상태·담당자·메모 변경 결과를 목록 항목에도 동기화했습니다.
- React 비교:
  - Pinia Store는 state, getters, actions를 중심으로 공유 상태를 구성합니다.
  - React Context는 값을 트리에 공급하며, 복잡한 서버 상태나 액션은 별도 상태 관리 도구와 함께 사용하기도 합니다.
- 주의:
  - 메모 입력값처럼 지역적인 값은 Store에 넣지 않습니다.

## 7. Vue Router

- 상태: 적용
- 적용 파일: `src/router/index.ts`, `src/App.vue`, `src/views/InquiryListView.vue`, `src/utils/inquiry-query.ts`
- 적용 사례:
  - 대시보드, 문의 목록, 문의 상세, 404 라우트 구성
  - 상세와 404 화면을 동적 import로 Lazy Loading
  - 라우트 `meta.title`을 이용한 문서 제목 변경
  - 실제 경로 이동 후 `main`의 첫 `h1`으로 포커스를 옮겨 새 화면의 시작점을 전달
  - 최초 직접 접속과 URL Query 변경에서는 기존 포커스를 유지하고, Lazy 화면은 제목 렌더링을 제한적으로 재확인
  - 문의 목록 필터를 URL Query와 동기화하고 새로고침·앞뒤 이동 시 조건을 복원
- React 비교:
  - 라우트 구성 방식은 React Router와 유사하지만 Vue 컴포넌트와 Composition API용 Router 함수를 사용합니다.

## 8. 생명주기와 정리

- 상태: 적용
- 확인할 내용:
  - `onMounted`, `onUnmounted`
  - 요청 취소와 이벤트 리스너 정리
  - JavaScript `resize` 이벤트와 CSS 미디어 쿼리의 역할 차이
- 원칙:
  - 레이아웃 변경은 CSS로 처리합니다.
  - 이벤트를 등록한다면 같은 컴포넌트 생명주기에서 반드시 해제합니다.
- 적용 사례:
  - `src/components/layout/AppShell.vue`는 `resize` 이벤트 없이 미디어 쿼리로 상단 내비게이션과 데스크톱 사이드바를 전환합니다.
  - `src/views/DashboardView.vue`는 `onMounted`에서 조회를 시작하고 `onUnmounted`에서 진행 중인 요청을 취소합니다.
  - `src/views/InquiryDetailView.vue`는 라우트 ID 변경 시 조회하고 화면 이탈 시 상세 조회와 변경 요청을 취소하며 상태를 정리합니다.

## 9. TypeScript 데이터 모델링과 API 경계

- 상태: 적용
- 적용 파일:
  - `src/types/inquiry.ts`
  - `src/types/api.ts`
  - `src/services/api.ts`
  - `src/mocks/handlers.ts`
- 구현 경험:
  - 상태·우선순위·카테고리를 문자열 리터럴 유니온으로 제한하고, URL과 JSON처럼 실행 중 들어오는 값은 별도의 타입 검사 함수로 검증했습니다.
  - `PaginatedResponse<T>`로 목록 응답의 공통 형태를 표현하고, 실패 응답은 `ApiError`로 변환해 화면이 MSW 응답 구조를 직접 해석하지 않게 했습니다.
  - 모든 요청 함수에 `AbortSignal`을 전달할 수 있게 만들어 이후 검색 요청 경합과 컴포넌트 해제 시 취소에 사용할 수 있습니다.
- 학습:
  - TypeScript 타입은 컴파일 시점만 보호하므로 외부 입력은 런타임 검증도 필요합니다.
  - MSW 핸들러와 화면 사이에 fetch 서비스 경계를 두면 실제 백엔드로 교체해도 호출부의 계약을 유지하기 쉽습니다.

## 10. 반응형과 접근성

- 상태: 적용
- 적용 파일: `src/components/layout/AppShell.vue`, `src/router/index.ts`, `src/assets/styles`, `tests/accessibility/color-contrast.spec.ts`
- 구현 경험:
  - JavaScript `resize` 이벤트 없이 CSS 미디어 쿼리로 `767px` 이하 모바일, `768px~1199px` 태블릿, `1200px` 이상 데스크톱 레이아웃을 구성했습니다.
  - 본문 바로가기, `header`·`nav`·`main` 랜드마크, 현재 메뉴의 `aria-current`, 폼의 접근 가능한 이름과 상태 알림의 `aria-live`를 적용했습니다.
  - 실제 경로가 바뀌면 첫 제목으로 포커스를 옮기되, 최초 접속과 Query 변경에서는 사용자의 현재 포커스를 유지했습니다.
  - 밝은 화면과 어두운 내비게이션에 맞는 포커스 토큰을 분리하고 텍스트·Badge 색상 대비를 테스트로 고정했습니다.
  - `prefers-reduced-motion` 사용자의 애니메이션과 전환 시간을 전역에서 축소했습니다.
- 수동 검증:
  - `1199px/1200px`, `767px/768px` 경계에서 내비게이션과 콘텐츠 열 전환을 확인했습니다.
  - `390px`과 최소 `320px` 너비에서 목록·상세·대시보드의 터치 영역과 가로 넘침을 확인했습니다.

## 11. 실제 의존성을 연결한 통합 테스트

- 상태: 적용
- 적용 파일: `tests/integration/core-flows.spec.ts`
- 구현 경험:
  - `App.vue`를 메모리 Router, 실제 Pinia, MSW와 함께 마운트해 대시보드 → 목록 → 상세 → 목록 → 대시보드 흐름을 하나의 테스트에서 검증했습니다.
  - 상세 화면에서 상태와 담당자를 변경한 뒤 새 Pinia와 Router로 앱을 다시 마운트해 `localStorage` 복원을 실제 새로고침과 가까운 조건으로 확인했습니다.
  - 일시적인 목록 API 실패 후 다시 시도할 때 현재 URL Query와 필터 UI가 유지되는지 검증했습니다.
- 테스트 경계:
  - 개별 컴포넌트 테스트에서 이미 확인한 입력 검증과 렌더링을 반복하지 않고, 화면·Store·API 사이 계약이 끊길 수 있는 흐름만 추가했습니다.
  - 브라우저에서는 실제 새로고침과 390px 가로 넘침을 별도로 확인해 jsdom이 검증하지 못하는 동작을 보완했습니다.

## 12. 구현 후 답할 수 있어야 하는 질문

- 왜 Vue의 모든 상태를 Pinia에 넣지 않았나요?
- `computed`와 메서드의 차이는 무엇인가요?
- `watch`와 `watchEffect`, React `useEffect`는 어떻게 다른가요?
- Props를 직접 변경하면 안 되는 이유는 무엇인가요?
- 상세 라우트를 Lazy Loading한 이유는 무엇인가요?
- CSS 미디어 쿼리와 `resize` 이벤트는 각각 언제 사용하나요?
- 최초 직접 접속에서는 제목 포커스를 강제하지 않고 경로 이동에서만 옮기는 이유는 무엇인가요?
- Lazy Loading 화면의 제목 포커스를 제한적으로 다시 찾는 이유는 무엇인가요?
- API 요청이 빠르게 연속 발생할 때 이전 요청을 어떻게 처리했나요?
- MSW를 사용했지만 실제 API와 교체 가능한 이유는 무엇인가요?
- 컴포넌트 테스트와 화면을 가로지르는 통합 테스트의 책임을 어떻게 나눴나요?
- 새 Pinia와 Router로 앱을 다시 마운트한 테스트가 무엇을 검증하나요?

## 13. 구현 회고

- React에서 익힌 컴포넌트 분리와 단방향 데이터 흐름은 Vue에서도 그대로 활용할 수 있었습니다. 다만 Vue에서는 Props와 Emit으로 입력과 출력을 구분하고, Template Directive로 화면 조건을 표현하는 방식이 더 명시적으로 느껴졌습니다.
- JSX는 JavaScript 표현식 안에서 UI를 구성하지만 Vue SFC는 Template·로직·스타일의 영역이 구분됩니다. 작은 화면 상태는 Template에서 읽기 쉬웠고, 복잡한 파생 로직은 `computed`로 스크립트에 이름을 붙이는 편이 이해하기 쉬웠습니다.
- 처음에는 React의 `useEffect`처럼 변화를 대부분 `watch`로 처리할 수 있다고 생각했지만, 구현하면서 파생 값은 `computed`, URL·라우트 ID처럼 외부 시스템과의 동기화만 `watch`에 두는 기준이 생겼습니다.
- 초기 설계보다 URL Query와 요청 경합 처리가 중요했습니다. 필터 값을 Pinia에 중복 저장하지 않고 URL을 단일 기준으로 정리하면서 새로고침과 앞·뒤 이동 동작이 단순해졌습니다.
- 다시 구현한다면 실제 백엔드 계약과 브라우저 E2E 테스트를 추가하고, 배포 환경에서 SPA fallback과 Mock 사용 여부를 분리해 검증하겠습니다.

## 14. 코드를 읽기 위한 주석 기준

- 상태: 적용
- 적용 범위: `src`의 진입점, Router, View, Pinia Store, API, MSW와 주요 UI 컴포넌트
- 적용 기준:
  - 코드 문장을 그대로 한국어로 반복하지 않고 데이터의 출처, 이동 방향과 처리 이유를 설명합니다.
  - `ref`, `computed`, `watch`, Props와 Emit은 화면에서 담당하는 상태와 부모·자식 사이의 역할을 함께 기록합니다.
  - 요청 취소, 오래된 응답 방지, URL Query 동기화와 런타임 검증처럼 코드만 보고 의도를 알기 어려운 경계를 우선 설명합니다.
  - 단순한 HTML 구조, 명확한 조건과 반복되는 스타일에는 주석을 추가하지 않습니다.
- 추천 읽기 순서:
  1. `src/main.ts`에서 애플리케이션 시작 과정을 확인합니다.
  2. `src/App.vue`와 `src/router/index.ts`에서 URL에 따라 화면이 선택되는 과정을 확인합니다.
  3. `src/views`에서 사용자 동작이 Store와 하위 컴포넌트로 전달되는 과정을 확인합니다.
  4. `src/stores/inquiry.ts`와 `src/services/api.ts`에서 상태와 API 요청 흐름을 확인합니다.
  5. `src/mocks/handlers.ts`와 `src/mocks/storage.ts`에서 요청이 가상 서버와 저장소에서 처리되는 과정을 확인합니다.
