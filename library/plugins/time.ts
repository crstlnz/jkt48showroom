import moment from "moment";

export default {
  fromNow(time) {
    return moment(time).fromNow();
  },
  formatSR(time) {
    return moment(time).format("h:mm A") + "~";
  },
};
