<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    <Error v-if="error" message="Something Error!" imgSrc="/svg/error.svg" />
    <div v-else class="flex flex-col gap-3 md:gap-4">
      <div class="flex lg:flex-row flex-col rounded-xl gap-3 md:gap-4">
        <LazyImage
          class="rounded-xl w-full lg:w-auto lg:h-48 aspect-video border-gray-50 box-border border-2 dark:border-none"
          :src="$fixCloudinary(data.room_info.img)"
          :alt="data.room_info.name + ' Display Picture'"
        />
        <div class="lg:flex lg:flex-col justify-end space-y-2 flex-1">
          <div class="flex justify-between lg:justify-start">
            <h1 class="font-bold text-2xl text-center">
              {{ data.room_info.name }}
            </h1>
            <div class="rounded-xl w-fit text-white font-bold [&>div]:px-3 [&>div]:py-1.5 overflow-hidden">
              <div class="bg-sky-400" v-if="data.room_info.is_group">Official</div>
              <div class="bg-red-500" v-else-if="data.room_info.is_graduate">Graduated</div>
              <div class="bg-green-500" v-else>Active</div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="rounded-xl lg:overflow-hidden justify-between lg:flex space-y-3 md:space-y-4 lg:space-y-0 lg:shadow-sm"
      >
        <div
          class="shadow-sm lg:shadow-none bg-white dark:bg-dark-1 flex flex-col-reverse lg:flex-row items-center flex-1 rounded-xl lg:rounded-none text-center lg:text-left p-4 lg:p-0 gap-2 lg:gap-0"
        >
          <div class="truncate lg:p-4 lg:font-semibold w-auto lg:w-[110px] lg:text-center text-base">Start Date</div>
          <div
            :title="moment(data.live_info.date.start).format('LLLL')"
            class="truncate lg:bg-slate-100/50 lg:dark:bg-dark-2/50 flex-1 lg:py-1.5 lg:px-3 rounded-md lg:rounded-r-none lg:rounded-l-md text-lg lg:text-base font-semibold lg:font-normal"
          >
            {{ moment(data.live_info.date.start).format("LLLL") }}
          </div>
        </div>
        <div
          class="shadow-sm lg:shadow-none bg-white dark:bg-dark-1 flex flex-col-reverse lg:flex-row-reverse text-center items-center flex-1 rounded-xl lg:rounded-none p-4 lg:p-0 gap-2 lg:gap-0"
        >
          <div class="truncate lg:p-4 lg:font-semibold lg:w-[110px] lg:text-center text-base">End Date</div>
          <div
            :title="moment(data.live_info.date.end).format('LLLL')"
            class="truncate lg:bg-slate-100/50 lg:dark:bg-dark-2/50 flex-1 lg:py-1.5 lg:px-3 rounded-md lg:rounded-l-none lg:rounded-r-md lg:text-right text-lg lg:text-base font-semibold lg:font-normal"
          >
            {{ moment(data.live_info.date.end).format("LLLL") }}
          </div>
        </div>
      </div>
      <div
        class="grid grid-cols-1 lg:grid-flow-col lg:auto-cols-fr gap-3 md:gap-4 [&>div]:flex-1 [&>div]:bg-white dark:[&>div]:bg-dark-1 [&>div]:rounded-xl [&>div]:p-4 [&>div]:text-center"
      >
        <div class="shadow-sm">
          <div class="text-xl mb-1.5 font-semibold">
            {{
              $time.detailDuration(
                new Date(data.live_info.date.end).getTime(),
                new Date(data.live_info.date.start).getTime()
              )
            }}
          </div>
          <div class="flex items-center justify-center gap-1"><Icon name="ph:timer-fill" />Duration</div>
        </div>
        <div v-if="data.live_info?.viewer" class="shadow-sm">
          <div class="text-xl mb-1.5 font-semibold">
            {{ data.live_info?.viewer?.peak }}
          </div>
          <div class="flex items-center justify-center gap-1"><Icon name="ph:users-fill" /> Viewers</div>
        </div>
        <div class="shadow-sm">
          <div class="text-xl mb-1.5 font-semibold">
            <!-- {{ $n((data.total_point as number) * 1.1 * 105.77, "currency", "id-ID") }} -->
            {{ $currency(data.total_point) }}
            <!-- {{ $n((data.total_point as number) * 1.1, "currency", "ja-JP") }} -->
            <!-- {{ $n(data.total_point) }} G -->
          </div>
          <div class="flex items-center justify-center gap-1"><Icon name="ph:gift-fill" /> Total Gift</div>
        </div>
      </div>

      <!-- <div class="bg-white dark:bg-dark-1 rounded-xl p-3 md:p-4 space-y-1 shadow-sm" v-if="data.fans?.length">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold">Top Fans</h3>
        </div>
        <div class="whitespace-nowrap py-1 flex flex-1">
          <button
            v-for="fans in data.fans.slice(0, 13)"
            :key="fans.id"
            :title="fans.name"
            class="rounded-sm w-20 md:w-32 aspect-square text-center space-y-1 min-w-0 px-1 lg:px-2 cursor-pointer hidden [&:not(:nth-of-type(1n+6))]:inline-block md:[&:not(:nth-of-type(1n+8))]:inline-block lg:[&:not(:nth-of-type(1n+11))]:inline-block xl:[&:not(:nth-of-type(1n+13))]:inline-block flex-1"
          >
            <LazyImage
              :transparent="true"
              lazy="false"
              class="bg-transparent mx-auto hover:bg-slate-300/50 dark:hover:bg-dark-3/50 transition-colors rounded-xl p-2 w-full aspect-square"
              :alt="fans.name"
              :src="$avatarURL(fans.avatar_id)"
            />
            <div class="truncate text-xs">{{ fans.name }}</div>
          </button>
        </div>
      </div> -->
      <HomeFans v-if="data.fans?.length" :data="data.fans" />
      <div class="w-full relative flex gap-3 md:gap-4 flex-col md:flex-row">
        <div
          class="flex-1 lg:w-auto overflow-hidden aspect-[16/13] xl:aspect-[16/10.5] pulse-color rounded-xl shadow-sm"
        >
          <ClientOnly v-if="data.live_info?.stage_list">
            <ShowroomView
              :member-image="data.room_info?.img"
              :date="data.live_info?.date"
              :background="
                data.live_info?.background_image ??
                'https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/default.png'
              "
              :screenshot="data.live_info?.screenshot"
              :live-info="data.live_info"
              :stage-list="data.live_info.stage_list"
              :users="users"
              :gift-data="data.live_info.gift"
            />
            <template #fallback>
              <div class="h-full w-full overflow-hidden pulse-color animate-pulse"></div>
            </template>
          </ClientOnly>
          <div v-else class="text-3xl font-bold w-full h-full flex items-center justify-center bg-zinc-600 text-white">
            No data
          </div>
        </div>
        <div
          class="relative w-full min-h-[300px] h-[75vh] md:h-auto md:w-[300px] lg:w-[380px] rounded-xl bg-white dark:bg-dark-1 shadow-sm"
        >
          <div class="absolute top-0 left-0 right-0 bottom-0 rounded-xl overflow-hidden z-0">
            <GiftScroll :gifts="calculatedGift"></GiftScroll>
          </div>
        </div>
      </div>
      <!-- <DynamicScroller
        class="h-full w-full roundedscrollbar"
        :min-item-size="169"
        :buffer="0"
        :prerender="30"
        :items="[
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
        ]"
        key-field="id"
        page-mode
      >
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
            <div class="bg-white dark:bg-dark-1 p-3 md:p-4 rounded-xl flex gap-3 md:gap-4">
              <img
                class="hover:bg-slate-200 bg-slate-100/80 p-2 rounded-xl w-20 h-20"
                :key="item.avatar_id + item.id"
                :src="$avatarURL(item.avatar_id)"
                alt=""
              />
              <div class="flex-1 w-0">
                <div class="text-lg font-semibold">{{ item.name }}</div>
                <div class="grid grid-cols-12 gap-1.5">
                  <div v-for="gift in item.gifts" class="relative">
                    <img :src="gift.img" alt="" class="aspect-square w-full h-full" />
                    <div
                      class="absolute bottom-[-5px] right-[-5px] bg-blue-500 text-white font-semibold text-[10px] rounded-full shadow-md aspect-square w-5 text-center leading-5"
                    >
                      2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller> -->
      <!-- <h2 class="text-2xl font-bold my-2">Fans Gifts</h2>
      <RecycleScroller
        :min-item-size="176"
        :prerender="20"
        :items="[
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
          ...calculatedGift,
        ]"
        key-field="id"
        v-slot="{ item }"
        :buffer="500"
      >
        <div class="bg-white dark:bg-dark-1 p-3 md:p-4 rounded-xl flex gap-3 md:gap-4">
          <img
            class="hover:bg-slate-100 p-2 rounded-xl"
            :key="item.avatar_id + item.id"
            :src="$avatarURL(item.avatar_id)"
            alt=""
          />
          <div>
            <div class="text-lg font-semibold">{{ item.name }}</div>
            <div>List hadiah</div>
          </div>
        </div>
      </RecycleScroller> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import c from "~/config";
