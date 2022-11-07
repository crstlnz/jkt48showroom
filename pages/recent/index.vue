<!-- todo mobile version -->
<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    RECENT
    <!-- <PaginationPage
      :data="data ?? []"
      :pending="pending || showPending"
      :error="error != null"
      :total-page="data ? Math.ceil(pageData.totalCount / pageData.perpage) : 1"
      :query="query"
      @filter="onFilter"
      @page-change="onPageChange"
    /> -->
  </div>
</template>

<script lang="ts" setup>
// enum sortType {
//   LATEST,
//   OLDEST,
//   MOST_GIFT,
//   MOST_VIEWS,
// }

// const defaultQuery: RecentsQuery = {
//   sort: sortType[sortType.LATEST].toLowerCase(),
//   page: 1,
// };

// // const { $device } = useNuxtApp();
// const route = useRoute();
// const router = useRouter();
// const showPending = ref(false);
// const query = ref<RecentsQuery>(buildQuery());
// const pageData = ref({
//   totalCount: 1,
//   perpage: 10,
// });
// const data = ref<IRecent[]>([]);
// const cooldown = ref(false);
// const timeout = ref(undefined);

// const {
//   data: res,
//   error,
//   pending,
//   refresh,
// } = useMyFetch(
//   "/api/showroom/recent",
//   { ...query.value },
//   {
//     initialCache: false,
//     server: false,
//   }
// );

// watch(
//   () => route.query,
//   () => onQueryChange()
// );

// watch(pending, (d) => console.log("Pending", d));

// watch(res, (d: IApiRecents) => {
//   // if ($device.isMobile) {
//   //   data.value.push(...d.recents);
//   // } else {
//   //   data.value = d?.recents ?? [];
//   // }
//   data.value = d?.recents ?? [];
//   pageData.value = {
//     totalCount: d?.total_count ?? 1,
//     perpage: d?.perpage ?? 10,
//   };
// });

// function buildQuery(): RecentsQuery {
//   const reqQuery = route.query;
//   const q = { ...defaultQuery };
//   for (const key of Object.keys(reqQuery)) q[key] = reqQuery[key];
//   if (!sortType[q.sort.toUpperCase()]) q.sort = sortType[sortType.LATEST].toLowerCase();
//   // if ($device.isMobile) {
//   //   q.page = 1;
//   // } else {
//   //   q.page = Number(q.page) ?? 1;
//   //   if (q.page < 1) q.page = 1;
//   // }
//   q.page = Number(q.page) ?? 1;
//   if (q.page < 1) q.page = 1;

//   if (q.filter !== "graduated" && q.filter !== "active") q.filter = "all";
//   return q;
// }

// function buildURL(_query) {
//   // if ($device.isMobile) return;
//   const q = { ..._query };
//   const def = defaultQuery;
//   for (const key of Object.keys(q)) if (q[key] === undefined || q[key] === "" || def[key] === q[key]) delete q[key];
//   router.push({
//     path: route.path,
//     query: { ...q },
//   });
// }

// function onFilter(q) {
//   if (pending.value || cooldown.value) return;
//   changeQuery({ ...q, page: 1 });
// }

// function setCooldown(ms) {
//   if (timeout.value) clearTimeout(timeout.value);
//   cooldown.value = true;
//   timeout.value = setTimeout(() => {
//     cooldown.value = false;
//   }, ms);
// }

// function changeQuery(_query) {
//   if (pending.value || cooldown.value) return;
//   setCooldown(500);
//   buildURL(_query);
// }

// function onQueryChange() {
//   // if ($device.isMobile) return;
//   query.value = buildQuery();
//   if (window) window.scrollTo({ top: 0, behavior: "smooth" });
//   nextTick(() => {
//     refresh(query.value);
//   });
// }

// function onPageChange(page) {
//   if (pending.value || cooldown.value) return;
//   if (isNaN(page)) page = 1;
//   changeQuery({ ...query.value, page });
// }
</script>
