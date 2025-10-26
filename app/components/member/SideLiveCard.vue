<script lang="ts" setup>
defineProps<{
  live: {
    img_alt?: string
    img?: string
    name: string
    url: string
    is_premium: boolean
    started_at?: Date | null
    type: 'youtube' | 'idn' | 'showroom'
  }
}>()
const { locale } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-start gap-3 border-b border-color-1 pt-1 pb-3">
      <NuxtLink :external="live.type === 'youtube'" :to="live.type === 'youtube' ? live.url : `/watch/${live.url}`" class="group rounded-xl overflow-hidden">
        <NuxtImg
          class="aspect-4/5 w-[85px] object-cover scale-[100.01%] group-hover:scale-110 transition-transform duration-500"
          :modifiers="{
            aspectRatio: 4 / 5,
            gravity: 'faceCenter',
          }"
          fit="fill"
          width="85px"
          :src="live.img_alt ?? live.img ?? $errorPicture" :alt="`${live.name} Profile picture`"
        />
      </NuxtLink>
      <div class="flex min-w-0 flex-1 flex-col items-start self-stretch">
        <div class="text-sm">
          {{ live.name }}
        </div>
        <div class="flex gap-2">
          <div v-if="!live.is_premium" class="rounded-md text-sm font-light dark:font-extralight">
            {{ $dayjs(live.started_at).locale(locale).fromNow() }}
          </div>
          <div v-else class="inline-block h-4 rounded-md bg-gray-500 px-1.5 align-middle text-[10px] leading-4 text-white md:h-5 md:text-xs md:font-semibold md:leading-5">
            Premium Live
          </div>
        </div>
        <div
          class="flex-1 flex items-end self-end"
        >
          <NuxtLink :to="`/watch/${live.url}`" class="bg-red-500 text-gray-100 px-2 py-1 rounded-md flex-1 flex items-center gap-2">
            <Icon name="heroicons:video-camera-16-solid" />
            <span>Watch</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
