<script lang="ts" setup>
import { useOnLives } from '~~/store/onLives'
import { useMembers } from '~~/store/members'
const { t: $t } = useI18n()
const onLives = useOnLives()
const memberState = useMembers()
const { members, pending, error } = storeToRefs(memberState)
const perpage = 10
// eslint-disable-next-line require-await
async function getPage (pageNumber : number, pageSize : number) : Promise<unknown[]> {
  const num = pageNumber * pageSize
  return [...(members.value ?? [])?.slice(num, num + pageSize)]
}

useHead({ title: computed(() => $t('page.title.member')) })
</script>

<template>
  <div class="memberList">
    <ClientOnly>
      <template #fallback>
        <div
          class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="item pulse-color"
          />
        </div>
      </template>
      <div v-if="error">
        <Error message="Something error :(" img-src="/svg/error.svg" />
      </div>
      <div
        v-else-if="pending"
        class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
      >
        <div
          v-for="i in 12"
          :key="i"
          class="item pulse-color"
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
        class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
      >
        <template #probe>
          <div class="item pulse-color" />
        </template>
        <template #default="{ item, style }">
          <MemberCard
            :key="item.room_id"
            :style="style"
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
    @apply aspect-[10/14] md:aspect-[10/13] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
