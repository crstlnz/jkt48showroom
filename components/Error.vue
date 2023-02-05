<script lang="ts" setup>
defineProps<{
  message: string;
  imgSrc: string;
  alt?: string;
  url?: string;
}>()
</script>

<template>
  <div class="text-center mt-12 md:mt-14 lg:mt-16 xl:mt-20">
    <div class="space-y-6 md:space-y-9 xl:space-y-10">
      <div class="mx-auto w-[80%] lg:w-[500px]">
        <img :src="imgSrc" :alt="alt ?? 'Error!'" class="w-full mx-auto aspect-[100/67] dark:brightness-125">
      </div>
      <div>
        <h2 class="text-xl md:text-2xl xl:text-4xl mb-1 font-semibold text-slate-800 dark:text-slate-100">
          {{ message }}
        </h2>
        <a class="hover:text-second-2 text-xs md:text-md xl:text-base inline-block mt-4" :href="url ?? '/'">{{
          $t("redirectme")
        }}</a>
      </div>
    </div>
  </div>
</template>
