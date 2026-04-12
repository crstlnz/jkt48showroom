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

const socials = computed(() => {
  return getAllowedSocials(props.member?.socials ?? [])
})
</script>

<template>
  <div
    ref="container"
    class="bg-container flex flex-col items-stretch gap-1.5 overflow-hidden rounded-2xl px-2.5 pt-2.5 pb-2"
  >
    <div class="w-full flex-1 self-center overflow-hidden rounded-2xl">
      <NuxtLink class="size-full!" :to="`/member/${member.url}`">
        <Image
          class="size-full object-cover"
          :src="member.img_alt ?? member.img ?? config.errorPicture"
          :alt="`${member.name} Profile Picture`"
          fit="fill"
          :modifiers="{
            aspectRatio: 0.9,
            gravity: 'faceCenter',
          }"
          sizes="300px"
          :placeholder="[10, 10, 75, 5]"
          format="webp"
        />
      </NuxtLink>
    </div>
    <div class="font-bold text-base lg:text-lg text-center">
      {{ member.nicknames[0] || member.name }}
    </div>
    <!-- <div class="text-center">
      <NuxtLink :to="`/member/${member.url}`" class="truncate text-xl font-bold">
        {{ member.nicknames[0] || member.name }}
      </NuxtLink>
      <TeamBadge :team="member.team" />
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
    <div class="flex justify-center gap-x-2 gap-y-1 text-xl px-8 flex-wrap">
      <SocialIcon v-for="[i, social] in socials.entries()" :key="i" :social="social" class="w-7 h-7 lg:h-8 lg:w-8 hover:bg-blue-400/30 transition-colors duration-300 rounded-md" />
    </div>
    <div class="flex flex-1 items-end">
      <NuxtLink :to="`/member/${member.url.replace('/', '')}`" class="w-full rounded-full bg-blue-500 p-3 text-center text-white">
        {{ $t('viewprofile') }}
      </NuxtLink>
    </div> -->
  </div>
</template>
