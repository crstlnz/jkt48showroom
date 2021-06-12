<template>
  <div class="log">
    <div class="page-title">
      Recent Log
    </div>
    <div class="top-menu">
      <div class="control-menu">
        <div class="jpnrate">
          <label for="rate">JPY Rate </label>
          <input name="rate" v-model="jpnrate" step="any" type="number" />
        </div>
        <div class="sort-menu">
          <div
            v-for="menu in sortMenu"
            v-bind:class="{ active: menu.value == sort }"
            v-on:click="sort = menu.value"
            v-bind:key="menu.value"
            class="item-menu"
          >
            {{ menu.title }}
          </div>
        </div>
      </div>
      <div class="search">
        <input class="search-input" placeholder="Search..." type="text" />
      </div>
    </div>
    <div class="log-container">
      <div v-if="isLoading" class="loading error">
        Loading...
      </div>
      <div v-else-if="error" class="error">Telah terjadi error!</div>
      <div
        v-else-if="(!logs || !logs.length) && !this.infiniteState.isLoading"
        class="empty error"
      >
        Data tidak ada!
      </div>
      <div v-else class="log-list">
        <Recent
          v-for="log in logs"
          :key="log._id"
          :data="log"
          class="log-item"
        ></Recent>

        <div class="infiniteLoading">
          <div class="loading" v-if="this.infiniteState.isLoading">
            Sedang memuat...
            <div class="loader"></div>
          </div>
          <div class="complete" v-else-if="this.infiniteState.end">
            Tidak ada lagi data :(
          </div>
          <div class="errors" v-else-if="this.infiniteState.error">
            Error bang :'(
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";
// .content {
//   width: 1024px !important;
// }

.log {
  .page-title {
    color: $text;
    font-weight: bold;
    font-size: 38px;
    text-align: center;
    margin-bottom: 30px;
    margin-top: 20px;
    @include for("768px") {
      margin-bottom: 25px;
      margin-top: 15px;
      font-size: 30px;
    }
    @include for("500px") {
      font-size: 25px;
      margin-bottom: 20px;
      margin-top: 10px;
    }
  }
  .top-menu {
    .control-menu {
      padding: 0 20px;
      display: flex;
      color: $text;
      align-content: center;
      justify-content: space-between;

      .jpnrate {
        font-weight: bold;
        input {
          font-size: 16px;
          margin: 0;
          margin-left: 10px;
          padding: 4px 8px;
          width: 100px;
          border-radius: 10px;
          text-align: center;
          box-sizing: border-box;
          background: darken($color3, 3%);
          border: none;
          color: $text;
          &:focus {
            outline: none !important;
          }
        }
      }

      .sort-menu {
        display: flex;
        // font-weight: bold;
        .item-menu {
          padding: 4px 7px;
          font-size: 15px;
          cursor: pointer;
          &:hover {
            background: $color3;
          }
          &.active {
            background: darken($color: $color3, $amount: 6%);
          }
          &:not(:first-child):not(:last-child) {
            margin: 0 2px;
          }
          &:not(:first-child) {
            margin-left: 2px;
          }
          &:not(:last-child) {
            margin-right: 2px;
          }
        }
      }

      @include for("768px") {
        .jpnrate {
          margin-bottom: 10px;
        }
        flex-direction: column;
        align-items: center;
        .sort-menu {
          .item-menu {
            font-size: 14px;
          }
        }
      }
      @include for("400px") {
        .jpnrate {
          margin-bottom: 10px;
        }
        flex-direction: column;
        align-items: center;
        .sort-menu {
          .item-menu {
            font-size: 13px;
          }
        }
      }
    }
    .search {
      margin-top: 10px;

      background: darken($color3, 6%);
      border-radius: 25px;

      input[type="text"] {
        font-size: 16px;
        width: 100%;
        margin: 0;
        border-radius: 25px;
        padding: 15px 20px;
        box-sizing: border-box;
        background: transparent;
        border: none;
        color: $text;
        &:focus {
          outline: none !important;
        }
      }
    }
  }

  .log-container {
    margin-top: 10px;
    .error {
      color: $text;
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      margin-top: 30px;
    }

    .infiniteLoading {
      margin: auto;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 20px;
    }

    .loader {
      color: #ffffff;
      font-size: 16px;
      text-indent: -9999em;
      overflow: hidden;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      margin: 16px auto;
      position: relative;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: load6 1.7s infinite ease, round 1.7s infinite ease;
      animation: load6 1.7s infinite ease, round 1.7s infinite ease;
    }
    @-webkit-keyframes load6 {
      0% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      5%,
      95% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      10%,
      59% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em,
          -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em,
          -0.297em -0.775em 0 -0.477em;
      }
      20% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em,
          -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em,
          -0.749em -0.34em 0 -0.477em;
      }
      38% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em,
          -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em,
          -0.82em -0.09em 0 -0.477em;
      }
      100% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
    }
    @keyframes load6 {
      0% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      5%,
      95% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      10%,
      59% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em,
          -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em,
          -0.297em -0.775em 0 -0.477em;
      }
      20% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em,
          -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em,
          -0.749em -0.34em 0 -0.477em;
      }
      38% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em,
          -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em,
          -0.82em -0.09em 0 -0.477em;
      }
      100% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
          0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
    }
    @-webkit-keyframes round {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes round {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    .log-list {
      color: $text;
      .log-item {
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>

<script>
// import LogList from "~/components/showroom/log/log-list.vue";
import moment from "moment";
moment.locale("id");
// import InfiniteLoading from "vue-infinite-loading";

// const db
export default {
  transition: "log",
  middleware: "japan_rate",
  layout: "48template",
  head: {
    title: "Showroom Log | JKT48Showroom",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "List showroom log yang tercatat bot satan!"
      }
    ],
    script: [
      {
        src:
          "https://cdn.jsdelivr.net/npm/sweetalert2@10.16.7/dist/sweetalert2.all.min.js"
      }
    ]
  },

  data() {
    return {
      error: false,
      logs: null,
      page: 2, /// untuk next load
      sort: "newest",
      isLoading: true,
      jpnrate: 135.65,
      search: null,
      state: null,
      infiniteState: {
        isLoading: false,
        end: false,
        complete: function() {
          this.end = true;
        },
        reset: function() {
          this.end = false;
        },
        loading: function() {
          this.isLoading = true;
          this.end = false;
        },
        loaded: function() {
          this.isLoading = false;
        },
        err: function() {
          this.error = true;
        }
      }
    };
  },
  watch: {
    search: function(val, oldval) {
      if (this.cancel) this.cancel.cancel("Operation canceled by the user.");
      this.logs = [];
      this.page = 1;
      this.infiniteState.loading();
      this.loadPage(true);
    },
    sort: function(val, oldVal) {
      this.logs = [];
      this.page = 1;
      this.infiniteState.loading();
      this.$cookiz.set("sort_state", val, {
        path: "/",
        maxAge: 3600 * 24 * 30 * 12 * 10,
        sameSite: true
      });
      this.loadPage(true);
    }
  },
  computed: {
    user: function() {
      return this.$store.getters.getUser;
    }
  },
  beforeMount() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll: function(el) {
      if (this.infiniteState.end || this.infiniteState.isLoading) return;
      let percent =
        (window.scrollY / (el.target.body.scrollHeight - window.innerHeight)) *
        100;

      if (
        percent > 60 &&
        !this.infiniteState.isLoading &&
        !this.infiniteState.end
      ) {
        this.infiniteState.isLoading = true;
        this.loadPage();
      }
    },
    loadPage(replace = false) {
      this.cancel = this.$axios.CancelToken.source();

      this.$axios
        .get("/api/showroom/log", {
          params: {
            page: this.page,
            sort: this.sort,
            search: this.search
          },
          cancelToken: this.cancel.token
        })
        .then(({ data }) => {
          if (data.length) {
            this.page += 1;
            if (replace) {
              this.logs = data;
            } else {
              this.logs.push(...data);
            }
            this.infiniteState.loaded();
            // $state.loaded();
          } else {
            this.infiniteState.loaded();
            this.infiniteState.complete();
            // $state.complete();
          }
        })
        .catch(e => {
          console.log(e);
          this.infiniteState.err();

          // $state.complete();
        });
    },
    convertRupiah: function(total) {
      // let total = 0;
      // if (this.showroomloglist) total = this.showroomloglist.total_point;

      total = total * this.jpnrate;

      return (
        "Rp. " +
        total
          .toFixed(2)
          .replace(".", ",")
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
      );
    },
    isAdmin: function() {
      if (this.user && this.user.id == "336223763953614859") {
        return true;
      }
      return false;
    },
    time: function(timestamps) {
      return moment(timestamps).format("LLLL");
    },
    relativeTime: function(timestamps) {
      return moment(timestamps).fromNow();
    },
    duration: function(date1, date2) {
      let d = Math.abs(new Date(date2) - new Date(date1));
      return moment.duration(d).humanize();
    },
    infiniteHandler($state) {
      // console.log(this);
      this.$axios
        .get("/api/showroom/log", {
          params: {
            page: this.page,
            sort: this.sort,
            search: this.search
          }
        })
        .then(({ data }) => {
          if (data.length) {
            this.page += 1;
            this.logs.push(...data);
            $state.loaded();
          } else {
            $state.complete();
          }
        })
        .catch(e => {
          $state.complete();
        });
    }
  },

  async asyncData({ $axios, $cookiz, $refs }) {
    let sortMenu = {
      newest: {
        title: "Newest",
        value: "newest"
      },
      oldest: {
        title: "Oldest",
        value: "oldest"
      },
      highest: {
        title: "Most Gifts",
        value: "highest"
      },
      lowest: {
        title: "Least Gifts",
        value: "lowest"
      }
    };

    let sort_state = $cookiz.get("sort_state");

    let sort;
    // console.log(sortMenu[sort_state]);
    if (sort_state && sortMenu[sort_state]) {
      sort = sortMenu[sort_state].value;
    } else {
      sort = "newest";
      $cookiz.set("sort_state", "newest", {
        path: "/",
        maxAge: 3600 * 24 * 30 * 12 * 10,
        sameSite: true
      });
    }

    let jpnrate = $cookiz.get("jpn_rate");
    if (!jpnrate) jpnrate = $cookiz.get("jpn_rate", { fromRes: true });

    try {
      let { data } = await $axios.get("/api/showroom/log", {
        params: { page: 1, sort: sort }
      });

      return {
        jpnrate: jpnrate,
        sort: sort,
        logs: data,
        isLoading: false,
        sortMenu: sortMenu
      };
    } catch (e) {
      console.log(e);
      return {
        error: true,
        sortMenu: sortMenu
      };
    }
  }
};
</script>
