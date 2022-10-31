import { acceptHMRUpdate } from "pinia";

export const useMembers = defineStore("members", () => {
  // const error = ref(false);
  // const loading = ref(false);
  // const members = ref(null);
  const error = useState("error", () => false);
  const loading = useState("loading", () => false);
  const members = useState("members", () => null);

  async function load() {
    try {
      loading.value = true;
      const data = await $fetch("/api/showroom/members");
      error.value = false;
      loading.value = false;
      members.value = data as IMember[];
    } catch (e) {
      loading.value = false;
      error.value = true;
    }
  }

  return {
    members,
    pending: computed(() => {
      return loading.value || !members.value?.length;
    }),
    error,
    load,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMembers, import.meta.hot));
}
