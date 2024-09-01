<script lang="ts" setup>
const { data: members, pending, error } = await useApiFetch<SousenkyoMember[]>(`/api/sousenkyo/members`)
const openVideo = ref(false)
const sousenkyoMember = ref<SousenkyoMember>()

function watchVideo(member?: SousenkyoMember | null) {
  if (!member) return
  push({
    isOpen : true,
    sousenkyoMember : JSON.stringify(member)
  })
}


const { onState, push, back } = usePopState<{ isOpen: boolean, sousenkyoMember: string }>("sousenkyo2024")
onState((state) => {
  openVideo.value = state?.isOpen ?? false
  if (state?.sousenkyoMember) {
    sousenkyoMember.value = JSON.parse(state.sousenkyoMember)
  }
})
</script>

<template>
  <div>
    <div v-if="pending" class="flex min-h-[100vh] w-full flex-1 items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <Error v-else-if="error"
      :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')"
      :img-src="error?.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    <LayoutSingleRow v-else title="Sousenkyo 2024">
      <template #default>
        <Transition name="fade">
          <SousenkyoVideoDialog v-if="openVideo && sousenkyoMember" :data="sousenkyoMember" :key="sousenkyoMember.id"
            @on-dismiss="back" />
        </Transition>
        <div>
          <div v-if="!members?.length" class="flex aspect-video w-full flex-col items-center justify-center">
            <NuxtImg class="mx-auto aspect-square w-72 max-w-[80%]"
              :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <div v-else
            class="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-3 md:px-4">
            <div v-for="member in members" :key="member.id" class="bg-container rounded-xl p-3 md:p-4">
              <DeferImage :alt="member.name" :src="`https://ssk.jkt48.com/2024${member.data?.mobileBg}`"
                class="bg-black/20 overflow-hidden aspect-[2.5/3] w-full object-cover object-[0px_-120px] rounded-xl" />
              <!-- <img :src="`https://ssk.jkt48.com/2024${member.data?.mobileBg}`" class="bg-black/20 aspect-[2.5/3] w-full object-cover object-[0px_-120px] rounded-xl"> -->
              <div class="py-1.5">{{ member.name }}</div>
              <button @click="() => watchVideo(member)" type="button"
                class="bg-red-500 px-3 py-1.5 rounded-xl w-full flex items-center justify-start gap-1">
                <Icon name="material-symbols-light:play-circle-outline" class="text-xl md:text-2xl" />
                <span class="flex-1 text-center text-ellipsis min-w-0 text-nowrap overflow-hidden text-sm md:text-base">{{ $t("watch_sousenkyo") }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
      <template #actionSection>
        <a href="https://ssk.jkt48.com/2024/id/vote" target="_blank" class="mx-auto block max-w-[400px] rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 px-3 pb-1 pt-1 text-center font-bold text-white shadow-lg">Vote</a>
      </template>
    </LayoutSingleRow>
  </div>
</template>
