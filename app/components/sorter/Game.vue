<script lang="ts" setup>
defineProps<{
  members: ISortMember[]
}>()

const filterList = useSessionStorage<string[]>('sorter-filterlist', [], { deep: true, listenToStorageChanges: true })
const { t } = useI18n()
const { start, state, stop, GameState, setSelectedMember, cardOne, cardTwo, pick, undo, progress } = useMemberSorter()
watch(state, (val) => {
  if (val === GameState.FINISHED) navigateTo('/sorter/result')
})

function localizeFilter(filter: string) {
  if (['All Member', 'Semua Member'].includes(filter)) return t('sorter.all_member')
  if (['Active Member', 'Member Aktif'].includes(filter)) return t('sorter.active_member')
  if (['Graduate Member', 'Member Graduate'].includes(filter)) return t('sorter.graduate_member')
  if (['All Generation', 'Semua Generasi'].includes(filter)) return t('sorter.all_generation')
  return filter
}
</script>

<template>
  <div>
    <button type="button" class="fixed right-2 top-2 z-aboveNav rounded-md bg-red-500 px-2 py-0.5 text-xs text-white/80 active:scale-95 md:right-3 md:top-3" @click="stop">
      {{ $t('sorter.reset') }}
    </button>
    <div
      class="flex flex-col"
    >
      <div class="flex w-full items-center justify-evenly">
        <SorterCard :flip="state !== GameState.STARTED" class="max-md:flex-1 w-0 md:w-44 lg:w-60" :member="cardOne" @click="() => pick('one')" />
        <div class="text-xs max-sm:mx-2 md:text-base">
          {{ $t('sorter.vs') }}
        </div>
        <SorterCard :flip="state !== GameState.STARTED" class="reverse max-md:flex-1 w-0 md:w-44 lg:w-60" :member="cardTwo" @click="() => pick('two')" />
      </div>
      <Transition name="gamecontrol" mode="out-in">
        <SorterFilterMember
          v-if="state !== GameState.STARTED"
          key="filter"
          class="mt-8"
          :members="members" @filtered="(members, filterLista) => {
            filterList = filterLista
            setSelectedMember(members)
            start()
          }"
        />
        <div
          v-else
          key="game"
          class="mt-8 flex w-full flex-col gap-3 md:gap-4"
        >
          <div class="relative overflow-hidden rounded-xl bg-blue-500/50 text-white/90">
            <div class="z-10 px-3 py-0.5 text-center text-sm">
              {{ $t('sorter.progress') }} {{ decimalFormat(progress * 100) }}%
            </div>
            <div class="absolute inset-y-0 -z-10  bg-blue-500" :style="{ width: `${progress * 100}%` }" />
          </div>
          <Button class="rounded-full bg-green-500 p-2.5 text-lg font-bold text-white/90" @click="() => pick('tie')">
            {{ $t('sorter.tie') }}
          </Button>
          <Button class="rounded-full bg-red-500 p-2.5 text-lg font-bold text-white/90" @click="undo">
            {{ $t('sorter.undo') }}
          </Button>
          <div class="mt-5">
            <div class="mb-2 text-lg font-bold">
              {{ $t('sorter.filters') }}
            </div>
            <div class="flex flex-wrap gap-2 md:gap-3">
              <div v-for="filter in filterList" :key="filter" class="rounded-full bg-blue-400/25 px-3 py-1 text-sm dark:bg-blue-400/10 md:text-base">
                {{ localizeFilter(filter) }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <!-- <div v-else class="flex flex-col gap-3">
        <NuxtLink v-ripple to="/sorter/result" class="min-w-[350px] rounded-full bg-red-500 px-5 py-3  text-center text-xl font-bold text-white transition-[transform] active:scale-95">
          {{ $t('sorter.viewresult') }}
        </NuxtLink>
        <Button class="bg-red-500" @click="undo">
          Undo
        </Button>
      </div> -->
  </div>
</template>
