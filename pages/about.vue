<template>
  <LayoutSingleRow :title="$t('menu.about')">
    <div class="mx-3 md:mx-4 p space-y-5 md:space-y-8 max-w-2xl [&_b]:text-red-500 text-sm md:text-base">
      <p class="text-justify indent-8">
        Project website ini dibuat untuk memudahkan fans JKT48 dalam menonton live Showroom dan IDN Live (IDN susah bet bukanya 😭).
        Selain itu, kalian juga dapat mengakses
        <NuxtLink to="/member">
          <b>Profile Member</b>
        </NuxtLink>,
        <NuxtLink to="/news">
          <b>News</b>
        </NuxtLink> dari Official JKT48,
        <NuxtLink to="/theater/2635">
          <b>Data Theater</b>
        </NuxtLink>, serta data
        <NuxtLink to="/recent">
          <b>Log History</b>
        </NuxtLink> dari live yang telah selesai.
      </p>
      <p class="text-justify indent-8">
        Website ini dikembangkan oleh
        <NuxtLink v-social-click="'twitter'" to="https://x.com/crstlnz" target="_blank">
          <b>@crstlnz</b>
        </NuxtLink> dan dikarenakan website ini menggunakan hosting yang seadanya, maka dari itu mohon maaf jika terkadang website lambat atau down 🙏😭.
        Jika kalian ingin mendukung project ini untuk membantu biaya server, kalian bisa donasi melalui link saweria di
        <NuxtLink to="https://saweria.co/crstlnz" target="_blank">
          <b> https://saweria.co/crstlnz</b>
        </NuxtLink>
      </p>

      <div class="flex flex-col gap-3 justify-between">
        <div class="text-xl mb-2 flex gap-1.5 items-center">
          <Icon name="typcn:cloud-storage" class="text-blue-500 text-2xl" /><span>Penyimpanan</span>
        </div>
        <div class="flex gap-1 justify-between">
          Screenshot
          <a href="https://cloudinary.com/invites/lpov9zyyucivvxsnalc5/cptaluvo5krhxxhvpfky?t=default" class="bg-slate-200 p-2 rounded-xl" target="_blank">
            <img class="h-7" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Cloudinary_logo.svg/2560px-Cloudinary_logo.svg.png" alt="Cloudinary logo">
          </a>
        </div>
        <div class="flex gap-1 justify-between">
          Data live history
          <a href="https://www.mongodb.com/" target="_blank" class="bg-slate-200 p-2 rounded-xl">
            <img class="h-7" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/1280px-MongoDB_Logo.svg.png" alt="Cloudinary logo">
          </a>
        </div>
      </div>
    </div>
  </LayoutSingleRow>
</template>
