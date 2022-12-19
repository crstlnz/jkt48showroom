<template>
  <div
    ref="container"
    class="px-4 xl:px-5 py-8 md:py-8 xl:py-10 bg-white dark:bg-dark-1 rounded-xl gap-2 md:gap-3 xl:gap-4 flex flex-col relative overflow-hidden"
  >
    <div class="flex justify-between items-center absolute left-0 right-0 top-0 p-2.5 md:p-3 lg:p-4">
      <div>
        <div v-if="isLive" class="flex">
          <div class="w-6 relative aspect-square">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-2 bg-red-500">
              <div class="absolute top-0 w-full aspect-square rounded-full bg-red-500 animate-ping" />
              <div class="w-full aspect-square rounded-full" />
            </div>
          </div>
          <div class="text-red-500 font-semibold hidden sm:block">Live</div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Open Card Menu"
        class="aspect-square w-5 md:w-6 rounded-full hover:bg-slate-300/50 flex justify-center items-center cursor-pointer select-none z-10"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs md:text-base text-white" />
      </button>
    </div>
    <a
      v-if="isLive"
      :tabindex="openMenu ? -1 : undefined"
      title="Member is on live!"
      :href="$liveURL(member.url)"
      class="h-20 md:h-24 xl:h-28 aspect-square relative group text-white font-bold drop-shadow-sm flex justify-center items-center gap-0.5 rounded-full overflow-hidden mx-auto ring ring-offset-2 dark:ring-offset-dark-1 ring-red-500"
      target="_blank"
    >
      <LazyImage
        lazy="false"
        class="brightness-100 relative transition-all duration-200 w-full h-full"
        :alt="member.name + 'display picture'"
        :src="$fixCloudinary(member.img)"
      />
    </a>
    <NuxtLink
      v-else
      :tabindex="openMenu ? -1 : null"
      class="h-20 md:h-24 xl:h-28 aspect-square relative group text-white font-bold drop-shadow-sm flex justify-center items-center gap-0.5 rounded-full overflow-hidden mx-auto"
    >
      <LazyImage
        lazy="false"
        aria-label="View profile"
        class="brightness-100 relative transition-all duration-200 w-full h-full"
        :src="$fixCloudinary(member.img)"
      />
    </NuxtLink>
    <h2 class="text-sm md:text-base xl:text-lg font-bold text-center truncate">
      {{ member.name }}
    </h2>
    <div
      class="rounded-full text-white select-none mx-auto text-xs px-2.5 py-1"
      :class="member.is_group ? 'bg-sky-400' : member.is_graduate ? 'bg-red-500' : 'bg-green-500'"
      :title="`${member.is_group ? 'Official' : member.is_graduate ? 'Graduated' : 'Active'} Member`"
    >
      {{ member.is_group ? "Official" : member.is_graduate ? "Graduated" : "Active" }}
    </div>
    <div class="text-xs md:text-sm text-center line-clamp-2 sm:line-clamp-3 xl:line-clamp-4">
      {{ member.description?.length ? member.description : "No Description." }}
    </div>
    <NuxtLink
      :to="`/member/${member.room_id}`"
      :tabindex="openMenu ? -1 : null"
      class="min-w-[80%] flex items-center justify-center gap-1.5 mt-auto px-5 py-2 xl:py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-xl mx-auto font-semibold text-white text-xs md:text-sm xl:text-base truncate"
      ><Icon name="ph:user-fill" class="seft-center text-base md:text-lg" />{{ $t("viewprofile") }}</NuxtLink
    >

    <div
      class="absolute visible flex flex-col justify-center p-3 sm:p-4 md:p-5 bg-red-500 top-0 left-0 w-full h-full transition-[transform,visibility] duration-300 rounded-t-xl z-[9] text-white"
      :class="{ 'translate-y-full invisible': !openMenu }"
    >
      <ul
        :class="{ 'no-scrollbar': $device.isMobile }"
        class="flex flex-col text-lg [&>li]:cursor-pointer [&>li]:font-semibold [&>li]:my-3 [&>li]:px-4 [&>li]:text-center max-h-[75%] overflow-hidden overflow-y-auto"
      >
        <li>
          <a target="_blank" :href="$profileURL(member.room_id)">Showroom</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
defineProps<{
  member: IMember;
  isLive: boolean;
}>();
const openMenu = ref(false);
const listener = ref<any>(undefined);
const container = ref(null);
watch(openMenu, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(container, () => (openMenu.value = false));
  } else {
    listener?.value();
  }
});
</script>
