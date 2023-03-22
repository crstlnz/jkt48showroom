<script lang="ts" setup>
import { LazyImage } from '#components'
defineProps<{
  member: IMember;
  isLive: boolean;
}>()
const openMenu = ref(false)
const listener = ref<any>(undefined)
const container = ref(null)
watch(openMenu, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(container, () => (openMenu.value = false))
  } else {
    listener?.value()
  }
})
</script>

<template>
  <div
    ref="container"
    class="relative flex aspect-[10/14] flex-col gap-2 overflow-hidden rounded-xl bg-white px-4 py-8 dark:bg-dark-1 md:aspect-[10/13] md:gap-3 md:py-8 xl:gap-4 xl:px-5 xl:py-10"
  >
    <div class="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 md:p-3 lg:p-4">
      <div>
        <div v-if="isLive" class="flex">
          <div class="relative aspect-square w-6">
            <div class="absolute top-1/2 left-1/2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500">
              <div class="absolute top-0 aspect-square w-full animate-ping rounded-full bg-red-500" />
              <div class="aspect-square w-full rounded-full" />
            </div>
          </div>
          <div class="hidden font-semibold text-red-500 sm:block">
            Live
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Open Card Menu"
        class="z-10 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full hover:bg-slate-300/50 md:w-6"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs text-white md:text-base" />
      </button>
    </div>
    <a
      v-if="isLive"
      :tabindex="openMenu ? -1 : undefined"
      title="Member is on live!"
      :href="$liveURL(member.url)"
      class="group relative mx-auto flex aspect-square h-20 items-center justify-center gap-0.5 overflow-hidden rounded-full font-bold text-white ring ring-red-500 ring-offset-2 drop-shadow-sm dark:ring-offset-dark-1 md:h-24 xl:h-28"
      target="_blank"
    >
      <LazyImage
        lazy="false"
        class="relative h-full w-full brightness-100 transition-all duration-200"
        :alt="member.name + 'display picture'"
        :src="$fixCloudinary(member.img_alt ?? '')"
      />
    </a>
    <NuxtLink
      v-else
      :tabindex="openMenu ? -1 : null"
      class="group relative mx-auto flex aspect-square h-20 items-center justify-center gap-0.5 overflow-hidden rounded-full font-bold text-white drop-shadow-sm md:h-24 xl:h-28"
    >
      <LazyImage
        lazy="false"
        aria-label="View profile"
        class="relative h-full w-full brightness-100 transition-all duration-200"
        :src="$fixCloudinary(member.img_alt ?? '')"
      />
    </NuxtLink>
    <h2 class="truncate text-center text-sm font-bold md:text-base xl:text-lg">
      {{ member.name }}
    </h2>
    <div
      class="mx-auto select-none rounded-full px-2.5 py-1 text-[10px] text-white md:text-xs xl:text-sm"
      :class="member.is_group ? 'bg-sky-400' : member.is_graduate ? 'bg-red-500' : 'bg-green-500'"
      :title="`${member.is_group ? 'Official' : member.is_graduate ? 'Graduated' : 'Active'} Member`"
    >
      {{ member.is_group ? "Official" : member.is_graduate ? "Graduated" : "Active" }}
    </div>
    <div class="hidden text-center text-xs sm:line-clamp-2 md:text-sm md:line-clamp-3 xl:line-clamp-4">
      {{ member.description?.length ? member.description : "No Description." }}
    </div>
    <NuxtLink
      :to="`/member/${member.room_id}`"
      :tabindex="openMenu ? -1 : null"
      class="mx-auto mt-auto flex min-w-[80%] cursor-pointer items-center justify-center gap-1.5 truncate rounded-xl bg-blue-500 px-5 py-2 text-[10px] font-semibold text-white hover:bg-blue-600 sm:text-xs md:text-sm xl:py-3 xl:text-base"
    >
      <Icon name="ph:user-fill" class="seft-center text-xs sm:text-base md:text-lg" />{{ $t("viewprofile") }}
    </NuxtLink>

    <div
      class="visible absolute top-0 left-0 z-[9] flex h-full w-full flex-col justify-center rounded-t-xl bg-red-500 p-3 text-white transition-[transform,visibility] duration-300 sm:p-4 md:p-5"
      :class="{ 'invisible translate-y-full': !openMenu }"
    >
      <ul
        :class="{ 'no-scrollbar': $device.isMobile }"
        class="flex max-h-[75%] flex-col overflow-hidden overflow-y-auto text-lg [&>li]:my-3 [&>li]:cursor-pointer [&>li]:px-4 [&>li]:text-center [&>li]:font-semibold"
      >
        <li>
          <a target="_blank" :href="$profileURL(member.room_id)">Showroom</a>
        </li>
      </ul>
    </div>
  </div>
</template>
