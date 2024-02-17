<script lang="ts" setup>
const props = defineProps<{
  error: Error | null
  pending: boolean
  keyId: number
  members: IMember[]
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
</script>

<template>
  <div class="memberList px-3 md:px-4 min-h-[100vh]">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="item pulse-color animate-pulse"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" :img-src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`" />
    </div>

    <ClientOnly v-else>
      <template #fallback>
        <div class="grid-member-list gap-4">
          <MemberCard
            v-for="member in members" :key="member.room_id"
            :data-id="member.name"
            class="shadow-sm aspect"
            :member="member"
          />
        </div>
      </template>
      <Grid
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
            class="shadow-sm aspect"
            :member="item"
          />
        </template>
        <template #placeholder="{ index, style }">
          <div :key="index" class="item pulse-color" :style="style" />
        </template>
      </Grid>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.memberList{
  .aspect {
    @apply aspect-[10/14] md:aspect-[13/16]
  }
  .item {
    @apply aspect-[10/14] md:aspect-[13/16] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
