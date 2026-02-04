<script lang="ts" setup>
const props = defineProps<{
  data: INextLive
}>()
const { $fromNow } = useNuxtApp()
const date = $fromNow(props.data.date)
</script>

<template>
  <div class="flex gap-3 py-2 text-center md:py-3">
    <NuxtLink
      aria-label="View profile"
      class="relative aspect-square h-16 cursor-pointer overflow-hidden rounded-full drop-shadow-xs md:h-20"
      :to="`/member/${data.url}`"
    >
      <Image
        class="h-full w-full"
        :src="data.img_alt || data.img || $errorPicture"
        :alt="data.name"
        loading="lazy"
        fit="fill"
        :modifiers="{
          aspectRatio: 1,
          gravity: 'faceCenter',
        }"
        sizes="64px md:80px"
        :placeholder="[10, 10, 75, 5]"
        format="webp"
      />
    </NuxtLink>
    <div class="info flex min-w-0 flex-1 flex-col text-left">
      <div class="name flex flex-1 gap-2">
        <NuxtLink :to="`/member/${data.url}`" class="flex-1 truncate text-sm font-bold md:text-base">
          <h2
            :title="data.name"
          >
            {{ data.name }}
          </h2>
        </NuxtLink>
        <div
          v-if="data.is_graduate"
          class="graduated h-6 w-6 rounded-full bg-red-500 p-[3px] text-white"
          title="Graduated"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        </div>
      </div>
      <ul class="mt-1 space-y-1 text-xs md:text-sm [&>li]:flex [&>li]:gap-1">
        <li>
          <Icon name="ph:clock-bold" class="self-center text-sm md:text-base" />
          <div>{{ date }}</div>
        </li>
      </ul>
      <div class="mt-2 flex justify-end border-t-2 border-t-gray-50 pt-2 text-sm dark:border-t-zinc-700/50 md:text-base">
        <ul>
          <li>
            <a target="_blank" :href="$liveURL(data.url)">{{ $t("view") }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
