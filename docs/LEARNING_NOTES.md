# Vue 학습 노트

이 문서는 일반적인 Vue 이론을 복사하는 곳이 아닙니다. 실제 구현에서 사용한 개념, 사용한 파일, React 경험과의 차이, 선택 이유를 연결해 기록합니다.

현재는 구현 전 학습 기준이며, 코드가 추가될 때 `예정`을 `적용`으로 바꾸고 실제 파일과 사례를 기록합니다.

## 1. Vue Single-File Component

- 상태: 예정
- 확인할 내용:
  - `<script setup lang="ts">`, `<template>`, `<style scoped>`의 역할
  - 하나의 SFC 안에서 로직, 마크업, 스타일을 함께 관리하는 방식
  - React의 TSX 컴포넌트와 비교했을 때 Template이 갖는 차이
- 적용 파일: 구현 후 기록

## 2. ref와 reactive

- 상태: 예정
- 사용할 사례:
  - 검색 입력값
  - 운영 메모
  - 모바일 필터 열림 여부
- React 비교:
  - `ref`는 `.value`를 통해 값을 변경하지만 Template에서는 자동으로 언래핑됩니다.
  - React의 `useState`는 setter로 새 값을 전달하고 다시 렌더링합니다.
- 적용 파일: 구현 후 기록

## 3. computed

- 상태: 예정
- 사용할 사례:
  - 활성화된 필터 개수
  - 문의 상태에 따른 표시 정보
  - Store 데이터를 기반으로 한 파생 상태
- React 비교:
  - Vue `computed`는 반응형 의존성을 추적해 파생 값을 캐시합니다.
  - React에서는 일반 계산이나 `useMemo`를 상황에 따라 사용합니다.
- 적용 파일: 구현 후 기록

## 4. watch와 watchEffect

- 상태: 예정
- 사용할 사례:
  - URL Query Parameter 변경에 맞춘 목록 재조회
  - 검색어 Debounce 이후 Query 갱신
- React 비교:
  - Vue `watch`는 명시한 반응형 소스의 변화를 관찰합니다.
  - `watchEffect`는 실행 중 읽은 반응형 의존성을 자동으로 추적합니다.
  - React `useEffect`는 렌더링 이후 외부 시스템과 동기화하고 의존성 배열을 사용합니다.
- 주의:
  - 파생 값 계산을 위해 `watch`를 남용하지 않고 `computed`를 우선합니다.
- 적용 파일: 구현 후 기록

## 5. Props와 Emit

- 상태: 예정
- 사용할 사례:
  - 목록 화면이 필터 값을 `InquiryFilterBar`에 Props로 전달
  - 필터 컴포넌트가 변경 내용을 Emit
  - 상태 선택 컴포넌트가 선택 결과를 부모에 전달
- React 비교:
  - Vue는 Props와 Emit으로 입력과 출력 계약을 구분합니다.
  - React는 Props로 값과 Callback을 함께 전달하는 방식이 일반적입니다.
- 적용 파일: 구현 후 기록

## 6. Pinia

- 상태: 예정
- 사용할 사례:
  - 문의 목록과 상세 조회
  - 상태·담당자 변경 이후 공유 데이터 갱신
  - 로딩과 API 오류 상태
- React 비교:
  - Pinia Store는 state, getters, actions를 중심으로 공유 상태를 구성합니다.
  - React Context는 값을 트리에 공급하며, 복잡한 서버 상태나 액션은 별도 상태 관리 도구와 함께 사용하기도 합니다.
- 주의:
  - 메모 입력값처럼 지역적인 값은 Store에 넣지 않습니다.
- 적용 파일: 구현 후 기록

## 7. Vue Router

- 상태: 예정
- 사용할 사례:
  - 대시보드, 문의 목록, 문의 상세 라우트
  - 상세 화면 Lazy Loading
  - 문의 목록 필터와 URL Query 동기화
- React 비교:
  - 라우트 구성 방식은 React Router와 유사하지만 Vue 컴포넌트와 Composition API용 Router 함수를 사용합니다.
- 적용 파일: 구현 후 기록

## 8. 생명주기와 정리

- 상태: 예정
- 확인할 내용:
  - `onMounted`, `onUnmounted`
  - 요청 취소와 이벤트 리스너 정리
  - JavaScript `resize` 이벤트와 CSS 미디어 쿼리의 역할 차이
- 원칙:
  - 레이아웃 변경은 CSS로 처리합니다.
  - 이벤트를 등록한다면 같은 컴포넌트 생명주기에서 반드시 해제합니다.
- 적용 파일: 구현 후 기록

## 9. 구현 후 답할 수 있어야 하는 질문

- 왜 Vue의 모든 상태를 Pinia에 넣지 않았나요?
- `computed`와 메서드의 차이는 무엇인가요?
- `watch`와 `watchEffect`, React `useEffect`는 어떻게 다른가요?
- Props를 직접 변경하면 안 되는 이유는 무엇인가요?
- 상세 라우트를 Lazy Loading한 이유는 무엇인가요?
- CSS 미디어 쿼리와 `resize` 이벤트는 각각 언제 사용하나요?
- API 요청이 빠르게 연속 발생할 때 이전 요청을 어떻게 처리했나요?
- MSW를 사용했지만 실제 API와 교체 가능한 이유는 무엇인가요?

## 10. 구현 회고

구현 완료 후 다음 내용을 사실 기반으로 작성합니다.

- React 경험이 Vue 학습에 도움이 된 부분
- Template과 JSX에서 가장 다르게 느낀 부분
- Composition API를 사용하며 이해가 바뀐 부분
- 처음 설계와 실제 구현이 달라진 부분
- 다시 구현한다면 개선할 부분
