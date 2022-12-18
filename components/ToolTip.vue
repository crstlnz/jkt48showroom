<template>
  <div>
    <Transition name="fade">
      <div v-if="isOpen" ref="tooltip" class="fixed p-10 bg-white" :style="{ left: pos.x + 'px', top: pos.y + 'px' }">
        <slot name="tooltip" />
      </div>
    </Transition>
    <div ref="container" @click="onClick">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
type Size = {
  width: number;
  height: number;
};
type ElementSpace = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  rect: DOMRect;
};

type Position = {
  x: number;
  y: number;
};

const pos = ref<Position>({ x: 0, y: 0 });
type ToolTipType = "left" | "right" | "top" | "bottom";

const props = withDefaults(
  defineProps<{
    offset?: number;
  }>(),
  {
    offset: 10,
  }
);
const tooltip = ref<HTMLElement | null>(null);
function onClick() {
  if (!isOpen.value) return open();
  close();
}
function open() {
  isOpen.value = true;
  if (container.value && window) {
    const remainingSpace = getRemainingSpace(container.value);
    nextTick(() => {
      if (tooltip.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const result = calculatePosition(remainingSpace, { width, height });
        pos.value = result;
      }
    });
  }
}

function calculatePosition(space: ElementSpace, size: Size): Position {
  //   if (space.top >= size.height + props.offset) {
  return {
    x: space.rect.left + space.rect.width / 2 - size.width / 2,
    y: space.rect.top - size.height - props.offset,
  };
  //   } else if (space.bottom >= size.height + props.offset) {
  //     return "bottom";
  //   } else if (space.right >= size.width + props.offset) {
  //     return "right";
  //   } else if (space.left >= size.width + props.offset) {
  //     return "left";
  //   }
  //   return "bottom";
}

function close() {
  isOpen.value = false;
}
onMounted(() => {
  function onScroll() {
    close();
  }

  let unlisten: any;
  watchEffect(() => {
    if (isOpen.value) {
      window.addEventListener("resize", onScroll);
      document.addEventListener("scroll", onScroll);
      unlisten = onClickOutside(tooltip, close, { ignore: [container] });
    } else {
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("scroll", onScroll);
      if (unlisten) unlisten();
    }
  });
});

const type = ref<ToolTipType>("top");

const container = ref<HTMLElement | null>(null);
const isOpen = ref(false);

function getRemainingSpace(el: HTMLElement): ElementSpace {
  const pos = el.getBoundingClientRect();
  if (window) {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      left: pos.left,
      top: pos.top,
      bottom: height - pos.bottom,
      right: width - pos.right,
      rect: pos,
    };
  }
  return { left: 0, right: 0, top: 0, bottom: 0, rect: pos };
}
</script>
