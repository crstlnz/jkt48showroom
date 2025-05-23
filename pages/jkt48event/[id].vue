<script lang="ts" setup>
import { AdminEditJKT48EventButton } from '#components'

const route = useRoute()
const { data, status, error } = await useApiFetch<IApiJKT48EventDetail>(`/api/jkt48event/${route.params.id}`)

const title = computed(() => {
  return data.value?.title ?? ''
})
const pic = 'https://res.cloudinary.com/haymzm4wp/image/upload/v1696626938/assets/img/default-anime-avatar_ms7sea.webp'
const config = useAppConfig()

const description = computed(() => {
  let str = data.value?.event?.description ?? 'Tidak ada deskripsi.'
  if (str.split(' ').length > 25) {
    str = `${str.split(' ').slice(0, 25).join(' ')}...`
  }
  return str
})

const poster = computed(() => {
  return data.value?.event?.banner || data.value?.event?.poster || undefined
})

useSeoMeta({
  title,
  ogTitle: title,
  twitterTitle: title,
  description,
  ogImage: poster,
  twitterImage: poster,
  twitterDescription: description,
  ogDescription: description,
})

const { locale } = useI18n()
useHead({
  title,
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="relative min-h-[100vh] w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error
      v-else-if="error || !data"
      :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')"
      :img-src="!data || error?.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`"
    />
    <LayoutSingleRow v-else :title="`${title} - ${$dayjs(data?.date).locale(locale).format('DD MMMM YYYY')}`">
      <div class="px-4 md:px-5 space-y-10">
        <div
          class="space-y-4 md:space-y-5 border-b-4 border-dashed border-white/10 pb-10"
        >
          <div class="flex flex-col gap-5 md:flex-row md:gap-4">
            <NuxtImg
              class="bg-container aspect-9/12 w-full shrink-0 overflow-hidden rounded-xl object-cover md:w-48 xl:w-80 sm self-start"
              :src="data.event?.poster ?? config.errorPicture" alt="Theater Poster" :modifiers="{
                aspectRatio: 9 / 12,
              }" :placeholder="[10, 14, 75, 50]" loading="lazy" fit="fill"
              sizes="150px xs:170px sm:500px md:192px xl:320px" format="webp"
            />
            <div class="space-y-2 md:p-3 flex-1">
              <div class="flex gap-3 items-center">
                <h3 class="text-xl">
                  {{ data.title }}
                </h3>
                <NuxtImg
                  class="self-center rounded-md" :src="`${$cloudinaryURL}/assets/jkt48${data.team.img || '/images/icon.team7.png'}`"
                  alt="Team Label" loading="lazy" fit="fill" width="56px" format="webp"
                />
                <AdminEditJKT48EventButton :event="data" />
              </div>

              <div class="font-light opacity-90">
                {{ data.event?.description ?? "Tidak ada deskripsi." }}
              </div>

              <table
                class="gap-2 pt-5 text-sm md:text-base font-light max-md:[&_td:first-child]:max-w-[120px] md:[&_td:first-child]:min-w-[150px] [&_td:first-child]:pr-5 [&_td:first-child]:font-light [&_td:first-child]:opacity-50 sm:[&_td:first-child]:min-w-[200px] xl:[&_td:first-child]:min-w-[270px] [&_td]:py-2"
              >
                <tbody>
                  <tr>
                    <td>{{ $t("total_member") }}</td>
                    <td>{{ data.members?.length || '-' }}</td>
                  </tr>

                  <tr>
                    <td>{{ $t("sort.date") }}</td>
                    <td>{{ $dayjs(data.date).locale(locale).format("DD MMMM YYYY - HH:mm") }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="flex gap-3 justify-end md:items-end flex-col md:flex-row">
                <div class="flex flex-col gap-2 w-full md:w-[200px] lg:w-[250px] xl:w-[280px]">
                  <div class="font-semibold mt-2 flex items-center gap-2">
                    <Icon
                      :name="getTheaterState(data.date) === 'ended' ? 'pepicons-pop:internet' : 'ep:ticket'"
                      class="text-yellow-500"
                    />
                    <span>{{ $t(getTheaterState(data.date) === 'ended' ? 'official_link' : 'theater_ticket')
                    }}</span>
                  </div>
                  <NuxtLink
                    :to="`https://jkt48.com/theater/schedule/id/${data.id}?lang=id`" external target="_blank"
                    class="p-3 aspect-[12/2.2] md:aspect-12/3 flex justify-center gap-2 text-white bg-blue-500 rounded-xl items-center text-lg lg:text-xl xl:text-2xl"
                  >
                    <Icon
                      v-if="getTheaterState(data.date) !== 'ended'" name="ep:ticket"
                      class="text-white text-xl lg:text-2xl xl:text-3xl"
                    />
                    <b>{{ getTheaterState(data.date) === 'ended' ? 'JKT48 Official Web' : $t("ticket.offline") }}</b>
                  </NuxtLink>
                  <NuxtLink
                    v-if="data.showroomTheater && getTheaterState(data.date) !== 'ended'"
                    :to="data.showroomTheater.entrance_url" external target="_blank"
                    class="p-3 aspect-[12/2.2] md:aspect-12/3 text-white bg-red-500 rounded-xl flex flex-col justify-center items-center "
                  >
                    <div class="text-lg lg:text-xl xl:text-2xl flex gap-2 items-center">
                      <Icon name="ep:ticket" class="text-white text-xl lg:text-2xl xl:text-3xl" />
                      <b>{{ $t("ticket.online") }}</b>
                    </div>
                    <div class="text-sm leading-3">
                      {{ $t('at') }} <b>Showroom</b>
                    </div>
                  </NuxtLink>
                  <NuxtLink
                    v-if="data.idnTheater && getTheaterState(data.date) !== 'ended'"
                    :to="`https://idn.app/${data.idnTheater.username}/live/preview/${data.idnTheater.slug}`" external target="_blank"
                    class="p-3 aspect-[12/2.2] md:aspect-12/3 text-white bg-red-500 rounded-xl flex flex-col justify-center items-center "
                  >
                    <div class="text-lg lg:text-xl xl:text-2xl flex gap-2 items-center">
                      <Icon name="ep:ticket" class="text-white text-xl lg:text-2xl xl:text-3xl" />
                      <b>{{ $t("ticket.online") }}</b>
                    </div>
                    <div class="text-sm leading-3">
                      {{ $t('at') }} <b>IDN Live</b>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xl">
            <Icon name="fluent:people-12-filled" size="1.5rem" />
            <span>Daftar Member</span>
          </div>
          <div
            v-if="data.members?.length"
            class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:gap-5"
          >
            <NuxtLink
              v-for="member in data.members" :key="member.id"
              :to="member.url_key ? `/member/${member.url_key}` : undefined" class="flex flex-col space-y-2 group"
            >
              <div class="overflow-hidden rounded-xl">
                <NuxtImg
                  class="bg-container block aspect-8/10 size-full object-cover group-hover:scale-110 transition-transform duration-300"
                  :src="member.img ?? pic" alt="Member picture" fit="fill" :modifiers="{
                    aspectRatio: 8 / 10,
                    gravity: 'faceCenter',
                  }" sizes="100px md:180px" :placeholder="[8, 10, 75, 5]" format="webp"
                />
              </div>
              <div class="truncate text-sm md:text-base text-center">
                {{ member.name }}
              </div>
            </NuxtLink>
          </div>
          <div
            v-else
            class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-5"
          >
            <div v-for="num in 16" :key="num" class="relative flex flex-col space-y-2">
              <NuxtImg
                class="bg-container block aspect-8/10 h-full w-full overflow-hidden rounded-xl object-cover opacity-60 brightness-50"
                :src="pic" alt="Default member picture" fit="fill" :modifiers="{
                  aspectRatio: 8 / 10,
                  gravity: 'faceCenter',
                }" sizes="100px md:180px" :placeholder="[8, 10, 75, 5]" format="webp"
              />
              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-white">
                ?
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutSingleRow>
  </div>
</template>
