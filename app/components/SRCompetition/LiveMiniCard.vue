<script lang="ts" setup>
defineProps<{
  live: INowLive
}>()

const { locale } = useI18n()
const dayjs = useDayjs()
</script>

<template>
  <NuxtLink
    :to="`/watch/${live.url_key ?? '0'}`"
    class="group flex items-center gap-2.5 rounded-lg border border-black/10 bg-black/2 p-2.5 transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-white/3 dark:hover:bg-white/7"
  >
    <Image
      :src="live.img_alt || live.img || $errorPicture"
      :alt="`${live.name} live`"
      class="size-12 shrink-0 rounded-full object-cover"
      fit="cover"
      :modifiers="{ aspectRatio: 1, gravity: 'faceCenter' }"
      sizes="48"
      format="webp"
    />

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold leading-tight">
        {{ live.name }}
      </p>
      <p class="mt-0.5 text-[11px] opacity-65">
        {{ live.is_premium ? 'Premium Live' : dayjs(live.started_at).locale(locale).fromNow() }}
      </p>
    </div>

    <span class="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white">
      <Icon name="heroicons:video-camera-16-solid" class="size-3.5" />
      Watch
    </span>
  </NuxtLink>
</template>
