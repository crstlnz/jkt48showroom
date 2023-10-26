<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

const props = defineProps<{
  error: boolean
  pending: boolean
  keyId: number
  members: {
    name: string
    img: string
    img_alt?: string | undefined
    url: string
    description?: string | undefined
    group?: string | undefined
    room_id: number
    room_exists: boolean
    is_graduate: boolean
    is_group: boolean
  }[]
  perpage: number
}>()

const keyId = computed(() => props.keyId)

const members = computed(() => {
  return props.members
})

const getPage = ref()

watch(keyId, () => {
  getPage.value = async (pageNumber: number, pageSize: number) => {
    const num = pageNumber * pageSize
    return [...(members.value ?? []).slice(num, num + pageSize)]
  }
}, { immediate: true })
// async function getPage(pageNumber: number, pageSize: number) {
//   const num = pageNumber * pageSize
//   return [...(members.value ?? []).slice(num, num + pageSize)]
// }
const onLives = useOnLives()
</script>

<template>
  <div class="memberList px-4">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="grid grid-cols-2 gap-2 py-4 sm:gap-4 md:grid-cols-3 md:gap-5 md:py-6 xl:grid-cols-4 xl:py-8"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="item pulse-color-2"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" img-src="/svg/no_data.svg" />
    </div>

    <Grid
      v-else
      :length="members.length"
      :page-provider="getPage"
      :page-size="perpage"
      class="grid-member-list gap-4"
      :respect-scroll-to-on-resize="true"
      :get-key="(item : any) => item.room_id"
    >
      <template #probe>
        <div class="item pulse-color" />
      </template>
      <template #default="{ item, style }">
        <MemberCard
          :style="style"
          :data-id="item.name"
          class="shadow-sm"
          :member="item"
          :is-live="onLives.isLive(item.room_id)"
        />
      </template>
      <template #placeholder="{ index, style }">
        <div :key="index" class="item pulse-color" :style="style" />
      </template>
    </Grid>
  </div>
</template>

<style lang="scss">
.memberList{
  .item {
    @apply aspect-[10/14] md:aspect-[13/16] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
