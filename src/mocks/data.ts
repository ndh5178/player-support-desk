import type {
  Agent,
  Customer,
  Inquiry,
  InquiryCategory,
  InquiryHistory,
  InquiryNote,
  InquiryPriority,
  InquiryStatus,
} from '@/types/inquiry'

const HOUR_IN_MS = 60 * 60 * 1000

export const CURRENT_AGENT_ID = 'agent-001'

export const agents = [
  { id: CURRENT_AGENT_ID, name: '김서윤', team: 'Player Care' },
  { id: 'agent-002', name: '박민준', team: 'Technical Support' },
  { id: 'agent-003', name: 'Avery Chen', team: 'Account & Payment' },
  { id: 'agent-004', name: 'Mina Patel', team: 'Safety Operations' },
] as const satisfies readonly Agent[]

const customers = [
  {
    id: 'customer-001',
    nickname: 'CloudRider',
    email: 'cloud.rider@example.com',
    countryCode: 'KR',
    countryName: '대한민국',
    languageCode: 'ko',
    languageName: '한국어',
  },
  {
    id: 'customer-002',
    nickname: 'MapleFox',
    email: 'maple.fox@example.com',
    countryCode: 'CA',
    countryName: '캐나다',
    languageCode: 'en',
    languageName: '영어',
  },
  {
    id: 'customer-003',
    nickname: 'LunaByte',
    email: 'luna.byte@example.com',
    countryCode: 'JP',
    countryName: '일본',
    languageCode: 'ja',
    languageName: '일본어',
  },
  {
    id: 'customer-004',
    nickname: 'NordicRay',
    email: 'nordic.ray@example.com',
    countryCode: 'SE',
    countryName: '스웨덴',
    languageCode: 'en',
    languageName: '영어',
  },
  {
    id: 'customer-005',
    nickname: 'PixelMate',
    email: 'pixel.mate@example.com',
    countryCode: 'AU',
    countryName: '호주',
    languageCode: 'en',
    languageName: '영어',
  },
  {
    id: 'customer-006',
    nickname: 'RioSpark',
    email: 'rio.spark@example.com',
    countryCode: 'BR',
    countryName: '브라질',
    languageCode: 'pt-BR',
    languageName: '포르투갈어',
  },
  {
    id: 'customer-007',
    nickname: 'AlpineCat',
    email: 'alpine.cat@example.com',
    countryCode: 'DE',
    countryName: '독일',
    languageCode: 'de',
    languageName: '독일어',
  },
  {
    id: 'customer-008',
    nickname: 'CobaltWing',
    email: 'cobalt.wing@example.com',
    countryCode: 'US',
    countryName: '미국',
    languageCode: 'en',
    languageName: '영어',
  },
  {
    id: 'customer-009',
    nickname: 'SierraSol',
    email: 'sierra.sol@example.com',
    countryCode: 'MX',
    countryName: '멕시코',
    languageCode: 'es',
    languageName: '스페인어',
  },
  {
    id: 'customer-010',
    nickname: 'MetroPanda',
    email: 'metro.panda@example.com',
    countryCode: 'SG',
    countryName: '싱가포르',
    languageCode: 'en',
    languageName: '영어',
  },
  {
    id: 'customer-011',
    nickname: 'VelvetComet',
    email: 'velvet.comet@example.com',
    countryCode: 'FR',
    countryName: '프랑스',
    languageCode: 'fr',
    languageName: '프랑스어',
  },
  {
    id: 'customer-012',
    nickname: 'HarborStone',
    email: 'harbor.stone@example.com',
    countryCode: 'GB',
    countryName: '영국',
    languageCode: 'en',
    languageName: '영어',
  },
] as const satisfies readonly Customer[]

interface InquiryTemplate {
  // 반복되는 고객·이력 객체 대신 문의마다 달라지는 값만 초기 템플릿에 기록한다.
  id: string
  title: string
  content: string
  category: InquiryCategory
  priority: InquiryPriority
  status: InquiryStatus
  customerIndex: number
  assigneeId?: string
  createdHoursAgo: number
  slaHoursFromNow: number
  initialNote?: string
}

