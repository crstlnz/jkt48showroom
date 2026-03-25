<script lang="ts" setup>
defineProps<{
  theater: IApiTheaterInfo
}>()

const { locale } = useI18n()
</script>

<template>
  <NuxtLink
    :title="theater.title"
    :to="`/theater/${theater.id}`"
    class="group relative block aspect-3/4 overflow-hidden rounded-xl border border-black/10 bg-container shadow-2xs transition-all duration-300 hover:shadow-md dark:border-white/10"
  >
    <Image
      :modifiers="{
        aspectRatio: '0.727',
        gravity: 'center',
      }"
      sizes="260px"
      format="webp"
      :alt="theater.title"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 scale-[1.005] group-hover:scale-105"
      :src="theater.poster ?? theater.banner ?? $errorPicture"
    />
    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
    <div class="absolute inset-0 ring-1 ring-inset ring-white/8" />

    <div class="absolute left-1.5 top-1.5 flex items-center gap-1.5">
      <div class="rounded-md bg-blue-500/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm md:text-xs">
        {{ $dayjs(theater.date).locale(locale).format("DD MMM YYYY") }}
      </div>
      <div class="rounded-md bg-red-500/60 backdrop-blur-sm px-1.5 py-1 text-[10px] font-semibold text-white md:text-xs">
        {{ $dayjs(theater.start_date).locale(locale).format("HH:mm") }}
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-0 p-1.5">
      <div class="rounded-lg bg-black/65 px-2.5 py-2 text-white backdrop-blur-xs">
        <div class="line-clamp-1 text-xs font-semibold leading-snug md:text-sm">
          {{ theater.title }}
        </div>
        <div class="mt-1 inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/90 md:text-xs">
          <Icon name="fluent:people-20-filled" class="size-3.5" />
          <span>{{ $t('member_count', { count: theater.member_count ?? 0 }) }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
