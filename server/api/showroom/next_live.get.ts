// import { parse } from "node-html-parser";
import { getMembers } from "./members.get";
import cache from "~~/library/utils/cache";
import ShowroomAPI from "~/library/api/showroom";
export default defineEventHandler(async () => {
  return await getNextLive();
});

export { getNextLive };

const time = 10800000; // 3 hours
async function getNextLive(): Promise<INextLive[]> {
  return await cache.fetch<INextLive[]>("next_live", () => getDirectNextLive(), time).catch(() => []);
}

// async function getNextLiveCookies(): Promise<INextLive[]> {
//   const members: IMember[] = [...(await getMembers())];
//   const response = await fetch(config.followURL, {
//     headers: {
//       Cookie: `sr_id=${process.env.SR_TOKEN};`,
//     },
//   });
//   if (!response.ok) throw new Error("Failed to fetch showroom page!");
//   const result = await response.text();
//   const document = parse(result);
//   const elements = document.querySelectorAll("#js-genre-section-all .js-follow-li");
//   const roomInfo = new Map();
//   const year = new Date().getFullYear();
//   for (const el of elements) {
//     const roomId = el.querySelector(".room-url")?.getAttribute("data-room-id");
//     if (roomId && !isNaN(Number(roomId))) {
//       const nextLiveDate = el.querySelector(".is-nextlive")?.innerText;
//       const isNextLive = !!el.querySelector(".is-nextlive");
//       roomInfo.set(Number(roomId), {
//         isNextLive,
//         date: isNextLive ? new Date(`${nextLiveDate} ${year}`) : null,
//       });
//     }
//   }

//   const res: INextLive[] = [];
//   const missing: IMember[] = [];
//   for (const member of members) {
//     if (roomInfo.has(member.room_id)) {
//       const room = roomInfo.get(member.room_id);
//       if (room.isNextLive)
//         res.push({
//           name: member.name,
//           img: member.img,
//           url: member.url,
//           room_id: member.room_id,
//           is_graduate: member.is_graduate,
//           is_group: member.is_group,
//           room_exists: member.room_exists,
//           date: room.date.toISOString(),
//         });
//     } else if (member.room_exists) {
//       missing.push(member);
//     }
//   }

//   if (missing.length) {
//     const missingMember = await fetchNextLive(missing);
//     res.push(...missingMember);
//   }
//   return res;
// }

async function getDirectNextLive(membersData: IMember[] | null = null): Promise<INextLive[]> {
  try {
    const members: IMember[] = (membersData ?? (await getMembers())).filter((i) => i.room_exists);
    const promises: Promise<INextLive | null>[] = [];
    for (const member of members) {
      promises.push(
        (async (): Promise<INextLive | null> => {
          try {
            const data = await ShowroomAPI.nextLive(member.room_id);
            if (!data.epoch) return null;
            return {
              img: member.img,
              url: member.url,
              name: member.name,
              room_id: member.room_id,
              is_graduate: member.is_graduate,
              is_group: member.is_group,
              room_exists: member.room_exists,
              date: new Date(data.epoch * 1000).toISOString(),
            };
          } catch (e) {
            return null;
          }
        })()
      );
    }
    let data: INextLive[] = (await Promise.all(promises)).filter((i) => i) as INextLive[];
    data = data.filter((i) => new Date(i.date).getTime() - new Date().getTime() > 0);
    return data;
  } catch (e) {
    return [];
  }
}
