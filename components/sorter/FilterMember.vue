<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const props = defineProps<{
  members: ISortMember[]
}>()

defineEmits<{ (e: 'filtered', members: ISortMember[], filterList: string[]): void }>()

const filteredMembers = useSessionStorage<ISortMember[]>('sorter-members', [])
const filterList = useSessionStorage<string[]>('sorter-filterlist', [])

const { group } = useSettings()
const generation = generateGen()[group as 'jkt48' | 'hinatazaka46']
const filterGeneration = useLocalStorage<string[]>('filter-generation-sorter', generation.map((i: { key: any }) => i.key) ?? [])
const filterGraduate = useLocalStorage('filter-graduate-sorter', true)
const filterActive = useLocalStorage('filter-active-sorter', true)
const filterAllGeneration = ref(true)

watch(filterGraduate, (val) => {
  if (!val && !filterActive.value) filterActive.value = true
})

watch(filterActive, (val) => {
  if (!val && !filterGraduate.value) filterGraduate.value = true
})

const allGeneration = computed(() => {
  if (generation.length === filterGeneration.value.length) {
    for (const gen of generation) {
      if (!filterGeneration.value.includes(gen.key)) return false
    }
    return true
  }
  return false
})

watch(allGeneration, (val) => {
  filterAllGeneration.value = val
}, { immediate: true })

const computedFilteredMember = computed(() => {
  let result = props.members
  if (!result) return []
  if (!filterGraduate.value === filterActive.value) {
    result = filterActive.value ? result.filter(i => !i.is_graduate) : result.filter(i => i.is_graduate)
  }

  result = result.filter(i => filterGeneration.value.includes(i.generation ?? ''))
  return result
})

watch(computedFilteredMember, (val) => {
  filteredMembers.value = val
}, { immediate: true })

function toggleAllGeneration() {
  if (filterAllGeneration.value) {
    filterGeneration.value = []
  }
  else {
    filterGeneration.value = generation.map((i: { key: any }) => i.key)
  }
}

function toggleGeneration(key: string) {
  if (filterGeneration.value.includes(key)) {
    filterGeneration.value = filterGeneration.value.filter(i => i !== key)
  }
  else {
    filterGeneration.value.push(key)
  }
}

function getFilterList(): string[] {
  const filterList: string[] = []
  if (!filterGraduate.value === filterActive.value) {
    filterList.push(filterActive.value ? 'Active Member' : 'Graduate Member')
  }
  else {
    filterList.push('All Member')
  }
  if (allGeneration.value) {
    filterList.push('All Generation')
  }
  else {
    filterList.push(...filterGeneration.value.map(i => (parseGeneration(i, true)) || ''))
  }
  return filterList
}

const validStart = computed(() => {
  return filteredMembers.value.length >= 2
})
</script>

<template>
  <div class="flex flex-col gap-3 md:gap-5">
    <div class="space-y-1">
      <div
        class="text-center " :class="{
          'text-red-500/90': !validStart,
          'text-green-500/90': validStart,
        }"
      >
        {{ $t('sorter.selected', filteredMembers.length) }}
      </div>
      <div class="text-center">
        {{ validStart ? $t('sorter.clickstart') : $t("sorter.selectmember") }}
      </div>
    </div>
    <div class="flex flex-wrap justify-center gap-2 md:gap-3 md:px-10">
      <button v-for="gen in generation" :key="gen.key" v-ripple type="button" class="rounded-full bg-blue-400/25 px-3 py-1 text-sm dark:bg-blue-400/10 md:text-base" :class="{ '!bg-blue-500 text-white/80': filterGeneration.includes(gen.key) }" @click="() => toggleGeneration(gen.key)">
        {{ gen.short_title }}
      </button>
    </div>
    <div class="flex flex-wrap justify-center gap-5 text-sm md:text-base">
      <div class="flex items-start">
        <input
          id="active"
          v-model="filterActive"
          class="checked:focus:border-primary mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:mt-[-0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-500 checked:after:absolute checked:after:z-[2] checked:after:ml-[1.0625rem] checked:after:mt-[-3px] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-blue-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:bg-blue-500 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-blue-500 dark:checked:after:bg-blue-500 dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
          type="checkbox"
          role="switch"
        >
        <label
          class="inline-block pl-[0.15rem] hover:cursor-pointer"
          for="active"
        >Active</label>
      </div>

      <div class="flex items-start">
        <input
          id="graduate"
          v-model="filterGraduate"
          class="checked:focus:border-primary mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:mt-[-0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-500 checked:after:absolute checked:after:z-[2] checked:after:ml-[1.0625rem] checked:after:mt-[-3px] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-blue-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:bg-blue-500 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-blue-500 dark:checked:after:bg-blue-500 dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
          type="checkbox"
          role="switch"
        >
        <label
          class="inline-block pl-[0.15rem] hover:cursor-pointer"
          for="graduate"
        >Graduate</label>
      </div>

      <div class="flex items-start">
        <input
          id="allgen"
          v-model="filterAllGeneration"
          class="checked:focus:border-primary mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:mt-[-0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-500 checked:after:absolute checked:after:z-[2] checked:after:ml-[1.0625rem] checked:after:mt-[-3px] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-blue-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:bg-blue-500 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-blue-500 dark:checked:after:bg-blue-500 dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
          type="checkbox"
          role="switch"
          @click="toggleAllGeneration"
        >
        <label
          class="inline-block pl-[0.15rem] hover:cursor-pointer"
          for="allgen"
        >All Generation</label>
      </div>
    </div>
    <Button
      v-gtag-click="{
        label: 'oshi_sorter',
        category: 'game',
      }"
      class="mt-3 rounded-full bg-red-500 p-2.5 text-lg font-bold text-white/90" @click="() => {
        filterList = getFilterList()
        $emit('filtered', filteredMembers, getFilterList())
      }"
    >
      Start
    </Button>
  </div>
</template>
