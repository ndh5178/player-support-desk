/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const tokenCss = readFileSync(resolve('src/assets/styles/tokens.css'), 'utf8')
const priorityBadgeCss = readFileSync(
  resolve('src/components/common/PriorityBadge.vue'),
  'utf8',
)
const statusBadgeCss = readFileSync(
  resolve('src/components/common/StatusBadge.vue'),
  'utf8',
)

function getToken(name: string): string {
  const match = tokenCss.match(new RegExp(`${name}:\\s*([^;]+)`))

  if (match === null || match[1] === undefined) {
    throw new Error(`${name} 색상 토큰을 찾을 수 없습니다.`)
  }

  const value = match[1].trim()
  const referencedTokenMatch = value.match(/^var\((--[^)]+)\)$/)

  if (referencedTokenMatch !== null && referencedTokenMatch[1] !== undefined) {
    return getToken(referencedTokenMatch[1])
  }

  return value
}

function getLuminance(hex: string): number {
  const channelMatches = hex.slice(1).match(/.{2}/g)

  if (channelMatches === null || channelMatches.length !== 3) {
    throw new Error(`올바르지 않은 색상입니다: ${hex}`)
  }

  const channels = channelMatches.map((value) => Number.parseInt(value, 16) / 255)
  const luminanceChannels = channels.map((channel) => {
    if (channel <= 0.04045) {
      return channel / 12.92
    }

    return ((channel + 0.055) / 1.055) ** 2.4
  })
  const red = luminanceChannels[0]
  const green = luminanceChannels[1]
  const blue = luminanceChannels[2]

  if (red === undefined || green === undefined || blue === undefined) {
    throw new Error(`올바르지 않은 색상입니다: ${hex}`)
  }

  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

function getContrastRatio(first: string, second: string): number {
  const firstLuminance = getLuminance(first)
  const secondLuminance = getLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('UI 색상 대비', () => {
  it('기본 텍스트와 포커스 색상이 각 배경에서 기준 대비를 충족한다', () => {
    const surface = getToken('--color-neutral-0')
    const background = getToken('--color-neutral-50')
    const darkBackground = getToken('--color-brand-900')

    expect(
      getContrastRatio(getToken('--color-text-muted'), surface),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      getContrastRatio(getToken('--color-text-muted'), background),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      getContrastRatio(getToken('--color-brand-700'), surface),
    ).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio(getToken('--color-focus'), surface)).toBeGreaterThanOrEqual(3)
    expect(
      getContrastRatio(getToken('--color-focus-on-dark'), darkBackground),
    ).toBeGreaterThanOrEqual(3)
  })

  it('모든 상태 Badge의 텍스트 대비가 4.5:1 이상이다', () => {
    const colorPairs = Array.from(
      statusBadgeCss.matchAll(
        /--status-background:\s*(#[0-9a-fA-F]{6});\s*--status-color:\s*(#[0-9a-fA-F]{6})/g,
      ),
    )

    expect(colorPairs).toHaveLength(4)

    colorPairs.forEach((colorPair) => {
      const background = colorPair[1]
      const color = colorPair[2]

      if (background === undefined || color === undefined) {
        throw new Error('상태 Badge 색상 값을 찾을 수 없습니다.')
      }

      expect(getContrastRatio(color, background)).toBeGreaterThanOrEqual(4.5)
    })
  })

  it('모든 우선순위 텍스트 대비가 4.5:1 이상이다', () => {
    const surface = getToken('--color-neutral-0')
    const colors = Array.from(
      priorityBadgeCss.matchAll(/--priority-color:\s*(#[0-9a-fA-F]{6})/g),
    )

    expect(colors).toHaveLength(4)

    colors.forEach((colorMatch) => {
      const color = colorMatch[1]

      if (color === undefined) {
        throw new Error('우선순위 색상 값을 찾을 수 없습니다.')
      }

      expect(getContrastRatio(color, surface)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
