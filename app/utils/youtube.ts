export function extractYouTubeId(url: string): string | null | undefined {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url?.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function isYouTubeUrl(url: string): boolean {
  return !!extractYouTubeId(url)
}
