<script lang="ts" setup>
defineProps<{
    icon : string;
    color: string;
    title : string;
    message : string;
    progress?: number
}>()

defineEmits<{(e: 'close') : void}>()
</script>

<template>
  <div class="w-full rounded-sm bg-white shadow-md">
    <div class="flex items-stretch gap-4 overflow-hidden pr-4 text-slate-800 ">
      <div class="inline-block w-1.5 " :class="color" />
      <Icon :name="icon" class="h-8 w-8 self-center rounded-full  p-1.5 text-white" :class="color" />
      <div class="flex flex-1 flex-col py-5">
        <div class="text-lg font-bold">
          {{ title }}
        </div>
        <div class="text-slate-700">
          {{ message }}
        </div>
      </div>
      <button aria-label="Close notif" type="button" @click="()=> $emit('close')">
        <Icon name="ic:round-close" class="h-7 w-7 self-center" />
      </button>
    </div>
    <div v-if="progress !== null" :class="color" :style="{width: `${progress}%`}" class="h-1 w-[50%] border-t-2 border-slate-100  opacity-60" />
  </div>
</template>
