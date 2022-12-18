import moment from "~~/library/utils/moment";
import timeFormat from "~~/library/plugins/timeFormat";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$i18n.onLanguageSwitched = (_oldLocale: any, newLocale: any) => {};
  const locale = nuxtApp.$i18n.localeProperties;
  return {
    provide: {
      fromNow: (date: Date | string | number) => {
        return computed(() => moment(date).locale(locale.value.code).fromNow());
      },
      duration: (dateFrom: Date | string | number, dateTo: Date | string | number) => {
        return computed(() => timeFormat.detailDuration(dateFrom, dateTo, locale.value.code));
      },
      moment,
      formatSR(time: Date | string) {
        return computed(() => moment(time).locale(locale.value.code).format("h:mm A") + "~");
      },
    },
  };
});
