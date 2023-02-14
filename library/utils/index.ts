export function convertToMilliseconds (timestamp: number): number {
  return timestamp * (timestamp < 1e10 ? 1e3 : 1)
}

export function isValidURL (str: string): boolean {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(str)
}

export function getDateRange (type: IDateRangeType): IDateRange {
  const date = new Date()
  let to: Date, from: Date
  if (type === 'weekly') {
    date.setDate(date.getDate() - (date.getDay() || 7) - 7)
    from = new Date(date.setHours(24, 0, 0, 0))
    to = new Date(date.setDate(date.getDate() + 7))
  } else if (type === 'monthly') {
    date.setDate(1)
    to = new Date(date.setHours(0, 0, 0, 0))
    from = new Date(date.setMonth(to.getMonth() - 1))
  } else if (type === 'quarterly') {
    date.setDate(1)
    to = new Date(date.setHours(0, 0, 0, 0))
    from = new Date(date.setMonth(to.getMonth() - 3))
  } else {
    to = date
    from = date
  }
  return {
    from: from.toISOString(),
    to: to.toISOString()
  }
}
