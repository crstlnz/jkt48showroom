<template>
  <div class="dark:bg-dark-2 flex flex-col rounded-xl bg-slate-100 p-4  text-center shadow-sm">
    <div class="mb-1.5 flex-1 text-base">
      <slot name="value" />
    </div>
    <div class="flex items-center justify-center gap-1 text-sm font-thin">
      <slot name="title" />
    </div>
  </div>
</template>
