export default function (id: string) {
  const route = useRoute();
  const router = useRouter();
  const state = ref(false);

  if (route.query[id] !== undefined) {
    const query = {
      ...route.query,
    };
    delete query[id];
    router.push({
      path: route.path,
      query,
    });
  }

  watch(
    () => route.query,
    (to, from) => {
      const tQ = to[id];
      const fQ = from[id];
      if (tQ === undefined && fQ === null) {
        state.value = false;
      } else if (tQ === null && fQ === undefined) {
        state.value = true;
      }
    }
  );

  // watch(state, async (_state) => {
  //   if (_state) {
  //     const query = {
  //       ...route.query,
  //     };
  //     query[id] = null;
  //     await router.push({
  //       path: route.path,
  //       query,
  //     });
  //   } else {
  //     router.back();
  //   }
  // });

  function setState(_state: boolean) {
    if (_state) {
      const query = {
        ...route.query,
      };
      query[id] = null;
      router.push({
        path: route.path,
        query,
      });
    } else {
      router.back();
    }
  }
  return { state, setState };
}
