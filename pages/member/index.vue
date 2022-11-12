<template>
  <div>
    <div v-if="error"><Error message="Something error :(" img-src="/svg/error.svg" /></div>
    <div
      v-else-if="pending"
      class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="pulse-color h-[260px] md:h-[330px] xl:h-[400px] rounded-xl animate-pulse shadow-sm"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" img-src="/svg/no_data.svg" />
    </div>
    <div v-else>
      <!-- v-infinite-scroll="onLoadMore" -->
      <TransitionGroup
        name="list"
        tag="div"
        class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
      >
        <MemberCard
          v-for="member in data"
          class="shadow-sm"
          :key="member.room_id"
          :member="member"
          :is-live="onLives.isLive(member.room_id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useOnLives } from "~~/store/onLives";
import { storeToRefs } from "pinia";
import { useMembers } from "~~/store/members";
const onLives = useOnLives();
const memberState = useMembers();
const { members, pending, error } = storeToRefs(memberState);
const page = ref(1);
const perpage = ref(12);
function getPage(p: number): IMember[] {
  return members.value?.slice(perpage.value * (p - 1), perpage.value * p) ?? [];
}
const data = ref<IMember[]>(getPage(page.value));
const noMoreData = ref(false);
onMounted(() => {
  useInfiniteScroll(
    window,
    () => {
      if (noMoreData.value) return;
      page.value += 1;
      const newData = getPage(page.value);
      if (newData?.length) {
        data.value.push(...getPage(page.value));
      } else {
        page.value -= 1;
        noMoreData.value = true;
      }
    },
    { distance: 10 }
  );
});
</script>
