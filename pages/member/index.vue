<template>
  <div v-if="error"><Error message="Something error :(" img-src="/svg/error.svg" /></div>
  <div
    v-else
    class="py-4 md:py-6 xl:py-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 xl:gap-8"
  >
    <div
      v-if="pending"
      v-for="i in 10"
      :key="i"
      class="pulse-color h-[260px] md:h-[330px] xl:h-[400px] rounded-xl animate-pulse shadow-sm"
    />

    <MemberCard
      class="shadow-sm"
      v-else
      v-for="member in members"
      :key="member.room_id"
      :member="member"
      :is-live="false"
    />
    <!-- :is-live="onLives.isLive(member.room_id)" -->
  </div>
</template>

<script lang="ts" setup>
// import { useOnLives } from "~~/store/onLives";
// const onLives = useOnLives();
// function isLive(roomId) {
//   return true;
// }
import { useMembers } from "~~/store/members";
const memberState = useMembers();
const { members, pending, error } = storeToRefs(memberState);
</script>
