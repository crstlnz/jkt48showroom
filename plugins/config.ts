import util from "../library/plugins/util";
import time from "../library/plugins/time";
import config from "~~/config";
import SwipeDetector from "~~/library/plugins/swipeDetector";
import DragListener from "~~/library/plugins/dragListener";
export default defineNuxtPlugin(() => {
  return {
    provide: {
      fixCloudinary: (url: string, w = 300, h = 300) => {
        if (url?.includes("res.cloudinary.com")) {
          const d = url.split("upload/");
          return d.join(`upload/c_fit,c_fill,g_face,h_${h},w_${w}/`);
        }
        return url;
      },
      util,
      time,
      createSwipeDetector: (x, y, mode) => new SwipeDetector(x, y, mode),
      createDragListener: (el) => new DragListener(el),
      ...config,
    },
  };
});
