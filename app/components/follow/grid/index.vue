<script lang="ts" setup>
const props = defineProps<{
  error: Error | null
  pending: boolean
  keyId: number
  members: ShowroomAPI.RoomFollow[]
  perpage: number
}>()

defineEmits(['update'])

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
</script>

<template>
  <div class="followList px-3 md:px-4 min-h-[calc(100vh_-_60px)]">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="grid-follow-list gap-4"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="item bg-container"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" :img-src="`${$imgCDN}/assets/svg/web/no_data.svg`" />
    </div>

    <ClientOnly v-else>
      <template #fallback>
        <div class="grid-follow-list gap-4">
          <FollowGridMember v-for="member in members" :key="member.room_id" :room="member" class="aspect" />
        </div>
      </template>
      <Grid
        :length="members.length"
        :page-provider="getPage"
        :page-size="perpage"
        class="grid-follow-list gap-4"
        :respect-scroll-to-on-resize="true"
        :get-key="(item : any) => item.room_id"
      >
        <template #probe>
          <div class="item pulse-color" />
        </template>
        <template #default="{ item, style }">
          <FollowGridMember :style="style" :room="item" class="aspect" @update="$emit('update')" />
        </template>
        <template #placeholder="{ index, style }">
          <div :key="index" class="item pulse-color" :style="style" />
        </template>
      </Grid>
    </ClientOnly>
  </div>
</template>

<style>
@reference "~/assets/css/theme.css";

.followList .aspect {
  @apply aspect-[20/6.5] xl:aspect-20/5
}
.followList .item {
  @apply aspect-[20/6.5] xl:aspect-20/5 rounded-xl animate-pulse shadow-sm;
}
</style>
