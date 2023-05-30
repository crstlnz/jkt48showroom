<script lang="ts" setup>
const props = defineProps<{
  live: IRoomLive
}>()
const config = useAppConfig()
const { $formatSR } = useNuxtApp()
const dateString = $formatSR(props.live.started_at)
</script>

<template>
  <div>
    <NuxtLink target="_blank" :to="$liveURL(live.url)" class="my-1 flex items-start gap-3">
      <img class="aspect-square w-[70px] rounded-full object-cover" :src="$fixCloudinary(live.img_alt ?? live.img ?? config.errorPicture)" :alt="`${live.name} Profile picture`">
      <div class="flex w-0 flex-1 flex-col items-start gap-2 self-stretch">
        <div class="text-base font-semibold">
          {{ live.name }}
        </div>
        <div class="flex gap-2">
          <div
            :class="live.is_group ? 'bg-sky-400' : live.is_graduate ? 'bg-red-500' : 'bg-green-500'"
            class="flex aspect-square h-4 select-none items-center justify-center rounded-full p-1 text-white md:h-5"
            :title="`${live.is_group ? 'Official' : live.is_graduate ? 'Graduated' : 'Active'} Member`"
          >
            <Icon
              :name="
                live.is_group ? 'ph:check-circle-fill' : live.is_graduate ? 'ph:graduation-cap-fill' : 'ph:microphone-stage-fill'
              "
              class="i aspect-square text-xs font-bold md:text-xs"
            />
            <div class="text-xs leading-5 md:font-semibold" />
          </div>
          <div class="rounded-md bg-red-500 px-1 text-sm font-semibold text-white">
            {{ dateString }}
          </div>
        </div>
      </div>
    </nuxtlink>
  </div>
</template>