import { LazyImage } from "#components";
import Scroll from "~~/components/gift/Scroll.vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";

moment.relativeTimeThreshold("ss", 60);
const config = useRuntimeConfig();
const route = useRoute();
const { data, error } = await useFetch(`/api/showroom/recent/${route.params.id}`, {
  baseURL: config.public.baseURL,
});

if (!data.value) throw createError({ statusCode: 404, statusMessage: "Data not found!" });

const users = computed<Map<number, IFansCompact>>(() => {
  const users = new Map<number, IFansCompact>();
  if (!data?.value?.users) return users;
  const u = data?.value?.users;
  for (const user of u) {
    users.set(user.id, user);
  }
  return users;
});

const gifts = computed<Map<number, IGiftImg>>(() => {
  const gifts = new Map<number, IGiftImg>();
  if (!data?.value?.live_info?.gift) return gifts;
  const g = data?.value?.live_info.gift.list;
  for (const gift of g) {
    gifts.set(gift.id, {
      id: gift.id,
      free: gift.free,
      point: gift.point,
      img: c.giftUrl(gift?.id ?? 0),
    });
  }
  return gifts;
});

const calculatedGift = computed<IFansGift[]>(() => {
  try {
    if (!data?.value?.live_info?.gift?.log) return [];
    const log = data.value.live_info.gift.log;
    const mapped = log.map<IFansGift>((i) => {
      const user = users.value.get(i.user_id);
      const giftMap = new Map<number, IGifts>();
      for (const gift of i.gifts) {
        if (giftMap.has(gift.id)) {
          giftMap.get(gift.id).num += gift.num;
        } else {
          const g = gifts.value.get(gift.id);
          giftMap.set(gift.id, {
            num: gift.num,
            id: g.id,
            free: g.free,
            point: g.point,
            img: g.img,
            date: gift.date,
          });
        }
      }
      return {
        name: user?.name ?? "User not Found!",
        id: user?.id ?? 0,
        avatar: c.avatarURL(user?.avatar_id ?? 1),
        avatar_id: user.avatar_id,
        total: i.total,
        gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
      };
    });
    return mapped;
  } catch (e) {
    return [];
  }
});
// const { $n } = useNuxtApp();

type CurrencyType = "jpy" | "idr" | "sr";
const { n } = useI18n();
function currency(num, type: CurrencyType) {
  if (type == "sr") {
    return `${num} G`;
  } else {
    if (type == "jpy") return n(num * 1.1, "currency", "ja-JP");
    return n(num * 1.1 * 105.5, "currency", "id-ID");
  }
}
</script>
