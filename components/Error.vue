<script lang="ts" setup>
defineProps<{
  message: string;
  imgSrc: string;
  alt?: string;
  url?: string;
}>()
</script>

<template>
  <div class="mt-12 text-center md:mt-14 lg:mt-16 xl:mt-20">
    <div class="space-y-6 md:space-y-9 xl:space-y-10">
      <div class="mx-auto w-[80%] lg:w-[500px]">
        <img :src="imgSrc" :alt="alt ?? 'Error!'" class="mx-auto aspect-[100/67] w-full dark:brightness-125">
      </div>
      <div>
        <h2 class="mb-1 text-xl font-semibold text-slate-800 dark:text-slate-100 md:text-2xl xl:text-4xl">
          {{ message }}
        </h2>
        <a class="md:text-md mt-4 inline-block text-xs hover:text-second-2 xl:text-base" :href="url ?? '/'">{{
          $t("redirectme")
        }}</a>
      </div>
    </div>
  </div>
</template>
