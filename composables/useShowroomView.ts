import type { Ref } from "vue";
import { FansAvatar, StageShowroom, stagePositions } from "~~/library/canvas/showroom/stage";
import ShowroomBackground from "~~/library/canvas/showroom/background";
import ShowroomForeground from "~~/library/canvas/showroom/foreground";
import url from "node:url";
import CanvasUtil from "~~/library/canvas/showroom/canvasUtil";
export default function (stageCanvas, backgroundCanvas, foregroundCanvas, fansRanks: IStageFans[]) {
  const isAnimate = ref(false);
  const stage = new StageShowroom();
  const background = new ShowroomBackground();
  const foreground = new ShowroomForeground();
  const workerPath = "../library/canvas/showroom/worker.ts";
  // const script = process.server
  //   ? new url.URL(workerPath, import.meta.url)
  //   : new window.URL(workerPath, import.meta.url);
  // const worker = new Worker(script, { type: "module" });
  // const worker = new Worker(workerPath, { type: "module" });
  // worker.onerror = () => {
  //   console.log("ERRORRR");
  // };

  onMounted(() => {
    if (!stageCanvas.value || !backgroundCanvas.value || !foregroundCanvas.value) throw new Error("Canvas not found!");
    // const cWorker = stageCanvas.value.transferControlToOffscreen();
    // postMessage({ type: "canvas", canvas: cWorker }, [cWorker]);
    // postMessage({ type: "setFans", data: fansRanks });
    // generateFansAvatar(fansRanks);
    // setFans(fansRanks);
    stage.inject(stageCanvas.value);
    stage.setFans(fansRanks);
    foreground.inject(foregroundCanvas.value);
    background.inject(backgroundCanvas.value);
  });

  // function postMessage(message: WorkerMessage, transfer?: Transferable[]) {
  //   worker.postMessage(message, transfer);
  // }

  // async function generateFansAvatar(fansRanks: IStageFans[]) {
  //   const canvasWidth = stageCanvas.value.width;
  //   for (const fans of fansRanks) {
  //     try {
  //       const imageData = await FansAvatar.generateAvatar(fans.avatar, fans.name, canvasWidth);
  //       const imageBuffer = imageData.data.buffer;
  //       postMessage(
  //         {
  //           type: "setFansAvatar",
  //           imageData: {
  //             id: fans.id,
  //             size: {
  //               width: imageData.width,
  //               height: imageData.height,
  //             },
  //           },
  //           data: imageBuffer,
  //         },
  //         [imageBuffer]
  //       );
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // }

  // async function setFans(fansRanks: IStageFans[]) {
  //   const fansAvatars = [];
  //   const canvasUtil = new CanvasUtil();
  //   const canvas = stageCanvas.value;
  //   for (const [i, fans] of fansRanks.entries()) {
  //     const img = await canvasUtil.createImage(fans.avatar);
  //     const pos = stagePositions[i] ?? [0.82, 0.72];
  //     fansAvatars.push(new FansAvatar(img, canvas.width * pos[0], canvas.height * pos[1], canvas.width * 0.0625));
  //   }
  //   postMessage({ type: "setFans", data: fansAvatars }, [fansAvatars]);
  // }

  // watch(isAnimate, (val) => {
  //   if (val) {
  //     draw();
  //   }
  // });
}
