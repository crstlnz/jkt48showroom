// import util from "../library/plugins/util";
// import time from "../library/plugins/time";
// import config from "~~/config";
// import SwipeDetector from "~~/library/plugins/swipeDetector";
// import DragListener from "~~/library/plugins/dragListener";
export default defineNuxtPlugin(() => {
  // type CurrencyType = "jpy" | "idr" | "sr";
  // return {
  //   provide: {
  //     fixCloudinary: (url: string, w = 300, h = 300) => {
  //       if (url?.includes("res.cloudinary.com")) {
  //         const d = url.split("upload/");
  //         return d.join(`upload/c_fit,c_fill,g_face,h_${h},w_${w}/`);
  //       }
  //       return url;
  //     },
  //     util,
  //     time,
  //     // createSwipeDetector: (x: number, y: number, mode: string) => new SwipeDetector(x, y, mode),
  //     // createDragListener: (el: any) => new DragListener(el),
  //     ...config,
  //     currency(num: number, type: CurrencyType = "sr") {
  //       const { n: $n } = useI18n();
  //       if (type == "sr") {
  //         return `${$n(num)} G`;
  //       } else {
  //         if (type == "jpy") return $n(num * 1.1, "currency", "ja-JP");
  //         return $n(num * 1.1 * 105.5, "currency", "id-ID");
  //       }
  //     },
  //   },
  // };
});
