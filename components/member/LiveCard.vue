<template>
  <div
    ref="container"
    class="px-3 md:px-4 md:p-5 py-6 md:py-8 xl:py-10 bg-slate-50/50 shadow-md dark:bg-dark-2/50 rounded-xl gap-2 md:gap-3 xl:gap-5 flex flex-col relative overflow-hidden"
  >
    <div class="flex justify-between items-center absolute left-0 right-0 top-0 p-2.5 md:p-3 lg:p-4">
      <div
        :class="live.is_group ? 'bg-sky-400' : live.is_graduate ? 'bg-red-500' : 'bg-green-500'"
        class="aspect-square w-5 md:w-6 rounded-full flex justify-center items-center text-white select-none"
        :title="`${live.is_group ? 'Official' : live.is_graduate ? 'Graduated' : 'Active'} Member`"
      >
        <Icon
          :name="
            live.is_group ? 'ic:round-check font-bold' : live.is_graduate ? 'ph:graduation-cap' : 'ph:microphone-stage'
          "
          class="i aspect-square text-xs md:text-sm"
        />
      </div>
      <button
        type="button"
        class="aspect-square w-5 md:w-6 rounded-full hover:bg-slate-300/50 flex justify-center items-center cursor-pointer select-none z-10"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs md:text-base text-white" />
      </button>
    </div>
    <NuxtLink
      :tabindex="openMenu ? -1 : null"
      disabled
      aria-label="View profile"
      :class="{ 'pointer-events-none': openMenu }"
      class="z-0 h-20 md:h-24 lg:h-28 aspect-square drop-shadow-sm gap-0.5 rounded-full overflow-hidden mx-auto"
      no-prefetch
    >
      <LazyImage
        lazy="false"
        class="group-hover:brightness-50 brightness-100 relative cursor-pointer transition-all duration-200 w-full h-full"
        :src="$fixCloudinary(live.img)"
      />
    </NuxtLink>
    <h2 class="font-bold text-sm md:text-lg text-center line-clamp-2 flex-1 h-0">
      {{ live.name }}
    </h2>
    <div
      v-if="!pending"
      class="bg-red-500 rounded-xl px-2 py-1 md:px-3 md:py-2 mx-auto text-white md:font-semibold text-xs"
    >
      <div v-if="startDate">{{ date }}</div>
      <div v-else>
        Error
        <button type="button" @click="$emit('refreshliveinfo')">
          <Icon name="ion:md-refresh" class="text-base self-center" />
        </button>
      </div>
    </div>
    <div v-else class="h-6 md:h-8 w-[74px] animate-pulse bg-red-500 mx-auto rounded-xl" />
    <a
      :tabindex="openMenu ? -1 : undefined"
      :href="$liveURL(live.url)"
      target="_blank"
      class="flex justify-center items-center gap-1.5 w-full text-center p-2 md:px-5 md:py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-xl mx-auto font-semibold text-white text-xs sm:text-sm md:text-base"
      ><Icon name="ph:video-camera-fill" class="seft-center text-base md:text-lg" /> View Live</a
    >

    <div
      class="absolute visible flex flex-col justify-center p-3 sm:p-4 md:p-5 bg-red-500 top-0 left-0 w-full h-full transition-[transform,visibility] duration-300 rounded-t-xl z-[9] text-white"
      :class="{ 'translate-y-full invisible': !openMenu }"
    >
      <ul
        :class="{ 'no-scrollbar': $device.isMobile }"
        class="flex flex-col text-lg [&>li]:cursor-pointer [&>li]:font-semibold [&>li]:my-3 [&>li]:px-4 [&>li]:text-center max-h-[75%] overflow-hidden overflow-y-auto"
      >
        <li><NuxtLink to="/" no-prefetch>Profile</NuxtLink></li>
        <li>
          <a target="_blank" :href="$profileURL(live.room_id)">Showroom</a>
        </li>
        <li>
          <a
            target="_blank"
            class="twitter-share-button"
            :href="$tweetURL(`${live.name}%20Broadcasting!%0Ahttps://www.showroom-live.com${live.url}`)"
            data-size="large"
          >
            Tweet</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
const { $formatSR } = useNuxtApp();
const props = defineProps<{ live: INowLive; startDate: string | null; pending: boolean }>();
defineEmits(["refreshliveinfo"]);
const openMenu = ref(false);
const container = ref(null);
const listener = ref<any>(undefined);
const date = $formatSR(props.startDate);
watch(openMenu, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(container, () => (openMenu.value = false));
  } else {
    listener?.value();
  }
});
</script>
