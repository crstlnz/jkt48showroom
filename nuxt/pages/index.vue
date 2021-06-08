<template>
  <div class="mainmenu">
    <div v-if="error" class="error">Telah terjadi error!</div>
    <div v-else class="home">
      <div class="iklan">
        <a
          target="_blank"
          href="https://www.showroom-live.com/campaign/akb48_sr_eng_ind"
          ><img
            data-src="https://image.showroom-cdn.com/showroom-prod/image/top_slider/0f2072404986edd4f5883e76c7a45a84.png"
            alt=""
            v-lazy-load
        /></a>
      </div>
      <div class="nowlive listsr">
        <div class="title"><i class="fas fa-video live"></i>Live</div>
        <div class="item">
          <div v-if="now_live == null" class="kosong">
            Hmm sepertinya terjadi error :(<br />Silahkan coba refresh ulang!
          </div>
          <div v-else-if="!now_live.length" class="kosong">
            Hmm saat ini tidak ada yang lagi live :(
          </div>
          <div v-else class="item-container">
            <NowLive
              v-for="item of now_live"
              v-bind:key="item.room_id"
              :data="item"
              class="itemlist"
            ></NowLive>
          </div>
        </div>
      </div>
      <div class="nextlive listsr">
        <div class="title">
          <img data-src="/calendar.png" alt="" v-lazy-load />Next Live
        </div>
        <div class="item">
          <div v-if="next_live == null" class="kosong">
            Hmm sepertinya terjadi error :(<br />Silahkan coba refresh ulang!
          </div>
          <div v-else-if="!next_live.length" class="kosong">
            Hmm saat ini tidak ada yang menjadwalkan live showroom :(
          </div>
          <div v-else class="item-container">
            <NextLive
              v-for="item of next_live"
              v-bind:key="item.room_id"
              :data="item"
              class="itemlist"
            ></NextLive>
          </div>
        </div>
      </div>
      <div class="recent listsr">
        <div class="title"><i class="fas fa-history recent"></i>Recent</div>
        <div class="item">
          <div v-if="recent == null" class="kosong">
            Hmm sepertinya terjadi error :(<br />Silahkan coba refresh ulang!
          </div>
          <div v-else-if="!recent.length" class="kosong">
            Hmm saat ini belum ada recent :(
          </div>
          <div v-else class="item-container recent-container">
            <Recent
              v-for="item of recent"
              v-bind:key="item.room_id"
              :data="item"
              class="itemlist"
            ></Recent>

            <div v-if="recent_length > recent.length" class="more">
              <NuxtLink to="/log" class="more_link" prefetch
                >Lihat selanjutnya</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import "~assets/core.scss";
* {
  box-sizing: border-box;
}

@import "~assets/showroom-card.scss";

.mainmenu {
  padding: 10px;
  color: $text;
  .error {
    margin-top: 30px;
    font-size: 32px;
    text-align: center;
    font-weight: bold;
  }

  .iklan {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    img {
      text-align: center;
      width: 500px;
      max-width: 100%;
    }
  }

  .listsr {
    &:not(:last-child) {
      border-bottom: 2px dashed lighten($color3, 10%);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .title {
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 10px;
      img {
        margin: 0;
        padding: 0;
        height: 23px;
        vertical-align: bottom;
        margin-right: 7px;
      }
      i {
        margin-right: 10px;

        &.live {
          color: rgb(255, 68, 68);
        }
        &.nextlive {
          color: rgb(155, 255, 152);
        }
        &.recent {
          color: rgb(117, 193, 255);
        }
      }
    }

    .item {
      border-radius: 5px;
      padding: 15px;
      background: lighten($color3, 6%);
      overflow: hidden;
      overflow-x: auto;

      .kosong {
        flex: 1;
        align-self: center;
        font-weight: bold;
        font-size: 16px;
        height: 155px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .item-container {
        width: 100%;
        display: grid;
        grid-gap: 15px;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        .itemlist {
          // display: inline-block;
        }

        @include for("330px") {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }

        .more {
          text-align: right;
          .more_link {
            text-decoration: none;
            color: inherit;
            font-weight: bold;
            &:hover {
              color: darken($color: $text, $amount: 15%);
            }
          }
        }
      }

      .recent-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      // white-space: nowrap;
      // overflow-x: auto;
      &::-webkit-scrollbar {
        height: 15px;
        overflow: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &::-webkit-scrollbar-track {
        background: darken($color3, 3%);
        overflow: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        padding: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: lighten($color3, 30%);
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: lighten($color3, 20%);
      }
    }
  }
}
</style>

<script>
import moment from "moment";
moment.locale("id");

export default {
  layout: "48template",
  head: {
    title: "JKT48 Showroom Log",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "Showroom Log JKT48!"
      }
    ]
    // script: [
    //   {
    //     src:
    //       "https://cdn.jsdelivr.net/npm/sweetalert2@10.16.7/dist/sweetalert2.all.min.js"
    //   }
    // ]
  },
  middleware: "japan_rate",
  data() {
    return {
      error: false,
      loading: true
    };
  },
  computed: {
    recent_length() {
      if (!this.recent_raw) return 0;
      if (!this.recent.length) return 0;
      return this.recent_raw.length;
    },
    next_live() {
      if (this.next_live_raw == null) return null;
      if (!this.next_live_raw.length) return [];
      let next_live = this.next_live_raw;
      if (this.now_live_raw && this.now_live_raw.length) {
        let now_live = this.now_live_raw;
        next_live = next_live.filter(
          i => !now_live.some(item => item.room_id == i.room_id)
        );
      }
      return next_live.sort((a, b) => a.epoch - b.epoch);
    },
    now_live() {
      if (this.now_live_raw == null) return null;
      if (!this.now_live_raw.length) return [];
      return this.now_live_raw.sort((a, b) => a.start_date - b.start_date);
    },
    recent() {
      if (this.recent_raw == null) return null;
      if (!this.recent_raw.length) return [];
      return this.recent_raw.slice(0, -1);
    }
  },
  watch: {},
  methods: {
    relativeTime: function(timestamps) {
      return moment(timestamps).fromNow();
    },
    convertRupiah(num) {
      num = num * this.jpnrate;

      return (
        "Rp. " +
        num
          .toFixed(2)
          .replace(".", ",")
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
      );
    }
  },
  async asyncData({ $axios, $cookiz, from }) {
    let jpnrate = $cookiz.get("jpn_rate");
    if (!jpnrate) jpnrate = $cookiz.get("jpn_rate", { fromRes: true });

    let next_live_raw = null,
      now_live_raw = null,
      recent_raw = null;
    try {
      let promises = [
        $axios.get("/api/showroom/next_live", { progress: false }),
        $axios.get("/api/showroom/now_live"),
        $axios.get("/api/showroom/log", {
          progress: false,
          params: {
            limit: 5
          }
        })
      ];

      let [a, b, c] = await Promise.all(promises);

      if (process.client) {
        console.log(from);
      }

      next_live_raw = a.data;
      now_live_raw = b.data;
      recent_raw = c.data;
    } catch (e) {
      console.log(e);
    }

    // let nextlive = [
    //   {
    //     _id: "5f99aa504a4eae0878089490",
    //     img:
    //       "https://image.showroom-cdn.com/showroom-prod/image/room/cover/8a8f191c39eed7855386fd2ebaf8de52f315ec9e9cfef8d950e715f90605dd27_m.jpeg?v=1617298507",
    //     url: "/JKT48_Celine",
    //     name: "Celine/セリーン（JKT48）",
    //     room_id: 317752,
    //     epoch: 1622988000,
    //     text: "6/6 23:00"
    //   }
    // ];

    return {
      jpnrate: jpnrate,
      next_live_raw: next_live_raw,
      now_live_raw: now_live_raw,
      recent_raw: recent_raw
    };
  }
};
</script>

<style></style>
