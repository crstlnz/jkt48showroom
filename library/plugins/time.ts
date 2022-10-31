import moment from "moment";

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

const indo: IDateString = {
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

const dateString: IDateString = english;

function getStringDuration(time): IStringDuration {
  if (time >= secondsTime.year) {
    // 1 year
    const num = Math.floor(time / secondsTime.year);
    return {
      string: `${num} ${dateString.year}`,
      num: num,
      type: "year",
      remainingTime: time - num * secondsTime.year,
    };
  } else if (time >= secondsTime.month) {
    const num = Math.floor(time / secondsTime.month);
    return {
      string: `${num} ${dateString.month}`,
      num: num,
      type: "month",
      remainingTime: time - num * secondsTime.month,
    };
  } else if (time >= secondsTime.day) {
    const num = Math.floor(time / secondsTime.day);
    return {
      string: `${num} ${dateString.day}`,
      num: num,
      type: "day",
      remainingTime: time - num * secondsTime.day,
    };
  } else if (time >= secondsTime.hour) {
    const num = Math.floor(time / secondsTime.hour);
    return {
      string: `${num} ${dateString.hour}`,
      num: num,
      type: "hour",
      remainingTime: time - num * secondsTime.hour,
    };
  } else if (time >= secondsTime.minute) {
    const num = Math.floor(time / secondsTime.minute);
    return {
      string: `${num} ${dateString.minute}`,
      num: num,
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
  fromNow(time) {
    return moment(time).fromNow();
  },
  formatSR(time) {
    return moment(time).format("h:mm A") + "~";
  },

  detailDuration(time1, time2) {
    const time = Math.floor(Math.abs(new Date(time1).getTime() - new Date(time2).getTime()) / 1000); // in seconds
    function get(time, res = []) {
      const data = getStringDuration(time);
      if ("english" === "english") {
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
