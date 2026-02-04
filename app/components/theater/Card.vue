<script lang="ts" setup>
defineProps<{
  theater: ITheaterAPI
}>()

const { locale } = useI18n()
</script>

<template>
  <NuxtLink :title="theater.name" :to="`/theater/${theater.id}`" class="group flex flex-col relative aspect-3/4 rounded-xl overflow-hidden">
    <div class="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs md:text-sm text-center absolute left-2 top-2 font-semibold">
      {{ $dayjs(theater.date).locale(locale).format("DD MMM YYYY") }}
    </div>
    <div class="flex-1">
      <Image
        sizes="200px sm:250px md:300px lg:247.5px"
        :placeholder="[45, 10, 55, 70]"
        fit="fill"
        format="webp"
        :alt="theater.name"
        class="w-full h-full flex-1 object-cover"
        :src="theater?.poster || $errorPicture"
      />
    </div>
    <div class="flex items-start gap-2 w-full absolute bottom-0 bg-slate-950 text-white">
      <div class="truncate group-hover:whitespace-normal group-hover:h-16 truncrate h-8 w-0 text-xs md:text-sm font-bold flex-1 pl-2.5 leading-7! mt-1 transition-[height]">
        {{ theater.name }}
      </div>
      <div class="py-2 pr-2.5">
        <div class="px-1 rounded-md leading-5! text-xs md:text-sm bg-blue-500">
          {{ $dayjs(theater.date).locale(locale).format("HH:mm") }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
