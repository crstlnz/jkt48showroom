<script lang="ts" setup>
import { useMembers } from '~/store/members'

definePageMeta({
  layout: 'sorter',
})

const membersStore = await useMembers()
const { members, pending, error } = storeToRefs(membersStore)
const data = computed<ISortMember[]>(() => {
  return members.value?.map<ISortMember>((i) => {
    return {
      id: (i as IMember & { _id: string })._id,
      img: i.img_alt || i.img,
      name: i.nicknames?.[0] || i.name,
      generation: i.generation,
      is_graduate: i.is_graduate,
    }
  }) ?? []
})
</script>

<template>
  <div class="flex w-full flex-1 items-center justify-center sm:p-3">
    <div v-if="error" class="flex w-full flex-col items-center gap-20">
      <NuxtImg class="mx-auto w-96 max-w-[75%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
      <span>{{ $t("data.failed") }}</span>
    </div>
    <Icon v-else-if="pending" name="svg-spinners:ring-resize" size="2.5rem" />
    <div v-else-if="!data" class="flex w-full flex-col items-center justify-center gap-2">
      <NuxtImg class="mx-auto w-96 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
      <span>{{ $t("data.nodata") }}</span>
    </div>
    <SorterGame v-else :members="data" class="mx-auto flex w-[768px] max-w-[95%] flex-col flex-wrap items-stretch justify-center gap-3 self-start" />
  </div>
</template>
