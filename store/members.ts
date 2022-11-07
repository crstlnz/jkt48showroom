import { acceptHMRUpdate, defineStore } from "pinia";

export const useMembers = defineStore("members", () => {
  const error = useState("error", () => false);
  const loading = useState("loading", () => false);
  const members = useState<IMember[] | null>("members", () => null);

  async function load() {
    try {
      loading.value = true;
      const data = await $fetch("/api/showroom/members");
      error.value = false;
      loading.value = false;
      members.value = data;
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
