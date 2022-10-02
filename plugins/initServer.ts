import { useOnLives } from "~~/store/onLives";
import { useMembers } from "~/store/members";
export default defineNuxtPlugin(({ hook, $nextTick }) => {
  const members = useMembers();
  const onLives = useOnLives();
  hook("app:created", async () => {
    await members.load();
  });

  hook("app:mounted", () => {
    onLives.tryRefresh();
    const focused = useWindowFocus();
    watch(focused, (isFocus) => {
      if (isFocus) onLives.tryRefresh();
    });

    const { idle } = useIdle();
    watch(idle, (isIdle) => {
      if (!isIdle) {
        onLives.tryRefresh();
      }
    });
  });

  hook("page:start", () => {
    onLives.tryRefresh();
  });

  hook("page:finish", () => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  });
});
