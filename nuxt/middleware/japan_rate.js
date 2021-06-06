export default function({ $cookiz, $axios }) {
  if (!$cookiz.get("jpn_rate") || isNaN($cookiz.get("jpn_rate"))) {
    return $axios
      .get("/api/japanrate.json")
      .then(res => {
        let rate = res.data.value;
        if (!rate) rate = 132.25;
        $cookiz.set("jpn_rate", rate, {
          path: "/",
          maxAge: 3600,
          sameSite: true
        });
        return;
      })
      .catch(e => {
        $cookiz.set("jpn_rate", 132.25, {
          path: "/",
          maxAge: 3600,
          sameSite: true
        });

        return;
      });
  }
  return;
}
