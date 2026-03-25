<script lang="ts" setup>
withDefaults(defineProps<{
  member: JKT48MemberExtend
  fallbackImg: string
  showName?: boolean
  rootClass?: string
  imageWrapperClass?: string
  imageClass?: string
  nameClass?: string
}>(), {
  showName: true,
  rootClass: 'flex flex-col space-y-2 group',
  imageWrapperClass: 'overflow-hidden rounded-xl bg-container',
  imageClass: '',
  nameClass: 'truncate text-sm md:text-base text-center',
})
</script>

<template>
  <NuxtLink
    :to="member.url_key ? `/member/${member.url_key}` : undefined"
    :class="rootClass"
  >
    <div :class="imageWrapperClass">
      <Image
        class="block aspect-8/10 size-full object-cover scale-[1.005] transition-transform duration-500 group-hover:scale-105"
        :class="imageClass"
        :src="member.img ?? fallbackImg"
        alt="Member picture"
        fit="fill"
        :modifiers="{
          aspectRatio: '8/10',
          gravity: 'faceCenter',
        }"
        sizes="100px md:180px"
        :placeholder="[8, 10, 75, 5]"
        format="webp"
      />
    </div>
    <div v-if="showName" :class="nameClass">
      {{ member.name }}
    </div>
  </NuxtLink>
</template>
