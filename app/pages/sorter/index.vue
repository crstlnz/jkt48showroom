<script lang="ts" setup>
import { useMembers } from '~/store/members'
import { useSettings } from '~/store/settings'
import { toSortMember } from '~/utils/sorterResult'

definePageMeta({
  layout: 'sorter',
})

const membersStore = useMembers()
const { members, pending, error } = storeToRefs(membersStore)

onMounted(() => {
  membersStore.tryRefresh()
})

const data = computed<ISortMember[]>(() => {
  return members.value?.map(i => toSortMember(i as IMember & { _id: string, jkt48_id?: string | number })) ?? []
})

const { group } = useSettings()
const { getGroupTitle } = useAppConfig()

const description = computed(() => {
  return `Oshi Sorter adalah game yang memungkinkan kamu untuk mengurutkan dan menemukan member ${getGroupTitle(group)} favoritmu berdasarkan pilihanmu sendiri!`
})

useSeoMeta({
  title: 'Oshi Sorter',
  ogTitle: 'Oshi Sorter',
  ogSiteName: 'Oshi Sorter',
  twitterTitle: 'Oshi Sorter',
  description,
  ogDescription: () => description.value,
  twitterDescription: () => description.value,
  twitterCard: 'summary',
})
</script>

<template>
  <div class="flex w-full flex-1 items-center justify-center sm:p-3">
    <div v-if="error" class="flex w-full flex-col items-center gap-20">
      <Image class="mx-auto w-96 max-w-[75%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
      <span>{{ $t("data.failed") }}</span>
    </div>
    <Icon v-else-if="pending" name="svg-spinners:ring-resize" size="2.5rem" />
    <div v-else-if="!data" class="flex w-full flex-col items-center justify-center gap-2">
      <Image class="mx-auto w-96 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
      <span>{{ $t("data.nodata") }}</span>
    </div>
    <SorterGame v-else :members="data" class="mx-auto flex w-3xl max-w-[95%] flex-col flex-wrap items-stretch justify-center gap-3 self-start" />
  </div>
</template>
