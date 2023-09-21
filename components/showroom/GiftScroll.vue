<script lang="ts" setup>
import { useSelectedUser } from '~/store/selectedUser'

defineProps<{ gifts: IFansGift[]; pageMode?: boolean }>()

const { userClick } = useSelectedUser()
const { height } = useWindowSize()
const bufferSize = computed(() => {
  return height.value
})
</script>

<template>
  <div>
    <DynamicScroller
      :class="{ 'roundedscrollbar h-full w-full': pageMode !== null || pageMode !== false }"
      :min-item-size="164"
      :items="gifts"
      key-field="id"
      :buffer="bufferSize"
      :page-mode="pageMode"
      class="z-0"
    >
      <template #before>
        <div
          class="-z-10 rounded-xl border-b-2 border-slate-100/60 bg-white/90 p-4 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5 lg:text-2xl"
        >
          {{ $t("fansgift") }}
        </div>
      </template>

      <template #default="{ item, index, active }">
        <DynamicScrollerItem :key="item.id" :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
          <div class="space-y-2 border-b-2 border-slate-100/60 p-3 dark:border-dark-2/60 md:p-4">
            <button type="button" class="truncate text-lg font-bold" :title="item.name" @click="(e) => userClick(e, item.id)">
              {{ item.name }}
            </button>
            <div class="flex gap-2.5 md:gap-3.5">
              <button type="button" class="user-btn" aria-label="Open user detail" @click="(e) => userClick(e, item.id)">
                <img
                  :key="item.id"
                  class="h-[70px] w-[70px] rounded-lg bg-slate-100/90 p-2 hover:bg-slate-200 dark:bg-slate-100/5 hover:dark:bg-slate-300/10 lg:h-20 lg:w-20"
                  :src="$avatarURL(item.avatar_id)"
                  :alt="`${item.name} Avatar`"
                >
              </button>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap gap-2 pb-[8px] md:gap-2.5">
                  <div v-for="gift in item.gifts" :key="item.id + gift.id" v-tooltip="$currency(gift.point)" class="relative">
                    <div class="max-h-[45px] max-w-[45px]">
                      <img :key="`${item.id}${gift.id}`" :src="gift.img" alt="Gift" class="aspect-square">
                      <div
                        v-if="gift.num > 1"
                        :class="$getNumColor(gift.num)"
                        class="text-stroke absolute bottom-[-10px] right-0 rounded-full text-right text-sm font-extrabold leading-6"
                      >
                        x{{ gift.num >= 1000 ? `${(gift.num / 1000).toFixed(0)}k` : gift.num }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right text-base font-semibold">
              {{ $currency(item.total) }}
            </div>
          </div>
        </DynamicScrollerItem>
      </template>

      <template v-if="!gifts.length" #empty>
        <div class="flex aspect-[9/8] items-center justify-center">
          <div class="flex flex-col">
            <img class="mx-auto h-auto w-[300px] max-w-[90%]" :alt="$t('giftempty')" src="/img/empty-box.png">
            <div class="mt-3 text-center font-bold">
              {{ $t("giftempty") }}
            </div>
          </div>
        </div>
      </template>
    </DynamicScroller>
  </div>
</template>
