<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

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
const onLives = useOnLives()
</script>

<template>
  <div class="memberList px-4">
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
        class="item pulse-color-2"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" img-src="/svg/no_data.svg" />
    </div>

    <ClientOnly v-else>
      <template #fallback>
        <div class="grid-member-list gap-4">
          <MemberCard
            v-for="member in members" :key="member.room_id"
            :data-id="member.name"
            class="shadow-sm aspect-[637/784]"
            :member="member"
            :is-live="onLives.isLive(member.room_id)"
          />
          <!-- <div v-for="member in members" :key="member.room_id" class="bg-container rounded-2xl gap-4 aspect-[637/784] animate-pulse" /> -->
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
            class="shadow-sm"
            :member="item"
            :is-live="onLives.isLive(item.room_id)"
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
  .item {
    @apply aspect-[10/14] md:aspect-[13/16] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
