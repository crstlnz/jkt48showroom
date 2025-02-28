<script lang="ts" setup>
import { ImageViewer, NuxtLink } from '#components'
import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'

const props = defineProps<{
  member: Database.IMemberBasicData | IMemberProfileAPI
  roomId?: number
  shareUrl?: string
  sousenkyo?: SousenkyoMember
}>()
const { isLive: checkLive, getLive } = useOnLives()
const isLive = computed(() => {
  return props.roomId ? checkLive(props.roomId || 0) : false
})

const liveData = computed(() => {
  return props.roomId ? getLive(props.roomId || 0) : false
})

const { currentURL } = useSettings()
const shareUrl = computed(() => {
  if (props.shareUrl) return props.shareUrl
  return currentURL
})

const route = useRoute()

const imageViewer = ref<typeof ImageViewer>()
function openProfileImage() {
  if (route.path === `/member/${props.member.url}` && imageViewer.value) {
    imageViewer.value.open({
      src: props.member.img_alt ?? props.member.img ?? useNuxtApp().$errorPicture,
      alt: `${props.member.name} Profile Picture`,
    })
  }
}

function getLiveUrl(member: INowLive) {
  if (member.type === 'idn') {
    return `/watch/${member.url_key}/idn`
  }
  else {
    return `/watch/${member.url_key}`
  }
}
</script>

<template>
  <div class="flex flex-col relative">
    <ImageViewer
      ref="imageViewer"
    />
    <NuxtImg
      sizes="500px sm:600px md:900px lg:1000px"
      :modifiers="{
        aspectRatio: 4.5 / 1,
      }"
      :placeholder="[45, 10, 75, 50]"
      fit="fill"
      format="webp"
      :alt="`${member.name} banner`"
      class="bg-container aspect-[15/5] w-full md:aspect-[15/3] object-cover"
      :src="member.banner || $getDefaultBanner(member.group)"
    />
    <div class="flex flex-col gap-3 px-3 lg:px-4">
      <div class="flex -mb-1.5 md:-mb-2 flex-col">
        <div class="flex gap-3 md:gap-4 justify-between">
          <component
            :is="route.path === `/member/${member.url}` ? 'button' : NuxtLink"
            :to="liveData ? getLiveUrl(liveData) : `/member/${member.url}`"
            class="p-1.5 md:p-2 -ml-1.5 md:-ml-2 bg-background relative mt-[-40px] h-[85px] w-[85px] sm:w-[100px] sm:h-[100px] shrink-0 rounded-full sm:mt-[-30px] md:mt-[-35px] 2xl:mt-[-56px] md:h-[120px] md:w-[120px] 2xl:h-[140px] 2xl:w-[140px]"
            @click="openProfileImage"
          >
            <div v-if="isLive" class="absolute bottom-[14.5%] right-[14.5%] z-10 h-[15%] w-[15%] translate-x-1/2 translate-y-1/2">
              <div class="absolute inset-0 z-10 rounded-full bg-red-500" />
              <div class="absolute inset-0 -z-10 animate-ping rounded-full bg-red-500" />
            </div>
            <NuxtImg
              class="aspect-square size-full object-cover rounded-full"
              :src="member.img_alt ?? member.img ?? $errorPicture"
              :alt="`${member.name} Profile Picture`"
              fit="fill"
              :modifiers="{
                aspectRatio: 1,
                gravity: 'faceCenter',
              }"
              sizes="90px sm:100px md:120px 2xl:140px"
              :placeholder="[10, 10, 75, 5]"
              format="webp"
            />
          </component>
          <div class="flex gap-3 items-center">
            <NuxtLink target="_blank" :to="$profileURL(roomId ?? 0)" class="rounded-full bg-blue-500 px-2.5 h-6 leading-6 md:leading-9 md:h-9 md:px-4 text-xs sm:text-sm text-white self-center flex items-center">
              Showroom
            </NuxtLink>
            <NuxtLink target="_blank" class="rounded-full bg-blue-500 gap-1 px-2.5 h-6 leading-6 md:leading-9 md:h-9 md:px-4 text-xs sm:text-sm text-white self-center flex items-center" :to="`https://twitter.com/intent/tweet?text=${shareUrl}`" data-size="large">
              <Icon name="mdi:twitter" class="text-lg md:text-xl" />
              <span>Share</span>
            </NuxtLink>
            <AdminEditMemberButton :room-id="roomId" class="h-7 md:h-9" />
          </div>
        </div>
        <div class="flex min-w-0 self-start flex-1 items-start justify-end flex-col mb-0.5">
          <div class="font-semibold flex gap-3 md:gap-4 self-stretch items-center">
            <div class="flex-1 text-2xl md:text-3xl">
              {{ (member.nickname || member.name)?.split("-")?.[0] }}
            </div>
          </div>
          <div class="flex gap-2 text-xs md:text-sm">
            <div
              class="select-none font-bold"
            >
              <div v-if="member.is_group" class="text-sky-400">
                Official
              </div>
              <div v-else-if="member.is_graduate" class="text-red-500">
                Graduated
              </div>
              <div v-else class="text-green-500">
                Active
              </div>
            </div>
            <NuxtLink v-if="member.generation" :to="`/member?gen=${member.generation}`" class="select-none text-gray-400 font-bold">
              {{ parseGeneration(member.generation) || member.generation }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
