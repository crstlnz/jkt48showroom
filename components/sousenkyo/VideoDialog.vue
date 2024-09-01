<script lang="ts" setup>
defineProps<{ data: SousenkyoMember }>()
const videoDialog = ref()

const emit = defineEmits<{
    (e: 'onDismiss'): void
}>()

onClickOutside(videoDialog, () => {
    emit('onDismiss')
})
</script>

<template>
    <div class="fixed inset-0 z-aboveNav bg-black/50">
        <div ref="videoDialog"
            class="bg-container w-[70%] aspect-video absolute left-1/2 top-1/2 -translate-x-1/2 overflow-y-auto overscroll-contain -translate-y-1/2 md:rounded-xl max-md:w-full max-md:h-full max-h-full max-w-full md:max-h-[95vh] md:max-w-[95vw]">
            <iframe class="size-full" :src="`https://www.youtube.com/embed/${data.data?.url_video}?autoplay=1`"
                            title="YouTube video player" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
        </div>
    </div>
</template>