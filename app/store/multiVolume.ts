import { acceptHMRUpdate, defineStore, skipHydrate } from 'pinia'

export const useMultiVolume = defineStore('multiVolume', () => {
  const allVolume = useLocalStorage<number>('multi_all_volume', 1)
  const playerVolumes = useLocalStorage<Record<string, number>>('multi_player_volumes', {})
  const allMuted = useLocalStorage<boolean>('multi_all_muted', false)
  const playerMutes = useLocalStorage<Record<string, boolean>>('multi_player_mutes', {})

  interface MultiPlayer {
    id: string
    video?: {
      mute: () => void
      setVolume: (volume: number) => void
      unmute: () => void
    }
  }

  function clampVolume(volume: number) {
    if (!Number.isFinite(volume)) return
    return Math.min(1, Math.max(0, volume))
  }

  function getPlayerVolume(id: string): number {
    if (Object.hasOwn(playerVolumes.value, id)) {
      return playerVolumes.value[id]
    }
    return allVolume.value
  }

  function getPlayerMuted(id: string): boolean {
    if (Object.hasOwn(playerMutes.value, id)) {
      return playerMutes.value[id]
    }
    return allMuted.value
  }

  function setAllVolume(volume: number, videoPlayers?: Iterable<MultiPlayer>) {
    const v = clampVolume(volume)
    if (v == null) return
    allVolume.value = v
    playerVolumes.value = {}
    if (videoPlayers) {
      for (const player of videoPlayers) {
        player.video?.setVolume(v)
      }
    }
  }

  function setPlayerVolume(id: string, volume: number, player?: MultiPlayer) {
    const v = clampVolume(volume)
    if (v == null) return
    playerVolumes.value = {
      ...playerVolumes.value,
      [id]: v,
    }
    if (player) {
      player.video?.setVolume(v)
    }
  }

  function setAllMuted(muted: boolean, videoPlayers?: Iterable<MultiPlayer>) {
    allMuted.value = muted
    playerMutes.value = {}
    if (videoPlayers) {
      for (const player of videoPlayers) {
        if (muted) {
          player.video?.mute()
        }
        else {
          player.video?.setVolume(getPlayerVolume(player.id))
          player.video?.unmute()
        }
      }
    }
  }

  function setPlayerMuted(id: string, muted: boolean, player?: MultiPlayer) {
    playerMutes.value = {
      ...playerMutes.value,
      [id]: muted,
    }
    if (player) {
      if (muted) {
        player.video?.mute()
      }
      else {
        player.video?.setVolume(getPlayerVolume(id))
        player.video?.unmute()
      }
    }
  }

  function clearPlayerSettings(id: string) {
    if (Object.hasOwn(playerVolumes.value, id)) {
      const volumes = { ...playerVolumes.value }
      delete volumes[id]
      playerVolumes.value = volumes
    }
    if (Object.hasOwn(playerMutes.value, id)) {
      const mutes = { ...playerMutes.value }
      delete mutes[id]
      playerMutes.value = mutes
    }
  }

  return {
    allVolume: skipHydrate(allVolume),
    playerVolumes: skipHydrate(playerVolumes),
    allMuted: skipHydrate(allMuted),
    playerMutes: skipHydrate(playerMutes),
    getPlayerVolume,
    getPlayerMuted,
    setAllVolume,
    setPlayerVolume,
    setAllMuted,
    setPlayerMuted,
    clearPlayerSettings,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMultiVolume, import.meta.hot))
}
