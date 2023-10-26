<script lang="ts" setup>
import { LazyImage } from '#components'

const route = useRoute()
const { data } = useFetch<IApiTheaterDetailList>(`/api/jkt48/theater/${route.params.id}`)
const dayjs = useDayjs()
const title = computed(() => {
  if (data.value?.shows) {
    if (data.value.shows.length > 1) {
      return 'Theater Detail'
    }
    else {
      return data.value.shows[0]?.title
    }
  }
  return ''
})
const pic = 'https://res.cloudinary.com/haymzm4wp/image/upload/v1696626938/assets/img/default-anime-avatar_ms7sea.webp'
const config = useAppConfig()
</script>

<template>
  <LayoutSingleRow :title="`${title} - ${dayjs(data?.date).format('DD MMMM YYYY')}`">
    <div class="px-4 md:px-5">
      <div v-for="theater in data?.shows ?? []" :key="theater.id" class="space-y-4 md:space-y-5">
        <div class="flex flex-col gap-5 md:flex-row md:gap-4">
          <LazyImage :src="theater.setlist?.poster ?? config.errorPicture" alt="Theater Poster" class="bg-container aspect-[9/12] w-full shrink-0 overflow-hidden rounded-xl object-cover md:w-48 xl:w-80" />
          <div class="space-y-2 md:p-8">
            <div class="flex gap-3">
              <h3 class="text-xl">
                {{ theater.title }}
              </h3>
              <img :src="`https://jkt48.com${theater.team.img}`" alt="Team Label" class="self-center rounded-md">
            </div>

            <div class="font-light opacity-90">
              {{ theater.setlist?.description ?? "Tidak ada deskripsi." }}
            </div>

            <table class="gap-2 pt-5 text-base font-light [&_td:first-child]:min-w-[150px] [&_td:first-child]:pr-5 [&_td:first-child]:font-light [&_td:first-child]:opacity-50 sm:[&_td:first-child]:min-w-[200px] xl:[&_td:first-child]:min-w-[270px] [&_td]:py-2">
              <tr>
                <td>{{ $t("total_member") }}</td>
                <td>{{ theater.members?.length || '-' }}</td>
              </tr>
              <!-- <tr>
                <td>Total Lagu</td>
                <td>12 Lagu</td>
              </tr> -->
              <tr>
                <td>{{ $t("sort.date") }}</td>
                <td>{{ dayjs(theater.date).format("DD MMMM YYYY - HH:mm") }}</td>
              </tr>
              <!-- <tr>
                <td>Seitansai</td>
                <td>{{ theater.members?.slice(0, 3).map(i => i.name).join(", ") }}</td>
              </tr> -->
            </table>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xl">
          <Icon name="fluent:people-12-filled" size="1.5rem" />
          <span>Daftar Member</span>
        </div>
        <div v-if="theater.members?.length" class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-5">
          <NuxtLink v-for="member in theater.members" :key="member.id" :to="`/member/${member.url_key}`" class="flex flex-col space-y-2">
            <LazyImage :src="member.img ?? pic" alt="Default profile picture" class="bg-container block aspect-[8/10] h-full w-full overflow-hidden rounded-xl object-cover" />
            <div class="truncate">
              {{ member.name }}
            </div>
          </NuxtLink>
        </div>
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-5">
          <div v-for="num in 16" :key="num" class="relative flex flex-col space-y-2">
            <LazyImage :src="pic" alt="Default profile picture" class="bg-container block aspect-[8/10] h-full w-full overflow-hidden rounded-xl object-cover opacity-60 brightness-50" />
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-white">
              ?
            </div>
            <!-- <div class="truncate">
              Unknown
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </LayoutSingleRow>
</template>
