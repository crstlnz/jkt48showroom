<script lang="ts" setup>
withDefaults(defineProps<{
  min?: number
  max?: number
  modelValue: string | number
  step?: number
}>(), {
  min: 0,
  max: 100,
  step: 1,
})

const emit = defineEmits(['update:modelValue'])
const slider = ref<HTMLInputElement>()
const silentValue = ref<number | null>(null)
function silentUpdate(num: number) {
  if (slider.value) {
    silentValue.value = num
    nextTick(() => {
      slider.value!.value = String(num)
    })
  }
}

function onChange(event: Event) {
  if (silentValue.value != null) silentValue.value = null
  emit('update:modelValue', (event.target as HTMLInputElement)?.value)
}

defineExpose({ silentUpdate, slider })
</script>

<template>
  <!-- <div class="flex items-center">
    <input id="myRange" type="range" :min="min" :max="max" :step="step" class="volume-slider slider flex-1" :value="modelValue" @input="$event => $emit('update:modelValue', ($event.target as HTMLInputElement)?.value)">
  </div> -->
  <div class="relative flex items-center duration-200">
    <div class="absolute inset-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 overflow-hidden rounded-xs bg-gray-300/25 pointer-events-none">
      <div class="h-full bg-slate-200" :style="{ width: `${(silentValue ?? Number(modelValue)) / max * 100}%` }" />
    </div>
    <input id="myRange" ref="slider" type="range" :min="min" :max="max" :step="step" class="slider flex-1 cursor-pointer h-4 md:h-5" :value="modelValue" @input="onChange">
  </div>
</template>

<style>
@reference "~/assets/css/tailwindcss.css";

.slider {
	 -webkit-appearance: none;
	/* Override default CSS styles */
	 appearance: none;
	 background: transparent;
	/* Grey background */
	 outline: none;
	/* Remove outline */
	 border: none;
}
 .slider::-webkit-slider-thumb {
	 -webkit-appearance: none;
	/* Override default look */
	 appearance: none;
	 width: 10px;
	/* Set a specific slider handle width */
	 height: 10px;
	/* Slider handle height */
	 background: #000;
	 border: none;
	 border-radius: 100%;
	/* cursor: pointer;
	/* Cursor on hover */
}
 .slider::-moz-range-thumb {
	 width: 10px;
	/* Set a specific slider handle width */
	 height: 10px;
	/* Slider handle height */
	 background: #000;
	 border: none;
	 border-radius: 100%;
	/* Green background */
	 cursor: pointer;
	/* Cursor on hover */
	 appearance: none;
}
 .slider.hidden-slider::-webkit-slider-thumb {
	 visibility: hidden;
}
 .slider.hidden-slider::-moz-range-thumb {
	 visibility: hidden;
}
 .slider::-webkit-progress-value {
	 background: transparent;
	 border: none;
}
 .slider::-moz-range-progress {
	 background: transparent;
	 border: none;
	 appearance: none;
}
 .slider::-moz-range-track {
	 appearance: none;
}
 .slider:focus-visible::-webkit-slider-thumb {
	 -webkit-appearance: none;
	 appearance: none;
	 cursor: pointer;
   @apply ring-2 ring-blue-500;
}
 .slider:focus-visible::-moz-range-thumb {
	 cursor: pointer;
   @apply ring-2 ring-blue-500;
}
</style>
