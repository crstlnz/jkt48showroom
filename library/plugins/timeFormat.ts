import moment from "~/library/utils/moment";
const secondsTime = {
  year: 31536000,
  month: 2628000,
  day: 86400,
  hour: 3600,
  minute: 60,
};

interface IDateString {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

type TimeType = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

interface IStringDuration {
  string: string;
  num: number;
  type: TimeType;
  remainingTime: number;
}

const indonesian: IDateString = {
  year: "tahun",
  month: "bulan",
  day: "hari",
  hour: "jam",
  minute: "menit",
  second: "detik",
};

const english: IDateString = {
  year: "year",
  month: "month",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
};

type LocaleType = "en" | "id";
function getStringDuration(time: number, locale: LocaleType | null = null): IStringDuration {
  const dateString: IDateString = locale === "en" || locale === null ? english : indonesian;
  if (time >= secondsTime.year) {
    // 1 year
    const num = Math.floor(time / secondsTime.year);
    return {
      string: `${num} ${dateString.year}`,
      num,
      type: "year",
      remainingTime: time - num * secondsTime.year,
    };
  } else if (time >= secondsTime.month) {
    const num = Math.floor(time / secondsTime.month);
    return {
      string: `${num} ${dateString.month}`,
      num,
      type: "month",
      remainingTime: time - num * secondsTime.month,
    };
  } else if (time >= secondsTime.day) {
    const num = Math.floor(time / secondsTime.day);
    return {
      string: `${num} ${dateString.day}`,
      num,
      type: "day",
      remainingTime: time - num * secondsTime.day,
    };
  } else if (time >= secondsTime.hour) {
    const num = Math.floor(time / secondsTime.hour);
    return {
      string: `${num} ${dateString.hour}`,
      num,
      type: "hour",
      remainingTime: time - num * secondsTime.hour,
    };
  } else if (time >= secondsTime.minute) {
    const num = Math.floor(time / secondsTime.minute);
    return {
      string: `${num} ${dateString.minute}`,
      num,
      type: "minute",
      remainingTime: time - num * secondsTime.minute,
    };
  } else {
    return {
      string: `${time} ${dateString.second}`,
      num: time,
      type: "second",
      remainingTime: 0,
    };
  }
}

export default {
  fromNow(time: Date | string) {
    return moment(time).fromNow();
  },
  formatSR(time: Date | string) {
    return moment(time).format("h:mm A") + "~";
  },

  detailDuration(time1: Date | string | number, time2: Date | string | number, lang: LocaleType | null = null) {
    if (!lang) lang = "en";
    const time = Math.floor(Math.abs(new Date(time1).getTime() - new Date(time2).getTime()) / 1000); // in seconds
    function get(time: number, res: unknown[] = []): unknown[] {
      const data = getStringDuration(time, lang);
      if (lang === "en") {
        res.push(data.string + (data.num > 1 ? "s" : ""));
      } else {
        res.push(data.string);
      }
      if (data.remainingTime > 0) {
        return get(data.remainingTime, res);
      }
      return res;
    }
    return get(time).join(" ");
  },
};
