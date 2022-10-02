<template>
  <div class="w-full h-full flex flex-col">
    <transition name="fade">
      <div
        v-if="menuOpen"
        key="background-nav"
        class="md:hidden md:opacity-0 bg-black/30 dark:bg-black/40 fixed top-0 left-0 right-0 bottom-0 z-[100] !m-0"
        @click="toggleMenu"
      />
    </transition>
    <NuxtLoadingIndicator
      class="absolute top-0 z-[101]"
      :throttle="300"
      :height="4"
      color="repeating-linear-gradient(to right,#6eff94 0%,#0addfc 50%,#3482F6 100%)"
    />
    <nav ref="nav" class="fixed z-[100] top-0 left-0 right-0 bg-white dark:bg-dark-1 shadow-sm">
      <div
        class="container h-16 flex items-center mx-auto px-4 md:px-3 gap-10 justify-between flex-row-reverse md:flex-row"
      >
        <button
          key="burger"
          type="button"
          aria-label="Open Menu"
          :class="{ open: menuOpen }"
          class="burger nav-btn"
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <NuxtLink
          class="text-2xl py-2 flex-1 md:flex-none w-0 md:w-auto hover:text-blue-400 inline-block font-bold text-center truncate"
          to="/"
          >JKT48 Showroom
        </NuxtLink>

        <ul
          :class="{ 'translate-y-full invisible': !menuOpen }"
          class="menu absolute z-[100] top-full transition-[visibility,transform] pt-4 md:pt-0 duration-500 md:flex md:gap-6 md:transition-none md:translate-y-0 md:!visible md:flex-1 md:w-0 md:static md:top-0 h-[calc(100vh_-_4rem)] md:h-auto left-0 right-0 overflow-y-auto md:overflow-y-hidden bg-white dark:bg-dark-1 md:!bg-transparent overscroll-contain"
        >
          <li v-for="menu in menus" :key="menu.title" :class="{ 'md:hidden': !menu.mobile }">
            <NuxtLink
              :to="menu.url"
              class="text-2xl hover:text-blue-400 inline-block font-bold text-center w-full py-4"
              active-class="text-blue-500"
            >
              {{ menu.title }}
            </NuxtLink>
          </li>
        </ul>
        <button
          type="button"
          aria-label="Toggle Dark Mode"
          class="border-slate-800 dark:border-slate-100 cursor-pointer relative nav-btn text-2xl"
          @click="toggleDark"
        >
          <i
            class="i ph:moon-bold hidden dark:inline-block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <i class="i ph:sun-bold dark:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </button>
      </div>
    </nav>

    <div class="container mt-16 px-3 mx-auto flex-1">
      <slot />
    </div>

    <footer class="py-10 font-bold flex items-center justify-center">
      Created by<a class="ml-1" target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
    </footer>
  </div>
</template>

<script lang="ts" setup>
useHead({
  htmlAttrs: {
    lang: "en",
  },
  title: "JKT48 Showroom",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      hid: "description",
      name: "description",
      content: "JKT48 Showroom Logs",
    },
  ],
  link: [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    {
      rel: "stylesheet",
      href: "/fonts/icons/iconfont.css",
    },
  ],
});
const menuOpen = ref(false);
const menus = [
  {
    title: "Home",
    url: "/",
    mobile: false,
  },
  {
    title: "Recent",
    url: "/recent",
    mobile: true,
  },
  {
    title: "Member",
    url: "/member",
    mobile: true,
  },
];
const route = useRoute();

const { $colorMode } = useNuxtApp();
function toggleDark() {
  if ($colorMode.value === "dark") {
    $colorMode.preference = "light";
  } else {
    $colorMode.preference = "dark";
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

watch(route, () => {
  nextTick(() => {
    menuOpen.value = false;
  });
});
</script>