const inquiryTemplates: readonly InquiryTemplate[] = [
  {
    id: 'INQ-2026-0001',
    title: 'KRAFTON ID 인증 메일이 도착하지 않습니다',
    content:
      '새 PC에서 KRAFTON ID로 로그인하려고 했지만 인증 이메일을 여러 번 요청해도 수신되지 않습니다. 스팸함에도 메일이 없습니다.',
    category: 'ACCOUNT',
    priority: 'HIGH',
    status: 'NEW',
    customerIndex: 0,
    createdHoursAgo: 1,
    slaHoursFromNow: 3,
  },
  {
    id: 'INQ-2026-0002',
    title: 'G-Coin 상품이 두 번 결제되었습니다',
    content:
      'G-Coin 결제 완료 화면이 늦게 표시되어 버튼을 다시 눌렀고 카드 명세에 동일한 금액이 두 번 승인되었습니다.',
    category: 'PAYMENT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    customerIndex: 1,
    assigneeId: 'agent-003',
    createdHoursAgo: 6,
    slaHoursFromNow: -1,
    initialNote: '결제 승인 번호 두 건을 확인하고 있습니다.',
  },
  {
    id: 'INQ-2026-0003',
    title: '패치 후 로비 진입 시 검은 화면에서 멈춥니다',
    content:
      '오늘 업데이트 이후 로비에 진입하면 소리만 들리고 화면은 검은색으로 유지됩니다. Steam 파일 무결성 검사는 완료했습니다.',
    category: 'GAME_ERROR',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    customerIndex: 2,
    assigneeId: 'agent-002',
    createdHoursAgo: 8,
    slaHoursFromNow: 2,
    initialNote: '그래픽 설정 초기화 절차를 안내했습니다.',
  },
  {
    id: 'INQ-2026-0004',
    title: '스쿼드 음성 채팅에서 욕설한 플레이어를 신고합니다',
    content:
      '스쿼드 매치에서 같은 플레이어가 팀원에게 지속적으로 욕설했습니다. 경기 시각과 닉네임을 본문에 정리했습니다.',
    category: 'REPORT',
    priority: 'HIGH',
    status: 'NEW',
    customerIndex: 3,
    createdHoursAgo: 2,
    slaHoursFromNow: 6,
  },
  {
    id: 'INQ-2026-0005',
    title: 'Steam 패치 설치 중 디스크 공간 오류가 발생합니다',
    content:
      '설치 드라이브에 충분한 공간이 있지만 패치가 70%에서 중단되고 디스크 공간 부족 메시지가 표시됩니다.',
    category: 'INSTALLATION',
    priority: 'NORMAL',
    status: 'WAITING_CUSTOMER',
    customerIndex: 4,
    assigneeId: 'agent-002',
    createdHoursAgo: 20,
    slaHoursFromNow: 8,
    initialNote: '설치 로그와 드라이브 정보를 요청했습니다.',
  },
  {
    id: 'INQ-2026-0006',
    title: 'KRAFTON ID의 거주 국가를 변경하고 싶습니다',
    content:
      '최근 거주 국가가 바뀌어 프로필의 국가와 기본 언어를 변경하고 싶습니다. 필요한 확인 절차를 알려주세요.',
    category: 'ACCOUNT',
    priority: 'LOW',
    status: 'RESOLVED',
    customerIndex: 5,
    assigneeId: 'agent-001',
    createdHoursAgo: 72,
    slaHoursFromNow: -48,
    initialNote: '국가 변경 정책과 본인 확인 절차를 안내했습니다.',
  },
  {
    id: 'INQ-2026-0007',
    title: '구매한 무기 스킨이 보관함에 지급되지 않았습니다',
    content:
      '상점에서 무기 스킨을 구매했고 G-Coin 차감도 확인했지만 게임 내 보관함에는 아이템이 표시되지 않습니다.',
    category: 'PAYMENT',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    customerIndex: 6,
    assigneeId: 'agent-003',
    createdHoursAgo: 12,
    slaHoursFromNow: -2,
    initialNote: '상품 지급 내역과 거래 로그를 대조하고 있습니다.',
  },
  {
    id: 'INQ-2026-0008',
    title: '경기 시작 직후 매치 서버 연결이 종료됩니다',
    content:
      '로비에서는 문제가 없지만 매치가 시작되면 1분 안에 연결이 종료됩니다. 다른 온라인 서비스는 정상입니다.',
    category: 'GAME_ERROR',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    customerIndex: 7,
    assigneeId: 'agent-002',
    createdHoursAgo: 4,
    slaHoursFromNow: 1,
    initialNote: '네트워크 진단 파일을 분석 중입니다.',
  },
  {
    id: 'INQ-2026-0009',
    title: '부정행위 신고 결과를 확인하고 싶습니다',
    content:
      '일주일 전에 비정상 플레이 사용자를 신고했습니다. 신고가 접수되었는지와 확인이 끝났는지 알고 싶습니다.',
    category: 'REPORT',
    priority: 'LOW',
    status: 'WAITING_CUSTOMER',
    customerIndex: 8,
    assigneeId: 'agent-004',
    createdHoursAgo: 30,
    slaHoursFromNow: 10,
    initialNote: '개별 제재 결과는 공유하기 어렵다는 정책을 안내했습니다.',
  },
  {
    id: 'INQ-2026-0010',
    title: 'Steam 업데이트가 계속 처음부터 다시 시작됩니다',
    content:
      '업데이트가 완료된 것처럼 보인 뒤 런처를 다시 열면 같은 파일을 처음부터 다시 내려받습니다.',
    category: 'INSTALLATION',
    priority: 'NORMAL',
    status: 'NEW',
    customerIndex: 9,
    createdHoursAgo: 3,
    slaHoursFromNow: 9,
  },
  {
    id: 'INQ-2026-0011',
    title: 'KRAFTON ID 비밀번호 재설정 링크가 만료됩니다',
    content:
      '메일을 받은 직후 링크를 열어도 만료된 링크라는 메시지가 표시됩니다. 다른 브라우저에서도 동일합니다.',
    category: 'ACCOUNT',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    customerIndex: 10,
    assigneeId: 'agent-001',
    createdHoursAgo: 15,
    slaHoursFromNow: 5,
    initialNote: '이전 재설정 요청을 만료시키고 새 링크를 발급했습니다.',
  },
  {
    id: 'INQ-2026-0012',
    title: 'G-Coin 환불 요청 상태를 확인하고 싶습니다',
    content:
      '웹사이트에서 환불을 신청한 지 사흘이 지났지만 진행 상태가 바뀌지 않아 확인을 요청합니다.',
    category: 'PAYMENT',
    priority: 'NORMAL',
    status: 'WAITING_CUSTOMER',
    customerIndex: 11,
    assigneeId: 'agent-003',
    createdHoursAgo: 50,
    slaHoursFromNow: 12,
    initialNote: '결제 수단에 따른 환불 처리 기간을 안내했습니다.',
  },
  {
    id: 'INQ-2026-0013',
    title: 'DirectX 오류와 함께 게임이 강제 종료됩니다',
    content:
      '최신 드라이버 설치 후 게임을 실행하면 충돌 보고서가 표시됩니다. 이전 버전에서는 정상 실행되었습니다.',
    category: 'GAME_ERROR',
    priority: 'NORMAL',
    status: 'RESOLVED',
    customerIndex: 0,
    assigneeId: 'agent-002',
    createdHoursAgo: 96,
    slaHoursFromNow: -70,
    initialNote: '안정 버전 드라이버 설치 후 정상 실행을 확인했습니다.',
  },
  {
    id: 'INQ-2026-0014',
    title: '부적절한 배틀그라운드 닉네임을 신고합니다',
    content:
      '공개 채널에서 혐오 표현이 포함된 닉네임을 확인했습니다. 사용자 식별 정보와 확인 시각을 전달합니다.',
    category: 'REPORT',
    priority: 'NORMAL',
    status: 'RESOLVED',
    customerIndex: 1,
    assigneeId: 'agent-004',
    createdHoursAgo: 80,
    slaHoursFromNow: -50,
    initialNote: '운영 정책에 따라 닉네임 변경 조치를 완료했습니다.',
  },
  {
    id: 'INQ-2026-0015',
    title: 'Steam 설치 경로를 다른 드라이브로 옮기고 싶습니다',
    content:
      '전체 파일을 다시 내려받지 않고 설치 폴더를 다른 드라이브로 이동할 수 있는 방법이 있는지 문의합니다.',
    category: 'INSTALLATION',
    priority: 'LOW',
    status: 'RESOLVED',
    customerIndex: 2,
    assigneeId: 'agent-001',
    createdHoursAgo: 120,
    slaHoursFromNow: -90,
    initialNote: '런처의 설치 경로 변경 절차를 안내했습니다.',
  },
  {
    id: 'INQ-2026-0016',
    title: 'KRAFTON ID와 Steam 계정 연동을 해제하고 싶습니다',
    content:
      '더 이상 접근할 수 없는 외부 계정이 연결되어 있습니다. 본인 확인 후 연동을 해제하고 싶습니다.',
    category: 'ACCOUNT',
    priority: 'NORMAL',
    status: 'WAITING_CUSTOMER',
    customerIndex: 3,
    assigneeId: 'agent-001',
    createdHoursAgo: 28,
    slaHoursFromNow: -4,
    initialNote: '연동 해제에 필요한 본인 확인 항목을 요청했습니다.',
  },
  {
    id: 'INQ-2026-0017',
    title: 'G-Coin 결제 수단을 등록할 수 없습니다',
    content:
      '카드 정보를 올바르게 입력해도 결제 수단을 확인할 수 없다는 메시지가 표시됩니다.',
    category: 'PAYMENT',
    priority: 'HIGH',
    status: 'NEW',
    customerIndex: 4,
    createdHoursAgo: 5,
    slaHoursFromNow: 3,
  },
  {
    id: 'INQ-2026-0018',
    title: '스쿼드 음성 채팅이 몇 초마다 끊깁니다',
    content:
      '게임 소리는 정상이지만 팀 음성만 주기적으로 끊깁니다. 입력 장치를 바꿔도 문제가 계속됩니다.',
    category: 'GAME_ERROR',
    priority: 'NORMAL',
    status: 'WAITING_CUSTOMER',
    customerIndex: 5,
    assigneeId: 'agent-002',
    createdHoursAgo: 18,
    slaHoursFromNow: 7,
    initialNote: '음성 장치 설정 화면과 진단 파일을 요청했습니다.',
  },
  {
    id: 'INQ-2026-0019',
    title: '고의적인 팀킬 플레이어를 신고합니다',
    content:
      '경기 시작부터 같은 팀원을 반복적으로 공격하고 진행을 방해한 사용자의 확인을 요청합니다.',
    category: 'REPORT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    customerIndex: 6,
    assigneeId: 'agent-004',
    createdHoursAgo: 7,
    slaHoursFromNow: -0.5,
    initialNote: '경기 기록과 반복 신고 이력을 확인하고 있습니다.',
  },
  {
    id: 'INQ-2026-0020',
    title: '노트북에서 배틀그라운드를 실행할 수 있는지 궁금합니다',
    content: '공식 사양표에 없는 내장 그래픽 환경에서 실행 가능한지 확인하고 싶습니다.',
    category: 'INSTALLATION',
    priority: 'LOW',
    status: 'RESOLVED',
    customerIndex: 7,
    assigneeId: 'agent-001',
    createdHoursAgo: 140,
    slaHoursFromNow: -110,
    initialNote: '지원 사양과 예상 성능 범위를 안내했습니다.',
  },
  {
    id: 'INQ-2026-0021',
    title: '보호자 승인 KRAFTON ID의 이메일을 변경하고 싶습니다',
    content:
      '보호자 이메일을 더 이상 사용할 수 없어 새 이메일로 변경하려고 합니다. 필요한 서류가 궁금합니다.',
    category: 'ACCOUNT',
    priority: 'HIGH',
    status: 'NEW',
    customerIndex: 8,
    createdHoursAgo: 2.5,
    slaHoursFromNow: 5,
  },
  {
    id: 'INQ-2026-0022',
    title: 'G-Coin 가격이 지역 통화와 다르게 표시됩니다',
    content:
      '프로필 국가와 접속 지역은 동일하지만 상점의 일부 상품만 다른 통화로 표시됩니다.',
    category: 'PAYMENT',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    customerIndex: 9,
    assigneeId: 'agent-003',
    createdHoursAgo: 10,
    slaHoursFromNow: 6,
    initialNote: '계정의 결제 지역 설정을 확인하고 있습니다.',
  },
  {
    id: 'INQ-2026-0023',
    title: '매치메이킹 완료 직후 다시 로비로 돌아갑니다',
    content: '경쟁전 매칭이 완료된 직후 연결 오류가 표시되고 로비로 돌아갑니다.',
    category: 'GAME_ERROR',
    priority: 'NORMAL',
    status: 'RESOLVED',
    customerIndex: 10,
    assigneeId: 'agent-002',
    createdHoursAgo: 60,
    slaHoursFromNow: -35,
    initialNote: '손상된 캐시를 정리한 뒤 정상 매칭을 확인했습니다.',
  },
  {
    id: 'INQ-2026-0024',
    title: '생존자 패스 미션 보상이 지급되지 않았습니다',
    content:
      '이벤트 조건을 충족했고 완료 알림도 확인했지만 계정에 보상이 지급되지 않았습니다.',
    category: 'OTHER',
    priority: 'HIGH',
    status: 'NEW',
    customerIndex: 11,
    createdHoursAgo: 1.5,
    slaHoursFromNow: 4,
  },
]

