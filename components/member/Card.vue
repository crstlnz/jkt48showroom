<script lang="ts" setup>
const props = defineProps<{
  member: IMember
}>()
const config = useAppConfig()
const openMenu = ref(false)
const listener = ref<any>(undefined)
const container = ref(null)
watch(openMenu, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(container, () => (openMenu.value = false))
  }
  else {
    listener?.value()
  }
})

const allowed = ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'showroom-live.com']
const socials = computed(() => {
  return (props.member?.socials ?? []).filter(i => allowed.some(u => i.url?.includes(u)))
})
</script>

<template>
  <div
    ref="container"
    class="bg-container flex flex-col items-stretch gap-3 overflow-hidden rounded-2xl p-5 lg:p-8"
  >
    <div class="h-24 w-24 self-center overflow-hidden rounded-full shrink-0">
      <NuxtLink :to="`/member/${member.url}`">
        <NuxtImg
          class="h-full w-full"
          :src="member.img_alt ?? member.img ?? config.errorPicture"
          :alt="`${member.name} Profile Picture`"
          fit="fill"
          :modifiers="{
            aspectRatio: 1,
            gravity: 'faceCenter',
          }"
          width="96px"
          :placeholder="[10, 10, 75, 5]"
          format="webp"
        />
      </NuxtLink>
    </div>
    <div class="text-center">
      <NuxtLink :to="`/member/${member.url}`" class="truncate text-xl font-bold">
        {{ member.nicknames[0] || member.name }}
      </NuxtLink>
      <div class="flex justify-center gap-2 items-center">
        <div class="text-base" :class="member.group === 'official' ? 'text-blue-500' : (member.is_graduate ? 'text-red-500' : 'text-green-500')">
          {{ member.group === 'official' ? "Official" : (member.is_graduate ? "Graduated" : "Active") }}
        </div>
        <div class="bg-black/40 dark:bg-white/40 w-1.5 h-1.5 rounded-full" />
        <div v-if="member.generation" class="text-sm opacity-60 font-semibold">
          {{ parseGeneration(member.generation) || member.generation }}
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-3 text-xl px-5">
      <NuxtLink v-for="[i, social] in socials.entries()" :key="i" :to="social.url" target="_blank" class="w-8 h-8 lg:h-10 lg:w-10 hover:bg-blue-400/30 transition-colors duration-300 rounded-md">
        <Icon v-if="!social.url.includes('showroom-live')" :name="$getSocialIcon(social.url) ?? ''" class="size-full p-1 lg:p-2" />
        <div v-else class="size-full p-0.5 lg:p-1.5">
          <img src="/svg/showroom.svg" alt="" class="size-full rounded-md text-white">
        </div>
      </NuxtLink>
    </div>
    <div class="flex flex-1 items-end">
      <NuxtLink :to="`/member/${member.url.replace('/', '')}`" class="w-full rounded-full bg-blue-500 p-3 text-center text-white">
        {{ $t('viewprofile') }}
      </NuxtLink>
    </div>
  </div>
</template>
