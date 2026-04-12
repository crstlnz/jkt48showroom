export interface TeamColor {
  bg: string
  text: string
  icon?: string
}

export default function jkt48TeamColor(_team: string): TeamColor | null {
  const team = _team.toLowerCase()
  if (team === 'dream') {
    return {
      bg: '#00a4a5',
      text: '#97f0de',
      icon: 'https://img.crstlnz.my.id/team_dream.png',
    }
  }
  if (team === 'love') {
    return {
      bg: '#e20785',
      text: '#f1bcdc',
      icon: 'https://img.crstlnz.my.id/team_love.png',
    }
  }

  if (team === 'passion') {
    return {
      bg: '#f79220',
      text: '#fdd69f',
      icon: 'https://img.crstlnz.my.id/team_passion.png',
    }
  }

  if (team === 'trainee') {
    return {
      text: '#e8cfcf',
      bg: 'rgb(196, 120, 120)',
    }
  }

  return null
}
