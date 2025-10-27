<script lang="ts" setup>
defineProps<{ banner: BannerWithId }>()
defineEmits<{ (e: 'remove'): void, (e: 'update', banner: BannerWithId): void }>()

const isEdit = ref(false)

function edit() {
  isEdit.value = !isEdit.value
}
</script>

<template>
  <div class="flex-1 bg-white w-full t border border-color-2 dark:bg-white/5 rounded-xl overflow-hidden">
    <div class="flex">
      <div class="px-3 pt-3 py-2 flex-1 text-sm">
        <strong>{{ banner.title }}</strong><br>
        <div>{{ banner.url }}</div>
      </div>
      <button aria-label="Edit" class="bg-blue-500 hover:bg-blue-500/75 text-2xl px-4 text-gray-200" @click="edit">
        <Icon v-if="isEdit" name="material-symbols:close-rounded" />
        <Icon v-else name="material-symbols:edit" />
      </button>
      <button aria-label="Remove" class="bg-red-500 hover:bg-red-500/75 text-2xl px-4 text-gray-200" @click="$emit('remove')">
        <Icon name="material-symbols:delete-rounded" />
      </button>
    </div>
    <Transition name="height">
      <div v-if="isEdit" class="overflow-hidden h-50 border-t border-color-2">
        <div class="p-3 h-full flex-col flex justify-around">
          <div class="flex gap-3 items-center">
            <div class="w-[60px]">
              Title
            </div>
            <input :value="banner.title" class="p-2 t border border-color-2 flex-1 rounded-md" name="title" @input="(v) => $emit('update', { ...banner, title: (v.target as HTMLInputElement).value })">
          </div>
          <div class="flex gap-3 items-center">
            <div class="w-[60px]">
              Image
            </div>
            <input :value="banner.img" class="p-2 t border border-color-2 flex-1 rounded-md" name="img" @input="(v) => $emit('update', { ...banner, img: (v.target as HTMLInputElement).value })">
          </div>
          <div class="flex gap-3 items-center">
            <div class="w-[60px]">
              Url
            </div>
            <input :value="banner.url" class="p-2 t border border-color-2 flex-1 rounded-md" name="url" @input="(v) => $emit('update', { ...banner, url: (v.target as HTMLInputElement).value })">
          </div>
        </div>
      </div>
    </Transition>
    <a :href="banner.url" target="_blank" class="block transition-all duration-300"><img class="w-full transition-all duration-300" :src="banner.img" alt="" :title="banner.title"></a>
  </div>
</template>
