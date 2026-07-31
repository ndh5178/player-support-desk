import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DashboardView from '@/views/DashboardView.vue'

describe('DashboardView', () => {
  it('운영 현황 화면의 제목과 다음 작업 안내를 표시한다', () => {
    const wrapper = mount(DashboardView)

    expect(wrapper.get('h1').text()).toBe('운영 현황')
    expect(wrapper.get('[aria-labelledby="dashboard-ready-title"]').text()).toContain(
      '대시보드 준비 완료',
    )
  })
})
