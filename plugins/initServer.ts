// import { useOnLives } from "~~/store/onLives";
import { useMembers } from "~/store/members";
export default defineNuxtPlugin(({ hook, $nextTick }) => {
  const members = useMembers();
  hook("app:created", async () => {
    await members.load();
  });

  hook("app:mounted", () => {
    // const onLives = useOnLives();
    // onLives.tryRefresh();
    const focused = useWindowFocus();
    watch(focused, (isFocus) => {
      // if (isFocus) onLives.tryRefresh();
    });
    const { idle } = useIdle();
    watch(idle, (isIdle) => {
      if (!isIdle) {
        // onLives.tryRefresh();
      }
    });
    hook("page:start", () => {
      // onLives.tryRefresh();
    });
  });
});
