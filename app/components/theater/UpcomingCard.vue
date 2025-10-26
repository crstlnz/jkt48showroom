<script lang="ts" setup>
const props = defineProps<{
  theater: IApiTheaterInfo
}>()

const theaterState = computed(() => getTheaterState(props.theater.date))
const { locale } = useI18n()
</script>

<template>
  <NuxtLink :to="`/theater/${theater.url}`" class="bg-container p-3 md:p-4 rounded-xl flex flex-col gap-3">
    <div class="rounded-xl bg-black/10  w-full relative">
      <div v-if="theaterState === 'ongoing'" class="absolute flex items-center gap-2 top-0 left-0 m-3 bg-red-500 font-semibold px-2.5 py-1 rounded-xl t border border-black/20">
        <div class="relative size-3">
          <div class="absolute inset-0 animate-ping rounded-full bg-green-500" />
          <div class="absolute inset-0 rounded-full bg-green-500" />
        </div>
        <span>
          {{ $t(theaterState) }}
        </span>
      </div>
      <div v-else-if="$dayjs(theater.date).isToday()" class="absolute top-0 left-0 m-3 bg-red-500 font-semibold text-white px-2.5 py-1 rounded-xl t border border-black/20">
        {{ $t('today') }}
      </div>
      <div v-else-if="$dayjs(theater.date).isTomorrow()" class="absolute top-0 left-0 m-3 bg-orange-500 font-semibold text-white px-2.5 py-1 rounded-xl t border border-black/20">
        {{ $t('tomorrow') }}
      </div>
      <NuxtImg
        class="w-full object-cover rounded-xl aspect-[5/2.5]"
        :src="theater.banner ?? theater.poster ?? $errorPicture"
        alt="Label"
        loading="lazy"
        fit="fill"
        width="450px"
        format="webp"
      />
    </div>
    <div class="flex justify-between">
      <div>
        <div class="font-semibold">
          {{ theater.title }}
        </div>
        <div class="font-extralight leading-4 mt-1">
          {{ $dayjs(theater.date).locale(locale).format("DD MMMM YYYY") }}
        </div>
      </div>
      <div class="text-sm bg-blue-500 text-white px-2.5 rounded-xl py-1 self-start whitespace-nowrap">
        {{ $t('member_count', { count: theater.member_count }) }}
      </div>
    </div>
  </NuxtLink>
</template>