function getAgent(agentId: string | undefined): Agent | null {
  if (!agentId) {
    return null
  }

  const matchingAgent = agents.find((agent) => agent.id === agentId)

  if (matchingAgent === undefined) {
    return null
  }

  return matchingAgent
}

function getEventTime(createdAt: Date, now: Date, progress: number): string {
  // 접수와 현재 시각 사이의 비율을 사용해 배정·상태 변경·메모 시각을 자연스럽게 배치한다.
  const elapsed = Math.max(now.getTime() - createdAt.getTime(), 0)
  return new Date(createdAt.getTime() + elapsed * progress).toISOString()
}

function createHistory(
  template: InquiryTemplate,
  createdAt: Date,
  now: Date,
  assignee: Agent | null,
): InquiryHistory[] {
  let createdActorName = 'System'

  if (template.customerIndex >= 0) {
    createdActorName = '고객'
  }

  const history: InquiryHistory[] = [
    {
      id: `${template.id}-history-created`,
      type: 'CREATED',
      actorName: createdActorName,
      description: '고객 문의가 접수되었습니다.',
      createdAt: createdAt.toISOString(),
    },
  ]

  if (assignee) {
    history.push({
      id: `${template.id}-history-assignee`,
      type: 'ASSIGNEE_CHANGED',
      actorName: '자동 배정',
      description: `${assignee.name} 담당자에게 배정되었습니다.`,
      createdAt: getEventTime(createdAt, now, 0.15),
      previousValue: null,
      nextValue: assignee.name,
    })
  }

  if (template.status !== 'NEW') {
    let statusActorName = '운영 담당자'

    if (assignee !== null) {
      statusActorName = assignee.name
    }

    history.push({
      id: `${template.id}-history-status`,
      type: 'STATUS_CHANGED',
      actorName: statusActorName,
      description: `문의 상태가 ${template.status}(으)로 변경되었습니다.`,
      createdAt: getEventTime(createdAt, now, 0.3),
      previousValue: 'NEW',
      nextValue: template.status,
    })
  }

  return history
}

