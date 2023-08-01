<script lang="ts" setup>
import { BottomSheet } from '#components'
import { useSelectedUser } from '~/store/selectedUser'

defineProps<{
  data: IStatFans[]
}>()
const bottomSheet = ref<typeof BottomSheet | null>(null)
function openRankFans(evt: any) {
  if (!bottomSheet.value?.isOpen) return bottomSheet.value?.open(evt.target)
  bottomSheet.value?.close()
}

const { userClick } = useSelectedUser()
const { greaterOrEqual } = useResponsive()
const medium = greaterOrEqual('md')
const large = greaterOrEqual('lg')
const xl = greaterOrEqual('extra')
const showCount = computed(() => {
  if (xl.value) {
    return 16
  }
  else if (large.value) {
    return 12
  }
  else if (medium.value) {
    return 8
  }
  else {
    return 5
  }
})
</script>

<template>
  <div class="bg-container space-y-2.5 p-4 shadow-sm md:space-y-3.5 md:p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold lg:text-2xl">
        {{ $t("topfans") }}
      </h2>
      <button v-if="(data.length > 4)" class="hover:text-second-2" href="#" type="button" @click="openRankFans">
        {{ $t("more") }}
      </button>
    </div>
    <ul class="columns-1 md:columns-2 lg:columns-3 min-[1700px]:columns-4">
      <li v-for="[i, fans] in data.slice(0, showCount).entries()" :key="fans.id">
        <button v-ripple aria-label="Open user detail" class="user-btn mb-3 flex w-full items-center gap-4 rounded-3xl p-2 sm:p-3" @click="(e) => userClick(e, fans.id)">
          <span class="w-5 sm:w-6">{{ i + 1 }}</span>
          <div
            :title="fans.name"
            class="user-btn inline-block w-14 shrink-0 lg:w-[60px]"
            type="button"
          >
            <img
              lazy="false"
              class="aspect-square w-full rounded-xl object-cover lg:rounded-2xl"
              :alt="fans.name"
              :src="$avatarURL(fans.avatar_id)"
            >
          </div>
          <div class="w-0 flex-1 truncate text-left">
            <div class="truncate text-base font-semibold">
              {{ fans.name }}
            </div>
            <div class="text-xs">
              Score : {{ fans.fans_point }}
            </div>
          </div>
        </button>
      </li>
    </ul>
    <BottomSheet ref="bottomSheet" :title="$t('fansranking')" :items="data" size-dependencies="name" :ignore="['#user-draggable']">
      <template #default="{ item, index }">
        <div
          class="flex min-h-[120px] items-center justify-start gap-4 border-r border-slate-100/60 px-6 py-1 hover:bg-slate-300/30 dark:border-dark-1/80 dark:hover:bg-dark-3/30"
        >
          <div class="font-semibold">
            {{ index + 1 }}
          </div>
          <button type="button" class="user-btn" aria-label="Open user detail" @click="(e) => userClick(e, item.id)">
            <img
              :key="item.id"
              lazy="false"
              class="h-20 w-20 cursor-pointer rounded-xl bg-transparent p-2 transition-colors md:h-24 md:w-24"
              :alt="item.name"
              :src="$avatarURL(item.avatar_id)"
            >
          </button>
          <div class="w-0 flex-1 font-semibold">
            {{ item.name }}
          </div>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>
