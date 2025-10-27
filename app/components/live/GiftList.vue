<script lang="ts" setup>
defineProps<{
  gifts: LogDetail.IDNGift[] | LogDetail.ShowroomGift[]
  type: LogType
}>()

function getNumColor(num: number) {
  if (num <= 100) {
    return 'bg-blue-500 dark:bg-blue-400'
  }
  else if (num <= 500) {
    return 'bg-green-500 dark:bg-green-400'
  }
  else if (num <= 1000) {
    return 'bg-violet-500 dark:bg-violet-400'
  }
  else {
    return 'bg-red-500 dark:bg-red-400'
  }
}
</script>

<template>
  <div class="bg-container overflow-hidden rounded-xl p-3 md:p-4">
    <div class="text-lg font-bold md:text-xl">
      {{ $t("giftlist") }}
    </div>
    <ul v-if="gifts.length" class="grid-gift-list mt-4 gap-3">
      <li v-for="gift in gifts" :key="gift.id">
        <div class="flex gap-3 md:gap-4 w-full">
          <img :class="{ 'h-12 w-12 md:h-14 md:w-14 scale-[120%] origin-center': type === 'idn', 'h-10 w-10 md:h-12 md:w-12': type === 'showroom' }" class="ml-1" :src="gift.img" alt="Gift Icon">
          <div class="flex-1 w-0">
            <div class="flex items-center gap-1.5 w-full">
              <span class="font-semibold truncate">{{ gift.name?.split(" ")?.map(i => i.slice(0, 1).toLocaleUpperCase() + i.slice(1))?.join(" ") }}</span>
              <span :class="getNumColor(gift.num)" class="shrink-0 rounded-md px-1 py-0.5 text-xs font-semibold text-white">x{{ gift.num }}</span>
            </div>
            <div class="flex items-center space-x-1.5 text-sm md:text-base font-light">
              <span class="flex items-center gap-1">
                <Icon class="text-yellow-500" name="solar:star-fall-bold-duotone" />
                {{ $n(gift.point) }}{{ gift.point > 1 ? ' pts' : ' pt' }}
              </span>
              <Icon name="radix-icons:dot-filled" />
              <div class="flex items-center gap-1">
                <Icon class="text-blue-500 mb-px" name="heroicons:users-solid" />
                <span> {{ $n(gift.user_count) }}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="mb-7 text-center">
      <NuxtImg class="mx-auto w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
      <span>{{ $t("data.nodata") }}</span>
    </div>
  </div>
</template>
