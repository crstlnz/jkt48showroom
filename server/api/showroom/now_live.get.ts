import axios from "axios";
import { parse } from "node-html-parser";
import { getMembers } from "./members.get";
import cache from "~~/library/utils/cache";
import config from "~/config";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default defineEventHandler(async (): Promise<INowLive[]> => {
  // const nowLive = [...(await getNowLive())];
  // nowLive.push({
  //   name: "Beby/ベビー",
  //   img: "https://res.cloudinary.com/haymzm4wp/image/upload/v1659596759/jkt48/stage48/Beby%20Chaesara%20Anadila.jpg",
  //   url: "/Beby_Chaesara",
  //   // room_id: 318114,
  //   room_id: 258181,
  //   is_graduate: true,
  //   is_group: false,
  //   room_exists: true,
  // });
  return await getNowLive();
});
export { getNowLive, getNowLiveDirect, getNowLiveIndirect, getNowLiveCookies };
const time = 60000;
async function getNowLive(): Promise<INowLive[]> {
  return await cache.fetch<INowLive[]>("now_live", getNowLiveCookies, time).catch(() => []);
}

async function getNowLiveDirect(membersData: IMember[] = null): Promise<INowLive[]> {
  const members: IMember[] = membersData ?? (await getMembers());
  const promises: Promise<INowLive>[] = [];
  for (const member of members) {
    promises.push(
      (async (): Promise<INowLive> => {
        try {
          const { data } = await axios.get(config.isLiveURL, {
            params: {
              room_id: member.room_id,
              _: new Date().getTime(),
            },
          });
          if (!data.ok) return null;
          return {
            name: member.name,
            img: member.img,
            url: member.url,
            room_id: member.room_id,
            is_graduate: member.is_graduate,
            is_group: member.is_group,
            room_exists: member.room_exists,
          };
        } catch (e) {
          return null;
        }
      })()
    );
  }
  const data = await Promise.all(promises);
  return data.filter((i) => i);
}

async function getNowLiveCookies(): Promise<INowLive[]> {
  const members: IMember[] = [...(await getMembers())];
  const response = await fetch(config.followURL, {
    headers: {
      Cookie: `sr_id=${process.env.SR_TOKEN};`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch showroom page!");
  const result = await response.text();
  const document = parse(result);
  const elements = document.querySelectorAll("#js-genre-section-all .js-follow-li");
  const roomInfo = new Map();
  for (const el of elements) {
    const roomId = el.querySelector(".room-url").getAttribute("data-room-id");
    if (roomId && !isNaN(Number(roomId))) {
      const isLive = !!el.querySelector(".is-onlive");
      roomInfo.set(Number(roomId), isLive);
    }
  }

  const res: INowLive[] = [];
  const missing = [];
  for (const member of members) {
    if (roomInfo.has(member.room_id)) {
      if (roomInfo.get(member.room_id))
        res.push({
          name: member.name,
          img: member.img,
          url: member.url,
          room_id: member.room_id,
          is_graduate: member.is_graduate,
          is_group: member.is_group,
          room_exists: member.room_exists,
        });
    } else if (member.room_exists) {
      missing.push(member);
    }
  }

  if (missing.length) {
    const missingMember = await getNowLiveDirect(missing);
    res.push(...missingMember);
  }
  return res;
}

async function getNowLiveIndirect(): Promise<INowLive[]> {
  const members: IMember[] = await getMembers();
  const { data: res } = await axios.get(`${config.onLivesURL}?_=${new Date().getTime()}`);
  const all = res.onlives.reduce((a, b) => {
    a.push(...b.lives);
    return a;
  }, []);
  const lives: IMember[] = [];
  for (const member of members) if (all.some((m) => m.room_id === member.room_id)) lives.push({ ...member });
  return lives.map<INowLive>((m) => ({
    name: m.name,
    img: m.img,
    url: m.url,
    room_id: m.room_id,
    is_graduate: m.is_graduate,
    is_group: m.is_group,
    room_exists: m.room_exists,
  }));
}
