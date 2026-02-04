<script lang="ts" setup>
const props = defineProps<{
  member: Admin.MissingJKT48ID
}>()

const member = ref(props.member)
</script>

<template>
  <div class="h-32 p-3 md:p-4 rounded-xl bg-container flex gap-3 md:gap-3">
    <Image
      :key="member._id"
      sizes="96px"
      :placeholder="[45, 10, 55, 70]"
      :modifiers="{
        aspectRatio: 1,
        gravity: 'faceCenter',
      }"
      fit="fill"
      format="webp"
      :alt="member.name"
      class="object-cover rounded-full h-full aspect-square"
      :src="member.img"
    />
    <div class="flex-1 flex flex-col gap-2">
      <div class="text-xl text-left font-semibold">
        {{ member.name }}
      </div>
    </div>
  </div>
</template>
