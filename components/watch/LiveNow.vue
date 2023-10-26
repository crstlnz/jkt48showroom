<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

const { roomKey } = defineProps<{
  roomKey: string
}>()
const onLives = useOnLives()
const { data: rawData, pending, error } = storeToRefs(onLives)

const data = computed(() => {
  if (!rawData.value) return null
  return rawData.value.filter(i => i.url !== roomKey)
})
</script>

<template>
  <div class="pt-3">
    <div class="bg-container flex h-full flex-col gap-3 overflow-hidden px-3 pt-3 lg:rounded-xl lg:p-4 lg:pb-5">
      <div class="flex items-center gap-2 text-xl font-bold">
        <Icon name="fluent:live-20-filled" class="text-red-500" size="1.8rem" />
        <span class="pt-1">{{ $t('otherlive') }}</span>
      </div>
      <div>
        <div
          v-if="error"
          class="bg-container flex w-full flex-col items-center justify-center gap-2 rounded-xl pb-5 text-xs shadow-sm md:gap-3 md:text-sm xl:gap-5 xl:pb-8 xl:pt-2"
        >
          <img class="aspect-square w-72 max-w-[70%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
          {{ $t("data.failed") }}
        </div>
        <div
          v-else-if="pending && data == null"
          class="bg-container grid-live-now gap-4 rounded-xl"
        >
          <PulseLiveCard />
        </div>
        <div
          v-else-if="data?.length"
          class="bg-container grid-live-now gap-4 rounded-xl"
        >
          <MemberLiveCard
            v-for="live in data.values()"
            :key="live.room_id"
            class="bg-background"
            :live="live"
          />
        </div>
        <div
          v-else
          class="bg-container flex w-full flex-col items-center justify-center rounded-xl shadow-sm"
        >
          <div class="flex h-[245.5px] flex-col items-center justify-center gap-2 text-center text-xs max-sm:aspect-square sm:h-[230.88px] md:h-[250px] md:gap-3 md:text-sm lg:h-[270.55px] xl:h-[349.2px] 2xl:h-[318px]">
            <img class="mx-auto w-72 max-w-[80%]" alt="No member onlive" :src="`${$cloudinaryURL}/assets/svg/web/space.svg`">
            <span class="mt-5">{{ $t("nolive") }}</span>
          </div>
        </div>
      </div>
      <!-- <div v-if="data?.gift_log?.length" class="roundedscrollbar h-0 flex-1 max-lg:overflow-y-scroll">
                <div class="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-3 lg:grid-cols-[repeat(auto-fill,minmax(60px,1fr))]">
                  <div v-for="gift in sortedGift" :key="gift.id" class="relative max-h-[40px] max-w-[40px] lg:max-h-[50px] lg:max-w-[50px]" :title="$currency(gift.point)">
                    <img :src="gift.image" alt="Gift" class="aspect-square">
                    <div
                      v-if="gift.num > 1"
                      :class="$getNumColor(gift.num)"
                      class="text-stroke absolute bottom-[-7px] right-[-4px] rounded-full text-sm font-extrabold leading-6 lg:text-base"
                    >
                      x{{ gift.num >= 1000 ? `${(gift.num / 1000).toFixed(0)}k` : gift.num }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="h-0 flex-1 overflow-y-auto">
                <div class="flex flex-col items-center justify-center">
                  <img class="h-32" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`">
                </div>
              </div> -->
    </div>
  </div>
</template>
