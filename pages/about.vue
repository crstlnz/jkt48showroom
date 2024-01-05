<template>
  <LayoutSingleRow title="About">
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
        <NuxtLink to="https://x.com/crstlnz">
          <b>@crstlnz</b>
        </NuxtLink> dan dikarenakan website ini menggunakan hosting yang seadanya, maka dari itu mohon maaf jika terkadang website lambat atau down 🙏😭.
        Jika kalian ingin mendukung project ini untuk membantu biaya server, kalian bisa donasi melalui link saweria di
        <NuxtLink to="https://saweria.co/crstlnz" target="_blank">
          <b> https://saweria.co/crstlnz</b>
        </NuxtLink>
      </p>

      <div id="wots48 mt-3">
        <div class="mb-3">
          Versi android :
        </div>
        <div class="flex gap-2.5 md:gap-3.5 items-center">
          <NuxtImg
            src="https://res.cloudinary.com/haymzm4wp/image/upload/v1704436290/assets/img/download_qrxbop.png"
            :placeholder="10"
            sizes="48px md:56px"
            format="webp"
            class="w-12 md:w-[52px] aspect-square object-cover rounded-full bg-container border border-black/10 md:border-white/10 shadow-sm"
          />
          <div class="flex gap-2 items-end">
            <div class="font-bold text-2xl">
              Wots48
            </div>
            <div class="text-xs md:text-sm mb-1.5 md:mb-1">
              by <NuxtLink to="https://twitter.com/JanuarAdhiN" target="_blank" class="text-red-500">
                @JanuarAdhiN
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="mt-3  border border-white/10 bg-container shadow-sm rounded-xl p-3 md:p-4">
          <p class="indent-8 text-justify">
            Wots48 adalah aplikasi fanmade yang bertujuan untuk memudahkan anda dalam mengenal idol JKT48.
            di aplikasi ini kalian bisa mencoba ngidol dengan pengalaman baru dan User Interface yang berbeda,
            selain itu kalian bisa melihat data resmi member JKT48, jadwal pertunjukan JKT48, berita resmi JKT48 dan juga menonton live Showroom member atau event live JKT48 lainnya.
          </p>
          <p class="mt-3 indent-8 text-justify">
            Terima kasih telah menggunakan Wots48. Kami berkomitmen untuk terus meningkatkan pengalaman penggemar JKT48 melalui aplikasi ini. Jangan ragu untuk memberikan masukan dan saran Anda!
          </p>
        </div>

        <div class="mt-4 md:mt-5 max-w-2xl flex justify-center md:justify-end">
          <a class="w-40 inline-block" href="https://play.google.com/store/apps/details?id=co.median.android.ejrljj&hl=id&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
            <img alt="Temukan di Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/id_badge_web_generic.png">
          </a>
        </div>
      </div>
    </div>
  </LayoutSingleRow>
</template>
