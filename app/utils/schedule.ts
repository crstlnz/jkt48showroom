export default function getScheduleUrl(data: JKT48.Schedule) {
  if (!data.category) return null
  if (['exclusive'].includes(data.category)) return `https://jkt48.com/purchase/exclusive?code=${data.code}`
  if (!['show', 'event'].includes(data.category)) return `https://jkt48.com/schedule/${data.url}`
  return `/theater/${data.code}`
}
