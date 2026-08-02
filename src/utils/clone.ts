export function cloneSerializable<T>(value: T): T {
  // Mock 데이터는 복사본을 반환해 화면의 수정이 저장소 원본을 직접 바꾸지 않게 한다.
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value)
  }

  // 이 프로젝트의 Mock 데이터는 JSON 값만 가지므로 구형 환경에서는 이 방식으로 대체할 수 있다.
  return JSON.parse(JSON.stringify(value)) as T
}
