<template>
  <div class="memberlist main">
    <div class="topmenu">
      <div class="totalmember">Total Member : {{ members.length }}</div>
      <div class="scrolltoggle">
        <label for="sl">Auto Scroll </label
        ><input v-model="enable_scroll" id="sl" name="sl" type="checkbox" />
      </div>
    </div>
    <transition-group
      name="list-complete"
      :class="{ hide: !show }"
      class="members"
      tag="div"
    >
      <card
        v-bind:ref="'cards'"
        v-for="(card, i) in cards"
        class="member list-complete-item"
        v-bind:card="card"
        v-bind:key="card._id"
        v-bind:class="{ graduate: card.isGraduate }"
        v-on:click.native="flip(i)"
      >
      </card>
    </transition-group>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";

.memberlist {
  margin-top: 20px;
  .topmenu {
    display: flex;
    justify-content: space-between;
    margin: 0 20px;
    align-content: center;
    .totalmember {
      text-align: center;
    }
    .scrolltoggle {
      display: flex;
      justify-content: center;
      align-content: center;
      label {
        align-self: center;
      }
      input {
        margin: 4px;
        align-self: center;
      }
    }
  }

  .list-complete-item {
    transition: all 1s;
    display: inline-block;
  }

  .list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
  .list-complete-leave-active {
    position: absolute;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .swal2-title {
    color: $textcolorutama;
  }

  .swal2-content {
    color: $textcolorutama !important;
  }

  * {
    color: $bg-color;
  }

  // margin: auto;

  .members {
    margin-bottom: 30px;
    margin-top: 15px;
    margin-right: 0;
    margin-left: 0;
    width: 100%;
    display: grid;
    color: #d4d5d6;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    @include for("500px") {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
    grid-column-gap: 15px;
    grid-row-gap: 40px;

    transition: 0.6s;
    &.hide {
      transition: 0.5s;

      transform: translateY(80px);
      opacity: 0;
    }
  }
}
</style>

<script>
import card from "~/components/ngidol/card.vue";

export default {
  components: {
    card
  },
  layout: "idol48",
  head() {
    return {
      title: "Member List | Satan Discord",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List member JKT48!"
        }
      ],
      script: [
        {
          src:
            "https://cdn.jsdelivr.net/npm/sweetalert2@10.16.7/dist/sweetalert2.all.min.js"
        }
      ]
    };
  },
  data: function() {
    return {
      stage48: "http://stage48.net",
      cards: [],
      isScroll: false,
      show: false,
      members: [],
      enable_scroll: true
    };
  },
  watch: {
    enable_scroll(val, oldval) {
      this.$cookiz.set("enable_scroll", val, {
        path: "/",
        maxAge: 3600 * 24 * 30 * 12 * 10,
        sameSite: true
      });
    }
  },
  async asyncData({ $axios, $cookiz }) {
    let { data } = await $axios.get("/api/members/jkt48.json");
    let cards = [];

    data = data.filter(d => !d.isGraduate);

    let enable_scroll = $cookiz.get("enable_scroll");

    if (enable_scroll == null) enable_scroll = true;

    data.forEach(item => {
      cards.push({
        _id: item._id,
        isGraduate: item.isGraduate,
        first: item,
        flipable: true,
        isFront: false
      });
    });

    return {
      members: data,
      cards: cards,
      enable_scroll: enable_scroll
    };
  },
  beforeMount() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    flip: function(id) {
      if (this.$refs.cards[id]) this.$refs.cards[id].flip();
    },
    front: function(id) {
      if (this.$refs.cards[id]) this.$refs.cards[id].front();
    },
    isAdmin: function() {
      if (this.user && this.user.id == "336223763953614859") {
        return true;
      }
      return false;
    },
    toggleGraduate(member) {
      Swal.queue([
        {
          title: member.name,
          background: "#36393f",
          icon: "warning",
          text: "Ganti ke " + (member.isGraduate ? "Aktif?" : "Graduate?"),
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ganti!",
          showLoaderOnConfirm: true,
          preConfirm: () => {
            return new Promise((resolve, reject) => {
              let ctx = this;
              this.$axios
                .post("/members/setgraduate/", { id: member._id })
                .catch(({ response: e }) => {
                  resolve(
                    Swal.insertQueueStep({
                      icon: "error",
                      background: "#36393f",
                      title: e.data,
                      showConfirmButton: false,
                      timer: 1500
                    })
                  );
                  ctx.$nuxt.refresh();
                })
                .then(({ data: res }) => {
                  member.isGraduate = !member.isGraduate;
                  resolve(
                    Swal.insertQueueStep({
                      icon: "success",
                      background: "#36393f",
                      title: "Berhasil!",
                      showConfirmButton: false,
                      timer: 1500
                    })
                  );
                  ctx.$nuxt.refresh();
                });
            });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }
      ]);
    },
    editMember(id) {},
    handleScroll: function() {
      let ctx = this;
      this.isScroll = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(function() {
        ctx.isScroll = false;
      }, 100);
    }
  },
  mounted: async function() {
    let sleep = s => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, s);
      });
    };
    this.show = true;

    // if (!this.enable_scroll) return;

    await sleep(1000);
    let cards = this.$refs.cards;
    if (cards) {
      for (let c of cards) {
        if (!c.isFront) {
          await sleep(400);
          c.front();
          if (!this.enable_scroll) continue;
          if (!this.isScroll)
            c.$el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      await sleep(1200);
      if (!this.isScroll && cards[0] && this.enable_scroll)
        cards[0].$el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};
</script>
