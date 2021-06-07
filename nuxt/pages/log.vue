<template>
  <div class="mainmenu">
    <div v-if="error" class="error">Telah terjadi error!</div>
    <div v-else class="loglist">
      <div class="topmenu">
        <div class="menu">
          <div class="jpnrate">
            <label for="rate">JPY Rate </label>
            <input name="rate" v-model="jpnrate" step="any" type="number" />
          </div>
          <div class="toggle">
            <div
              v-for="menu in sortMenu"
              v-bind:class="{ active: menu.value == sort }"
              v-on:click="sort = menu.value"
              v-bind:key="menu.value"
            >
              {{ menu.title }}
            </div>
          </div>
        </div>
        <div class="search">
          <input v-model="search" type="text" placeholder="Search..." />
        </div>
      </div>
      <!-- <div class="search">Search Div</div> -->

      <div v-if="isLoading" class="error">Loading...</div>
      <div v-else-if="logs && logs.length > 0" class="data">
        <!-- <transition-group type="transition"> -->
        <Loglist v-for="log in logs" v-bind:log="log" v-bind:key="log._id">
        </Loglist>
        <!-- </transition-group> -->
      </div>
      <div
        v-else-if="(!logs || logs.length == 0) && !this.infiniteState.isLoading"
        class="error"
      >
        Tidak ada data!
      </div>

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
      <!-- <infinite-loading @infinite="infiniteHandler"></infinite-loading> -->
    </div>
  </div>
</template>
<style lang="scss">
@import "~assets/core.scss";
* {
  box-sizing: border-box;
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
  data() {
    return {
      error: false,
      logs: null,
      page: 2,
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
      },
      sortMenu: {
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
      }
    };
  },
  watch: {
    search: function(val, oldval) {
      if (this.cancel) this.cancel.cancel("Operation canceled by the user.");
      this.logs = [];

      // this.$refs.infiniteLoading.$emit("$InfiniteLoading:reset");
      this.page = 1;
      this.infiniteState.loading();
      // this.infiniteState.reset();
      this.loadPage(true);
      // this.$axios
      //   .get("/api/showroom/log", {
      //     params: {
      //       page: this.page,
      //       sort: this.sort,
      //       search: this.search,
      //     },
      //     cancelToken: this.cancel.token,
      //   })
      //   .then(({ data }) => {
      //     this.isLoading = false;
      //     this.cancel = null;
      //     this.page++;
      //     this.logs = data;
      //   })
      //   .catch((e) => {
      //     if (this.$axios.isCancel(e)) {
      //       // console.log("Request canceled", e);
      //     } else {
      //       this.cancel = null;
      //       this.isLoading = false;

      //       console.log(e);
      //       this.error = true;
      //     }
      //   });
    },
    sort: function(val, oldVal) {
      this.logs = [];
      // this.$refs.infiniteLoading.$emit("$InfiniteLoading:reset");
      this.page = 1;
      this.infiniteState.loading();
      this.$cookiz.set("sort_state", val);
      this.loadPage(true);

      // this.$axios
      //   .get("/api/showroom/log", {
      //     params: {
      //       page: this.page,
      //       sort: this.sort,
      //       search: this.search,
      //     },
      //   })
      //   .then(({ data }) => {
      //     this.isLoading = false;

      //     this.page++;
      //     this.logs = data;
      //   })
      //   .catch((e) => {
      //     this.isLoading = false;

      //     console.log(e);
      //     this.error = true;
      //   });
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
    handleScroll: function() {
      if (this.infiniteState.end || this.infiniteState.isLoading) return;
      let percent =
        (window.scrollY /
          (document.body.scrollHeight - document.body.offsetHeight)) *
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
    toRupiah: function(total) {
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
  // fetchOnServer: false,
  // async fetch() {
  //   // let sortMenu = {
  //   //   newest: {
  //   //     title: "Newest",
  //   //     value: "newest"
  //   //   },
  //   //   oldest: {
  //   //     title: "Oldest",
  //   //     value: "oldest"
  //   //   },
  //   //   highest: {
  //   //     title: "Most Gifts",
  //   //     value: "highest"
  //   //   },
  //   //   lowest: {
  //   //     title: "Least Gifts",
  //   //     value: "lowest"
  //   //   }
  //   // };
  //   // this.sortMenu = sortMenu;

  //   let sort_state = this.$cookiz.get("sort_state");

  //   let sort;
  //   // console.log(sortMenu[sort_state]);
  //   if (sort_state && this.sortMenu[sort_state]) {
  //     sort = this.sortMenu[sort_state].value;
  //   } else {
  //     sort = "newest";
  //     this.$cookiz.set("sort_state", "newest");
  //   }

  //   this.sort = sort;

  //   try {
  //     let { data } = await this.$axios.get(
  //       "http://192.168.1.2:48/api/showroom/log",
  //       {
  //         params: { page: 1, sort: this.sort }
  //       }
  //     );
  //     this.logs = data;

  //     this.isLoading = false;

  //     // return {
  //     //   jpnrate: $cookiz.get("jpn_rate"),
  //     //   sort: sort,
  //     //   logs: data,
  //     //   isLoading: false,
  //     //   sortMenu: sortMenu
  //     // };
  //   } catch (e) {
  //     this.isLoading = false;
  //     this.error = true;

  //     console.log(e);
  //     // return {
  //     //   error: true,
  //     //   sortMenu: sortMenu
  //     // };
  //   }
  // }
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
      $cookiz.set("sort_state", "newest");
    }

    try {
      let { data } = await $axios.get("/api/showroom/log", {
        params: { page: 1, sort: sort }
      });

      let jpnrate = $cookiz.get("jpn_rate");
      if (!jpnrate) jpnrate = $cookiz.get("jpn_rate", { fromRes: true });

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
    // try {
    //   let { data } = await this.$axios.get("/api/commands");
    //   this.commands = data.commands;
    //   this.prefix = data.prefix;
    //   this.setLoaded();
    // } catch (e) {
    //   this.setLoaded();
    // }
    // this.$store.commit("commands/setCommands", "weawdawdw");
  }
};
</script>

<style></style>
