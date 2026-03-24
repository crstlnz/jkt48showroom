<script lang="ts" setup>
const props = defineProps<{
  theater: IApiTheaterInfo
}>()

// const theaterState = computed(() => 'ongoing')
// const theaterState = computed(() => getTheaterState(props.theater.date))
const seitansai = computed(() => props.theater.seitansai ?? [])
const graduation = computed(() => props.theater.graduation ?? [])
const members = computed(() => props.theater.members ?? [])
const { locale } = useI18n()
</script>

<template>
  <div class="group block overflow-hidden rounded-xl border border-black/10 bg-container p-3 transition-all  dark:border-white/10 md:p-4">
    <div class="flex gap-3 md:gap-4">
      <NuxtLink :to="`/theater/${theater.url}`">
        <Image
          class="aspect-4/5.5 w-25 shrink-0 rounded-lg bg-black/10 object-cover md:w-29"
          :src="theater.poster ?? theater.banner ?? $errorPicture"
          alt="Theater Poster"
          loading="lazy"
          fit="fill"
          :modifiers="{
            aspectRatio: '0.727',
            gravity: 'center',
          }"
          sizes="260px"
          format="webp"
        />
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <NuxtLink :to="`/theater/${theater.url}`" class="line-clamp-2 font-semibold leading-5 text-sm md:text-base">
            {{ theater.title }}
          </NuxtLink>
          <div class="shrink-0 rounded-md bg-blue-500/35 text-blue-500 dark:bg-blue-500/15 dark:text-blue-200 px-2 py-0.75 text-[10px] md:text-[11px] font-medium">
            {{ $t('member_count', { count: theater.member_count }) }}
          </div>
        </div>

        <div class="flex flex-col mt-1">
          <div class="flex items-center gap-1.5 text-xs text-content-soft md:text-sm">
            <Icon name="material-symbols:calendar-month-sharp" class="text-yellow-500" />
            {{ $dayjs(theater.date).locale(locale).format("DD MMMM YYYY") }}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-content-soft md:text-sm">
            <Icon name="ic:outline-access-time" class="text-gray-500 dark:text-gray-300" />
            <div class="flex items-center gap-1">
              <span> {{ $dayjs(theater.start_date).locale(locale).format("HH:mm") }}</span>
              <span>-</span>
              <span> {{ $dayjs(theater.end_date).locale(locale).format("HH:mm") }}</span>
            </div>
          </div>
        </div>

        <!-- <div class="mt-2 flex flex-wrap items-center gap-1.5">
          <div v-if="theaterState === 'ongoing'" class="flex items-center gap-1.5 rounded-full border border-black/20 bg-red-500 px-2 py-0.75 text-[11px] font-semibold text-white">
            <div class="relative size-2.5">
              <div class="absolute inset-0 animate-ping rounded-full bg-green-500" />
              <div class="absolute inset-0 rounded-full bg-green-500" />
            </div>
            {{ $t(theaterState) }}
          </div>
          <div v-else-if="$dayjs(theater.date).isToday()" class="rounded-full border border-black/20 bg-red-500 px-2 py-0.75 text-[11px] font-semibold text-white">
            {{ $t('today') }}
          </div>
          <div v-else-if="$dayjs(theater.date).isTomorrow()" class="rounded-full border border-black/20 bg-orange-500 px-2 py-0.75 text-[11px] font-semibold text-white">
            {{ $t('tomorrow') }}
          </div>
        </div> -->
        <div class="mt-2 space-y-1 border-t border-black/5 pt-2 dark:border-white/5" />
        <div class="space-y-1">
          <div v-if="seitansai.length || graduation.length">
            <div v-if="seitansai.length" class="flex items-center gap-1.5 text-[10px] md:text-xs">
              <Icon name="ri:cake-2-fill" class="mt-px shrink-0 text-pink-400 mb-0.5" />
              <div class="min-w-0 flex gap-1 items-center">
                <span class="mr-1 font-semibold text-pink-400">Birthday:</span>
                <span class="line-clamp-1 opacity-80">
                  <template v-for="(member, idx) in seitansai" :key="`seitansai-name-${member.id}`">
                    <NuxtLink v-if="member.url_key" :to="`/member/${member.url_key}`">
                      {{ member.name }}
                    </NuxtLink>
                    <span v-else>{{ member.name }}</span><span v-if="idx < seitansai.length - 1">, </span>
                  </template>
                </span>
              </div>
            </div>

            <div v-if="graduation.length" class="flex items-center gap-1.5 text-[10px] md:text-xs">
              <Icon name="ph:graduation-cap-fill" class="mt-px shrink-0 text-amber-500 mb-0.5" />
              <div class="min-w-0 flex gap-1 items-center">
                <span class="mr-1 font-semibold text-amber-500">Graduation:</span>
                <span class="line-clamp-1 opacity-80">
                  <template v-for="(member, idx) in graduation" :key="`graduation-name-${member.id}`">
                    <NuxtLink v-if="member.url_key" :to="`/member/${member.url_key}`">
                      {{ member.name }}
                    </NuxtLink>
                    <span v-else>{{ member.name }}</span><span v-if="idx < graduation.length - 1">, </span>
                  </template>
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-x-1 flex-wrap text-[10px] md:text-xs opacity-80">
            <span v-for="(member, idx) in members" :key="`graduation-name-${member.id}`">
              <NuxtLink v-if="member.url_key" :to="`/member/${member.url_key}`">
                {{ member.name }}
              </NuxtLink>
              <span v-else>{{ member.name }}</span>
              <span v-if="idx < members.length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
