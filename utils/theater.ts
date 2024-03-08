import dayjs from 'dayjs'

type TheaterState = 'upcoming' | 'ongoing' | 'ended'
export function getTheaterState(_date: Date): TheaterState {
  const now = dayjs()
  const date = dayjs(_date)
  const minuteDiff = now.diff(date, 'minute')
  if (minuteDiff < 0) {
    return 'upcoming'
  }
  else if (minuteDiff - 150 < 0) {
    return 'ongoing'
  }
  else {
    return 'ended'
  }
}
