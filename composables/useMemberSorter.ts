import { shuffleArray } from '~~/library/utils'
import { useNotifications } from '~~/store/notifications'

enum GameState {
  IDLE,
  STARTED,
  FINISHED,
}

type RanksContainer = ((string | string[])[])[]
type RanksCompare = (string | string[])[]
type PickType = 'one' | 'two' | 'tie'

interface UndoData {
  one: string | string[] | null
  two: string | string[] | null
  check: CompareResult
}

type CompareResult = {
  data: FillTypeOne | FillTypeTwo | null
} | null

interface FillTypeOne {
  initialOne: number
  initialTwo: number
  one: RanksCompare
  two: RanksCompare
  ranks: [RanksCompare, RanksCompare]
}

interface FillTypeTwo {
  rankCursor: number
  fillData: FillTypeOne | null
}

interface CompareManager {
  one: RanksCompare
  two: RanksCompare
  initialOne: number
  initialTwo: number
  sorted: RanksCompare
}

class TieMembers extends Array {
  add(member: string | string[]) {
    if (Array.isArray(member)) {
      this.push(...member)
    }
    else {
      this.push(member)
    }
  }

  get(): string {
    return this[Math.floor(Math.random() * this.length)]
  }
}

function getRandomFromArray(array: any[]) {
  return array[Math.floor(Math.random() * array.length)]
}

