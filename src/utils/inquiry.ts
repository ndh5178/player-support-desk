import type { InquiryCategory, InquiryPriority, InquiryStatus } from '../types/inquiry'

const statusLabels = {
  NEW: '신규',
  IN_PROGRESS: '처리 중',
  WAITING_CUSTOMER: '고객 답변 대기',
  RESOLVED: '해결',
} satisfies Record<InquiryStatus, string>

const priorityLabels = {
  URGENT: '긴급',
  HIGH: '높음',
  NORMAL: '보통',
  LOW: '낮음',
} satisfies Record<InquiryPriority, string>

const categoryLabels = {
  ACCOUNT: '계정',
  PAYMENT: '결제',
  GAME_ERROR: '게임 오류',
  REPORT: '신고',
  INSTALLATION: '설치 및 실행',
  OTHER: '기타',
} satisfies Record<InquiryCategory, string>

export function getStatusLabel(status: InquiryStatus): string {
  return statusLabels[status]
}

export function getPriorityLabel(priority: InquiryPriority): string {
  return priorityLabels[priority]
}

export function getCategoryLabel(category: InquiryCategory): string {
  return categoryLabels[category]
}
