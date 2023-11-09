<script lang="ts" setup>
defineProps<{
  error: Error | null
  pending: boolean
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
}>()
const config = useAppConfig()
</script>

<template>
  <div class="memberList">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="flex flex-col gap-3"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="item pulse-color-2 h-[104px] mx-3"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" img-src="/svg/no_data.svg" />
    </div>

    <DynamicScroller
      v-else
      key="loaded"
      :prerender="10"
      :min-item-size="104"
      :items="members"
      key-field="room_id"
      class="px-3"
      page-mode
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index">
          <div class="pb-3">
            <div class="bg-container flex gap-3 rounded-xl p-3">
              <NuxtLink :key="item.room_id" :to="`/member/${item.url}`" class="h-20 w-20 overflow-hidden rounded-full">
                <NuxtImg
                  class="h-full w-full object-cover"
                  :src="item.img_alt ?? item.img ?? config.errorPicture"
                  :alt="`${item.name} Profile Picture`"
                  fit="fill"
                  :modifiers="{
                    aspectRatio: 1,
                    gravity: 'faceCenter',
                  }"
                  width="80px"
                  :placeholder="[5, 5, 55, 100]"
                  format="webp"
                />
              </NuxtLink>
              <div class="flex flex-1 flex-col">
                <NuxtLink :to="`/member/${item.url}`">
                  {{ item.nicknames[0] || item.name }}
                </NuxtLink>
                <div class="flex flex-1 justify-between">
                  <div class="text-base" :class="item.is_group ? 'text-blue-500' : (item.is_graduate ? 'text-red-500' : 'text-green-500')">
                    {{ item.is_group ? "Official" : (item.is_graduate ? "Graduated" : "Active") }}
                  </div>
                  <div class="flex items-center gap-4 self-end text-base text-slate-700 dark:text-slate-400">
                    <NuxtLink :to="$liveURL(item.url)" target="_blank">
                      <Icon name="ic:round-videocam" size="1.6rem" />
                    </NuxtLink>
                    <NuxtLink :to="$profileURL(item.room_id)" target="_blank">
                      <Icon name="ic:round-person" size="1.6rem" />
                    </NuxtLink>
                    <NuxtLink :to="`/member/${item.url}`">
                      <Icon name="mdi:card-account-details-outline" size="1.6rem" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style lang="scss">
.memberList{
  .item {
    @apply aspect-[10/14] md:aspect-[13/16] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
