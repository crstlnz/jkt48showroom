<script lang="ts" setup>
defineProps<{
  error: Error | null
  pending: boolean
  members: IMember[]
}>()
const config = useAppConfig()
</script>

<template>
  <div class="memberList">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="flex flex-col gap-3 px-3"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="item pulse-color-2 h-[104px]"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" :img-src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`" />
    </div>

    <RecycleScroller
      v-else
      key="loaded"
      :prerender="10"
      :min-item-size="116"
      :items="members"
      key-field="_id"
      class="px-3"
      page-mode
    >
      <template #default="{ item: member, index }">
        <div :key="index" class="pb-3">
          <div class="bg-container flex gap-3 rounded-xl p-3">
            <NuxtLink :key="member.room_id" :to="`/member/${member.url}`" class="h-20 w-20 shrink-0 overflow-hidden rounded-full">
              <NuxtImg
                class="h-20 w-20 object-cover"
                :src="member.img_alt ?? member.img ?? config.errorPicture"
                :alt="`${member.name} Profile Picture`"
                fit="fill"
                :modifiers="{
                  aspectRatio: 1,
                  gravity: 'faceCenter',
                }"
                width="80px"
                :placeholder="[5, 5, 55, 100]"
                format="webp"
              />
            </NuxtLink>
            <div class="flex flex-1 flex-col">
              <NuxtLink :to="`/member/${member.url}`" class="font-semibold">
                {{ member.nicknames[0] || member.name }}
              </NuxtLink>
              <div class="flex flex-col justify-between flex-1">
                <div>
                  <div class="flex gap-2 items-center">
                    <div class="text-sm" :class="member.group === 'official' ? 'text-blue-500' : (member.is_graduate ? 'text-red-500' : 'text-green-500')">
                      {{ member.group === 'official' ? "Official" : (member.is_graduate ? "Graduated" : "Active") }}
                    </div>
                    <div class="bg-black/40 dark:bg-white/40 w-1.5 h-1.5 rounded-full" />
                    <div v-if="member.generation" class="text-xs opacity-60 font-semibold">
                      {{ parseGeneration(member.generation) || member.generation }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4 self-end text-base">
                  <SocialIcon v-for="[i, social] in getAllowedSocials(member.socials ?? []).entries()" :key="i" :social="social" class="size-7 hover:bg-blue-400/30 transition-colors duration-300 rounded-md" />
                  <!-- <NuxtLink v-for="[i, social] in getAllowedSocials(member.socials ?? []).entries()" :key="i" :to="social.url" target="_blank" class="h-6 w-6 hover:bg-blue-400/30 transition-colors duration-300 rounded-md">
                    <Icon v-if="!social.url.includes('showroom-live')" :name="$getSocialIcon(social.url) ?? ''" class="size-full p-0.5 opacity-60" />
                    <div v-else class="size-full">
                      <img src="/svg/showroom.svg" alt="" class="size-full rounded-md opacity-60">
                    </div>
                  </NuxtLink> -->
                  <!-- <NuxtLink :to="$liveURL(member.url)" target="_blank" :aria-label="`${member.name} Live`">
                    <Icon name="ic:round-videocam" size="1.6rem" />
                  </NuxtLink>
                  <NuxtLink :to="$profileURL(member.room_id)" target="_blank" :aria-label="`${member.name} Showroom Profile`">
                    <Icon name="ic:round-person" size="1.6rem" />
                  </NuxtLink>
                  <NuxtLink :to="`/member/${member.url}`">
                    <Icon name="mdi:card-account-details-outline" size="1.6rem" :aria-label="`${member.name} Profile`" />
                  </NuxtLink> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style lang="scss">
.memberList{
  .item {
    @apply aspect-[10/14] md:aspect-[13/16] rounded-xl animate-pulse shadow-sm;
  }
}
</style>
