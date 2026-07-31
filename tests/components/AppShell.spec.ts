import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'

import AppShell from '@/components/layout/AppShell.vue'
import { focusPageHeading } from '@/router'

async function mountAppShell(initialLocation = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>대시보드</div>' } },
      { path: '/inquiries', component: { template: '<div>문의 관리</div>' } },
    ],
  })

  await router.push(initialLocation)
  await router.isReady()

  return mount(AppShell, {
    attachTo: document.body,
    slots: {
      default: '<h1>테스트 화면</h1><button type="button">주요 작업</button>',
    },
    global: {
      plugins: [router],
    },
  })
}

describe('AppShell 접근성', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('본문 바로가기와 이름이 있는 내비게이션 Landmark를 제공한다', async () => {
    const wrapper = await mountAppShell('/inquiries')

    expect(wrapper.get('.skip-link').attributes('href')).toBe('#main-content')
    expect(wrapper.get('aside').attributes('aria-label')).toBe('앱 내비게이션')
    expect(wrapper.get('nav').attributes('aria-label')).toBe('주요 메뉴')
    expect(wrapper.get('main').attributes('tabindex')).toBe('-1')
    expect(wrapper.get('a[href="/inquiries"]').attributes('aria-current')).toBe('page')
  })

  it('키보드 사용자가 본문 바로가기 링크에 포커스할 수 있다', async () => {
    const wrapper = await mountAppShell()
    const skipLink = wrapper.get<HTMLAnchorElement>('.skip-link')

    skipLink.element.focus()

    expect(document.activeElement).toBe(skipLink.element)
  })

  it('라우트가 바뀌면 새 화면의 첫 제목으로 포커스를 이동한다', async () => {
    const wrapper = await mountAppShell()
    const heading = wrapper.get<HTMLHeadingElement>('h1')

    await focusPageHeading()

    expect(heading.attributes('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading.element)
  })
})