function createNotes(
  template: InquiryTemplate,
  createdAt: Date,
  now: Date,
  assignee: Agent | null,
): InquiryNote[] {
  if (!template.initialNote || !assignee) {
    return []
  }

  return [
    {
      id: `${template.id}-note-001`,
      content: template.initialNote,
      author: assignee,
      createdAt: getEventTime(createdAt, now, 0.55),
    },
  ]
}

export function createSeedInquiries(now = new Date()): Inquiry[] {
  // 고정 날짜 대신 실행 시각을 기준으로 만들어 언제 실행해도 SLA 정상·지연 사례가 함께 보인다.
  return inquiryTemplates.map((template) => {
    const createdAt = new Date(now.getTime() - template.createdHoursAgo * HOUR_IN_MS)
    const assignee = getAgent(template.assigneeId)
    const history = createHistory(template, createdAt, now, assignee)
    const notes = createNotes(template, createdAt, now, assignee)
    // 메모가 있으면 메모 시각, 없으면 마지막 이력을 문의의 최근 변경 시각으로 사용한다.
    const latestNote = notes.at(-1)
    const latestHistory = history.at(-1)
    let latestActivityAt = createdAt.toISOString()

    if (latestHistory !== undefined) {
      latestActivityAt = latestHistory.createdAt
    }
    if (latestNote !== undefined) {
      latestActivityAt = latestNote.createdAt
    }

    return {
      id: template.id,
      title: template.title,
      content: template.content,
      category: template.category,
      priority: template.priority,
      status: template.status,
      customer: customers[template.customerIndex]!,
      assignee: assignee,
      createdAt: createdAt.toISOString(),
      updatedAt: latestActivityAt,
      slaDueAt: new Date(
        now.getTime() + template.slaHoursFromNow * HOUR_IN_MS,
      ).toISOString(),
      history: history,
      notes: notes,
    }
  })
}
