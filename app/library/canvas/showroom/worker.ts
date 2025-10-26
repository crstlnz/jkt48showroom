// import { StageShowroom } from "./stage";

// const canvas = new StageShowroom();

// self.onmessage = async function (event) {
//   if (event.data.type === "canvas") {
//     canvas.inject(event.data.canvas);
//   } else {
//     if (event.data.type === "setFans") {
//       canvas.setFans(event.data.data);
//     } else if (event.data.type == "setFansAvatar") {
//       console.log("setavatar");
//       // const pixels = new Uint8ClampedArray(event.data.data);
//       const size = event.data.imageData.size;
//       // for (let y = 0; y < size; y++) {
//       //   for (let x = 0; x < size; x++) {
//       //     const i = (y * size + x) * 4;
//       //     pixels[i] = x; // red
//       //     pixels[i + 1] = y; // green
//       //     pixels[i + 2] = 0; // blue
//       //     pixels[i + 3] = 255; // alpha
//       //   }
//       // }
//       // const image = await StageShowroom.createImage(new ImageData(pixels, size, size));
//       const imageBuffer = event.data.data;
//       const imageData = new ImageData(imageBuffer, event.data.imageData.size.width, event.data.imageData.size.height);
//       const image =
//       canvas.setFansAvatar(event.data.imageData.id, image);
//     }
//   }
// };
