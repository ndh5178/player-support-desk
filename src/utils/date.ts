const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko-KR', {
  numeric: 'auto',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatRelativeTime(value: string, now = new Date()): string {
  const targetTime = new Date(value).getTime()
  const differenceInMinutes = Math.round((targetTime - now.getTime()) / (60 * 1000))

  if (Math.abs(differenceInMinutes) < 1) {
    return '방금 전'
  }

  if (Math.abs(differenceInMinutes) < 60) {
    return relativeTimeFormatter.format(differenceInMinutes, 'minute')
  }

  const differenceInHours = Math.round(differenceInMinutes / 60)

  if (Math.abs(differenceInHours) < 24) {
    return relativeTimeFormatter.format(differenceInHours, 'hour')
  }

  const differenceInDays = Math.round(differenceInHours / 24)

  if (Math.abs(differenceInDays) < 7) {
    return relativeTimeFormatter.format(differenceInDays, 'day')
  }

  return dateTimeFormatter.format(targetTime)
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}