export default function () {
  const { addNotif } = useNotifications()
  const { t } = useI18n()
  const members = useSessionStorage<ISortMember[]>('sorter-members', [])
  const state = useSessionStorage('sorter-state', GameState.IDLE)
  const result = useSessionStorage<(ISortMember | ISortMember[])[]>('sorter-result', () => [])
  // ranks
  const ranks = useSessionStorage<RanksContainer>('sorter-ranks', () => [])
  const memberMap = useSessionStorage('sorter-membermap', new Map<string, ISortMember>())

  const compare = useSessionStorage<CompareManager>('sorter-compare', {
    one: [],
    two: [],
    initialOne: 0,
    initialTwo: 0,
    sorted: [],
  })

  const rankTemp = useSessionStorage<RanksContainer>('sorter-sortedTemp', () => [])
  const progress = computed(() => {
    const compareOneProgress = compare.value.one.length / compare.value.initialOne
    const compareTwoProgress = compare.value.two.length / compare.value.initialTwo
    return (members.value.length - ranks.value.length - compareOneProgress - compareTwoProgress - rankTemp.value.length) / members.value.length
  })
  ///

  const undoTemp = useSessionStorage<UndoData[]>('sorter-undoTemp', () => [], { deep: true })
  // const undoTemp = ref<{ compare: CompareManager; rankTemp: RanksContainer; ranks: RanksContainer }[]>([])

  function setTemp() {
    undoTemp.value.push(JSON.parse(JSON.stringify({
      compare: compare.value,
      rankTemp: rankTemp.value,
      ranks: ranks.value,
    })))
  }
  ///
  const cardOne = computed<ISortMember | null>(() => {
    if (!compare.value.one?.length) return null
    const id = compare.value.one[0]
    if (Array.isArray(id)) return memberMap.value.get(getRandomFromArray(id)) || null
    return memberMap.value.get(id as string) || null
  })

  const cardTwo = computed<ISortMember | null>(() => {
    if (!compare.value.two?.length) return null
    const id = compare.value.two[0]
    if (Array.isArray(id)) return memberMap.value.get(getRandomFromArray(id)) || null
    return memberMap.value.get(id as string) || null
  })

  function pick(type: PickType) {
    const compareData: { one: string | string[] | null; two: string | string[] | null } = {
      one: null,
      two: null,
    }
    switch (type) {
      case 'one':{
        const card = compare.value.one.shift()
        compareData.one = card || null
        if (card) {
          compare.value.sorted.push(card)
        }
        break
      }
      case 'two':{
        const card = compare.value.two.shift()
        compareData.two = card || null
        if (card) {
          compare.value.sorted.push(card)
        }
        break
      }
      default:{
        const one = compare.value.one.shift()
        const two = compare.value.two.shift()
        compareData.one = one || null
        compareData.two = two || null
        const tie: string[] = []
        if (Array.isArray(one)) {
          tie.push(...one)
        }
        else {
          tie.push(one as string)
        }

        if (Array.isArray(two)) {
          tie.push(...two)
        }
        else {
          tie.push(two as string)
        }
        compare.value.sorted.push(tie)
        break
      }
    }

    undoTemp.value.push({
      ...compareData,
      check: checkCompare(),
    })
  }

  function checkCompare(): CompareResult {
    if (!compare.value.one.length || !compare.value.two.length) {
      if (!compare.value.one.length) {
        compare.value.sorted.push(...compare.value.two)
      }
      else {
        compare.value.sorted.push(...compare.value.one)
      }
      rankTemp.value.push(compare.value.sorted)
      compare.value.sorted = []
      return {
        data: fillCompare(),
      }
    }
    return null
  }

  function fillCompare(): FillTypeOne | FillTypeTwo | null {
    if (ranks.value.length >= 2) {
      const one = ranks.value.shift() as RanksCompare
      const two = ranks.value.shift() as RanksCompare
      const fillData: FillTypeOne = {
        initialOne: compare.value.initialOne,
        initialTwo: compare.value.initialTwo,
        one: compare.value.one,
        two: compare.value.two,
        ranks: [one, two],
      }
      compare.value.one = one || ([] as string[])
      compare.value.initialOne = compare.value.one.length
      compare.value.two = two || ([] as string[])
      compare.value.initialTwo = compare.value.two.length
      return fillData
    }
    else {
      const cursor = ranks.value.length
      ranks.value.push(...rankTemp.value)
      rankTemp.value = []
      if (ranks.value.length >= 2) {
        return {
          rankCursor: cursor,
          fillData: fillCompare() as FillTypeOne,
        }
      }
      else {
        finish()
        return null
      }
    }
  }

  function reset() {
    compare.value = {
      one: [],
      two: [],
      sorted: [],
      initialOne: 0,
      initialTwo: 0,
    }
    ranks.value = []
    rankTemp.value = []
    result.value = []
    undoTemp.value = []
  }

  function prepareStart() {
    reset()
    memberMap.value.clear()
    ranks.value = shuffleArray(members.value).map(i => [i.id])
    fillCompare()
    for (const member of members.value) {
      memberMap.value.set(member.id, member)
    }
  }

  const defaultSortMember = { id: '', img: '', is_graduate: true, name: 'Not found!', generation: '' }
  function finish() {
    for (const ids of ranks.value[0]) {
      if (Array.isArray(ids)) {
        result.value.push(ids.map(i => memberMap.value.get(i) || defaultSortMember))
      }
      else {
        result.value.push(memberMap.value.get(ids as string) || defaultSortMember)
      }
    }
    state.value = GameState.FINISHED
  }

  function start() {
    if (state.value === GameState.STARTED) return
    if (members.value.length < 2) return addNotif({ message: t('sorter.pickmemberfirst'), type: 'danger', duration: 2000 })
    state.value = GameState.STARTED
    prepareStart()
  }

  function stop() {
    state.value = GameState.IDLE
    reset()
  }

  function undo() {
    const undoData = undoTemp.value.pop()
    if (undoData) {
      const fillData = undoData.check?.data
      if (fillData != null) {
        if ((fillData as any).rankCursor == null) {
          const data = fillData as FillTypeOne
          compare.value.one = data.one
          compare.value.two = data.two
          compare.value.initialOne = data.initialOne
          compare.value.initialTwo = data.initialTwo
          ranks.value = [...data.ranks, ...ranks.value]
        }
        else {
          const data = fillData as FillTypeTwo
          if (data.fillData) {
            compare.value.one = data.fillData.one
            compare.value.two = data.fillData.two
            compare.value.initialOne = data.fillData.initialOne
            compare.value.initialTwo = data.fillData.initialTwo
            ranks.value = [...data.fillData.ranks, ...ranks.value]
          }
          const rankData = ranks.value.slice(0, data.rankCursor)
          const rankTempData = ranks.value.slice(data.rankCursor, ranks.value.length)
          ranks.value = rankData
          rankTemp.value = rankTempData
        }
      }

      if (undoData.check !== null) {
        rankTemp.value.pop()
      }

      if (undoData.one) {
        compare.value.one = [undoData.one, ...compare.value.one]
      }
      if (undoData.two) {
        compare.value.two = [undoData.two, ...compare.value.two]
      }
      compare.value.sorted.pop()
      if (state.value === GameState.FINISHED) state.value = GameState.STARTED
    }
    else {
      stop()
    }
  }

  return { start, stop, state, GameState, cardOne, cardTwo, pick, result, undo, reset, progress }
}
