export interface TeamColor {
  name?: string
  sort?: number
  bg: string
  text: string
  icon?: string
  is_team?: boolean
}

export default function jkt48TeamColor(_team: string): TeamColor | null {
  const team = _team.toLowerCase()
  if (team === 'dream') {
    return {
      bg: '#00a4a5',
      text: '#97f0de',
      sort: 0,
      icon: 'https://img.crstlnz.my.id/team_dream.png',
    }
  }
  if (team === 'love') {
    return {
      bg: '#e20785',
      text: '#f1bcdc',
      sort: 0,
      icon: 'https://img.crstlnz.my.id/team_love.png',
    }
  }

  if (team === 'passion') {
    return {
      bg: '#f79220',
      text: '#fdd69f',
      sort: 0,
      icon: 'https://img.crstlnz.my.id/team_passion.png',
    }
  }

  if (team === 'jkt48_virtual') {
    return {
      name: 'JKT48V',
      text: 'rgb(205, 220, 255)',
      bg: 'rgb(50, 100, 190)',
      sort: 1,
      is_team: false,
    }
  }

  if (team === 'trainee') {
    return {
      text: '#e8cfcf',
      bg: 'rgb(196, 120, 120)',
      sort: 2,
      is_team: false,
    }
  }

  return null
}
