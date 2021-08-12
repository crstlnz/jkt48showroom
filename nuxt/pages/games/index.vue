<template>
  <div class="mainmenu">
    <div class="volumebutton" v-on:click="toggleVolume">
      <i v-if="!volumeOn" class="fas fa-volume-mute volumeoff"></i>
      <i v-if="volumeOn" class="fas fa-volume-up volumeon"></i>
    </div>
    <div :class="{ hide: result.length }" id="game" class="game">
      <div v-if="is_loading" class="loading">
        <div class="title">Loading</div>
        <div class="progressbar">
          <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div v-else class="gamecontainer">
        <div class="box versus">
          <card
            ref="card1"
            v-on:click.native="game.choose(0)"
            v-bind:card="cards[0]"
          />
          <div class="vs">VS</div>
          <card
            ref="card2"
            v-on:click.native="game.choose(1)"
            v-bind:card="cards[1]"
          />
        </div>
        <div class="versusbutton">
          <button
            :disabled="!game.started"
            v-on:click="game.choose(2)"
            class="startgame button"
          >
            Tie
          </button>
          <button
            :disabled="!game.started || !game.haveUndo"
            v-on:click="game.undo()"
            class="startgame button"
          >
            Undo
          </button>
        </div>
        <div class="startversus">
          <button
            :disabled="!game.isReady || game.started"
            v-on:click="startGame"
            class="startgame button"
          >
            Start
          </button>
        </div>
      </div>
    </div>

    <div class="result" id="result" :class="{ show: result.length }">
      <div ref="rank" id="rank" class="title">Ranks</div>
      <button v-on:click="game.restart()" class="startgame button">
        Play Again
      </button>
      <transition-group
        name="list-complete"
        class="members"
        tag="div"
        id="members"
      >
        <div
          class="rankdiv list-complete-item"
          v-for="(card, i) in result"
          v-bind:key="card._id"
        >
          <card
            v-bind:ref="'cards'"
            class="member"
            v-bind:card="card"
            v-bind:class="{ graduate: card.isGraduate }"
            v-on:click.native="$refs.cards[i].flip"
          />
          <div class="rank">
            {{ card.rank }}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";

.wrapper48 {
  * {
    color: $bg-color;
    box-sizing: border-box;
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
  .mainmenu {
    .volumebutton {
      user-select: none;
      padding: 5px;
      cursor: pointer;
      .volumeoff {
        color: lighten($bg-color, 50%);
      }
      position: absolute;
      font-size: 25px;
      left: 15px;
      top: 15px;
    }
    .button {
      font-weight: bold;
      user-select: none;
      cursor: pointer;
      border-radius: 5px;
      background: white;
      display: inline-block;
      padding: 15px 40px 15px 40px;
      transition: 0.3s;
      border: 2px solid transparent;
      box-shadow: 0px 2px 10px rgb(0 0 0 / 20%);
      &:not(:enabled) {
        background: rgb(224, 224, 224);
      }

      &:hover:enabled {
        transition: 0.3s;
        border: 2px solid black;
      }

      &:active:enabled {
        background: rgb(240, 240, 240);
        transform: scale(0.8);
      }
    }
    img {
      &.isLoaded {
        opacity: 1;
      }
      opacity: 0;
      transition: 0.6s;
    }

    width: 100%;

    .game {
      .loading {
        padding: 20px;
        .title {
          font-size: 32px;
          font-weight: bold;
          text-align: center;
        }
        .progressbar {
          height: 10px;
          border-radius: 10px;
          margin-top: 20px;
          transition: 0.5s;
          border: 1px solid black;
          overflow: hidden;
          .fill {
            height: 10px;
            background-color: $bg-color;
          }
        }
      }
      .gamecontainer {
        // margin-top: 30px;
        // margin-bottom: 20px;

        .startversus {
          padding-top: 20px;
          text-align: center;
        }

        .versusbutton {
          text-align: center;
        }

        .box {
          padding-top: 25px;
          padding-bottom: 10px;
          margin-bottom: 20px;
          .vs {
            font-weight: bold;
            font-size: 18px;
            align-self: flex-end;
            padding-bottom: 40px;
          }
          display: grid;
          grid-template-columns: minmax(120px, 250px) minmax(30px, 80px) minmax(
              120px,
              250px
            );
          gap: 10px;
          align-content: center;
          justify-content: center;
          justify-items: center;

          @include for("678px") {
            width: 80%;
            flex-direction: column;
            margin: auto;
            margin-bottom: 20px;
            .vs {
              align-self: center;
              padding-top: 20px;
              padding-bottom: 20px;
            }
          }

          // .card {
          //   &:not(:last-child) {
          //     margin-bottom: 20px;
          //   }
          // }
        }

        transition: all 1s;
        overflow: hidden;
      }
      &.hide {
        opacity: 0;
        height: 0 !important;
        margin: 0;
      }
      transition: all 1s;
      overflow: hidden;
    }

    .result {
      opacity: 0;
      height: 0;

      transition: all 1s;
      overflow: hidden;

      &.show {
        opacity: 1;
        height: auto;
      }

      .list-complete-item {
        // transition: 1s;
        transition: all 1s linear;

        display: inline-block;
        margin-right: 10px;
      }

      .list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateY(30px);
      }

      .list-complete-leave-active {
        position: absolute;
        width: 120px;
      }

      margin-top: 20px;
      text-align: center;
      .title {
        font-weight: bold;
        font-size: 24px;
      }

      button {
        margin-top: 20px;
      }
      .members {
        margin: 30px;
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

        .rankdiv {
          .rank {
            margin: 15px;
            font-weight: bold;
            font-size: 18px;
          }
        }
      }
    }
  }
}
</style>

<script>
import pop from "~/assets/audio/pop.wav";
import startSound from "~/assets/audio/start.wav";
import card from "~/components/ngidol/card.vue";

export default {
  layout: "idol48",
  components: {
    card
  },
  head() {
    return {
      title: "Oshi Calculator | Satan Discord",
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
        // {
        //   src: "/socket.io/socket.io.js",
        // },
      ]
    };
  },
  watch: {
    volumeOn: function(val, oldval) {
      if (val) {
        this.playSound(pop);
      }
      this.$cookiz.set("volumeOn", val, {
        path: "/",
        maxAge: 3600 * 24 * 30 * 12 * 10,
        sameSite: true
      });
    }
  },
  data: function() {
    return {
      hide: false,
      ranks: false,
      stage48: "http://stage48.net",
      isFront: true,
      result: [],
      playSound(sound) {
        if (this.volumeOn)
          if (sound) {
            let s = new Audio(sound);
            s.volume = 0.5;
            s.play();
          }
      },
      is_loading: true,
      progress: 0,
      game: {
        playSound(sound) {
          if (this.ctx.volumeOn)
            if (sound) {
              let s = new Audio(sound);
              s.volume = 0.5;
              s.play();
            }
        },
        started: false,
        flipable: false,
        ranks: [],
        temp: [],
        rankdeep: 0, // udah urut rank berapa kali
        get nextrank() {
          return this.rankdeep + 1;
        },
        compare: {
          one: [],
          two: [],
          l: 0
        },
        change: this.change,
        ctx: this,
        get isReady() {
          if (!this.ctx.members) return false;
          return true;
        },
        finish: async function() {
          this.started = false;
          this.temp = [];
          this.ctx.change("card1", null);
          this.ctx.change("card2", null);
          // this.ctx.$nextTick(() => {
          //   document
          //     .getElementById("result")
          //     .scrollIntoView({ behavior: "smooth", block: "start" });
          // });
          this.playSound(startSound);

          // try {
          //   let ele = document.getElementById("rank");
          //   console.log(ele);
          //   if (this.ctx.$refs.rank) console.log(this.ctx.$refs.rank);
          // } catch (e) {
          //   console.log(e);
          // }

          let rank = this.compare.one;
          let result = [];
          let pos = 1;
          for (let r of rank) {
            if (Array.isArray(r)) {
              let p = pos;
              for (let z of r) {
                result.push({ member: z, rank: p });
                pos++;
              }
            } else {
              result.push({ member: r, rank: pos });
              pos++;
            }
          }

          let sleep = s => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve();
              }, s);
            });
          };

          this.ctx.result = [];

          for (let r of result) {
            if (!this.started) {
              this.ctx.result.push({
                _id: r.member._id,
                rank: r.rank,
                first: r.member,
                flipable: true,
                isFront: true
              });
              await sleep(300);
            }
          }
        },
        restart() {
          // console.log(this);
          this.ctx.result.length = 0;
          console.log(this.ctx.result);
          this.start();
        },
        start() {
          if (this.started) return;
          this.playSound(startSound);

          this.temp = [];
          this.started = true;
          let arr = [];
          for (let m of this.ctx.members) {
            arr.push([m]);
          }
          this.ranks = [];
          this.rankdeep = 0;
          this.compare.l = 0;
          this.ranks[0] = [...arr];
          this.ctx.shuffleArray(this.ranks[0]);

          this.fillCompare();
          this.checkCard();
        },
        get haveUndo() {
          if (this.temp && this.temp[this.temp.length - 1]) {
            return true;
          }
          return false;
        },
        undo() {
          if (!this.flipable || !this.started) return;
          this.flipable = false;
          setTimeout(() => {
            this.flipable = true;
            // this.preLoad();
          }, 250);
          if (this.temp && this.temp[this.temp.length - 1]) {
            this.playSound(pop);

            let data = this.temp.pop();
            this.compare = JSON.parse(JSON.stringify(data.compare));
            this.ranks = JSON.parse(JSON.stringify(data.ranks));
            this.rankdeep = data.rankdeep;

            this.checkCard();
          }
        },
        setTemp() {
          console.log(this.compare);
          if (!this.temp) this.temp = [];
          this.temp.push({
            compare: JSON.parse(JSON.stringify(this.compare)),
            ranks: JSON.parse(JSON.stringify(this.ranks)),
            rankdeep: this.rankdeep
          });
        },
        checkCard: function() {
          let ctx = this.ctx;
          if (ctx.$refs["card1"]) {
            let c = Array.isArray(this.compare.one[0])
              ? this.compare.one[0][
                  Math.floor(Math.random() * this.compare.one.length)
                ]
              : this.compare.one[0];

            if (ctx.$refs["card1"].card.isFront) {
              if (
                !ctx.$refs["card1"].card.first ||
                ctx.$refs["card1"].card.first._id != c._id
              ) {
                ctx.change("card1", c);
              }
            } else {
              if (
                !ctx.$refs["card1"].card.second ||
                ctx.$refs["card1"].card.second._id != c._id
              ) {
                ctx.change("card1", c);
              }
            }
          }

          if (ctx.$refs["card2"]) {
            let d = Array.isArray(this.compare.two[0])
              ? this.compare.two[0][
                  Math.floor(Math.random() * this.compare.one.length)
                ]
              : this.compare.two[0];

            if (ctx.$refs["card2"].card.isFront) {
              if (
                !ctx.$refs["card2"].card.first ||
                ctx.$refs["card2"].card.first._id != d._id
              ) {
                ctx.change("card2", d);
              }
            } else {
              if (
                !ctx.$refs["card2"].card.second ||
                ctx.$refs["card2"].card.second._id != d._id
              ) {
                ctx.change("card2", d);
              }
            }
          }

          this.flipable = false;
          setTimeout(() => {
            this.flipable = true;
            // this.preLoad();
          }, 400);
        },
        // preLoad() {
        //   let ctx = this.ctx;
        //   if (ctx.$refs["card1"]) {
        //     if (this.compare.one[1])
        //       ctx.$refs["card1"].second = this.compare.one[1];
        //   }

        //   if (ctx.$refs["card2"]) {
        //     if (this.compare.two[1])
        //       ctx.$refs["card2"].second = this.compare.two[1];
        //   }
        // },
        choose: function(no) {
          if (!this.started || !this.flipable) return;
          this.setTemp();
          this.playSound(pop);

          let l = this.compare.l;

          if (!this.ranks[this.nextrank]) this.ranks[this.nextrank] = [];
          if (!this.ranks[this.nextrank][l]) this.ranks[this.nextrank][l] = [];

          switch (no) {
            case 0:
              console.log(`Memilih ${this.compare.one[0].name}!`);
              this.ranks[this.nextrank][l].push(this.compare.one[0]);
              this.compare.one.shift();
              break;
            case 1:
              console.log(`Memilih ${this.compare.two[0].name}!`);
              this.ranks[this.nextrank][l].push(this.compare.two[0]);
              this.compare.two.shift();
              break;
            default:
              let newarr = [];

              Array.isArray(this.compare.one[0])
                ? newarr.push(...this.compare.one[0])
                : newarr.push(this.compare.one[0]);
              this.compare.one.shift();

              Array.isArray(this.compare.two[0])
                ? newarr.push(...this.compare.two[0])
                : newarr.push(this.compare.two[0]);
              this.compare.two.shift();

              this.ranks[this.rankdeep + 1][l].push(newarr);
              console.log(`${newarr.map(i => i.name).join(", ")} draw!`);
              break;
          }

          if (this.checkEmpty()) {
            this.compare.l++;
            this.fillCompare();
            // if (this.fillCompare()) {
            //   console.log(this.compare);
            //   return this.checkCard();
            // }
          }

          if (this.started) return this.checkCard();
        },
        async fillCompare() {
          if (this.ranks[this.rankdeep] || !this.ranks[this.rankdeep].length) {
            if (this.ranks[this.rankdeep][0]) {
              this.compare.one = [...this.ranks[this.rankdeep].shift()];
              if (this.ranks[this.rankdeep][0]) {
                this.compare.two = [...this.ranks[this.rankdeep].shift()];
              } else {
                if (this.ranks[this.nextrank] && this.ranks[this.nextrank][0]) {
                  this.compare.two = [...this.ranks[this.nextrank][0]];
                  this.ranks[this.nextrank][0] = [];
                  this.compare.l = 0;
                  return true;
                } else {
                  // selesai
                  // console.log("selesai");
                  this.started = false;

                  this.finish();
                  // console.log(
                  //   this.compare.one.map((i) =>
                  //     Array.isArray(i)
                  //       ? `[${i.map((s) => s.name).join(", ")}]`
                  //       : i.name
                  //   )
                  // );

                  return false;
                }
              }

              return true;

              // console.log(this.compare);
            } else {
              // console.log("awwww");
              this.rankdeep++;
              this.compare.l = 0;
              // if (!this.ranks[this.rankdeep][0]) {
              //   console.log("selesai di satu lagi");
              //   this.finish();
              //   console.log(
              //     this.compare.one.map((i) =>
              //       Array.isArray(i)
              //         ? `[${i.map((s) => s.name).join(", ")}]`
              //         : i.name
              //     )
              //   );
              //   return;
              // }
              // console.log(this.compare);
              return this.fillCompare();
            }
          } else {
            // console.log("awshit");
            return false;
            console.log("wew");
            // console.log(this.ranks[this.rankdeep]);
            /// game selesai
          }
        },
        checkEmpty: function() {
          if (!this.compare.one.length || !this.compare.two.length) {
            let l = this.compare.l;

            if (!this.ranks[this.nextrank]) this.ranks[this.nextrank] = [];

            if (this.compare.one.length || this.compare.two.length) {
              if (!this.ranks[this.nextrank][l])
                this.ranks[this.nextrank][l] = [];
            }

            if (this.compare.one.length) {
              this.ranks[this.nextrank][l].push(...this.compare.one);
              this.compare.one = [];
            }

            if (this.compare.two.length) {
              this.ranks[this.nextrank][l].push(...this.compare.two);
              this.compare.two = [];
            }

            return true;
            // if (!this.compare.one.length) {
            //   if (this.compare.two.length) {
            //     this.ranks[this.nextrank][l].push(...this.compare.two);
            //     this.compare.two = [];
            //     this.compare.l++;
            //   }
            // } else {
            //   if (this.compare.two.length) {
            //     this.ranks[this.nextrank][l].push(...this.compare.two);
            //     this.compare.two = [];
            //   }
            //   this.ranks[this.nextrank][l].push(...this.compare.one);
            //   this.compare.one = [];
            //   this.compare.l++;
            // }
          } else {
            // this.checkCard();
            return false;
          }
        }
      }
    };
  },
  async asyncData({ $axios, $cookiz }) {
    let vol = $cookiz.get("volumeOn");
    let card = [
      {
        // first: data[0],
        // second: data[1],
        flipable: true,
        isFront: true,
        pointer: 2
      },
      {
        // first: data[0],
        // second: data[1],
        flipable: true,
        isFront: true,
        pointer: 2
      }
    ];
    try {
      let { data } = await $axios.get("/api/members/jkt48.json");
      data = data.filter(i => !i.isGraduate);
      // data = data.filter(i => !i.isGraduate).slice(0, 5);

      return {
        members: data,
        cards: card,
        volumeOn: vol ? true : false
      };
    } catch (e) {
      console.log(e);

      return {
        cards: card,
        volumeOn: vol ? true : false
      };
    }
  },
  // async mounted() {
  //   for (let c of this.members) {
  //     new Image().src = c.img;
  //   }

  //   // let i = 0;
  //   // setTimeout(() => {
  //   //   setInterval(() => {
  //   //     this.change("card1", this.members[i]);
  //   //     i++;
  //   //     if (i > this.members.length - 1) i = 0;
  //   //   }, 100);
  //   // }, 1000);
  // },
  methods: {
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    startGame() {
      if (!this.started_before) {
        this.game.start();
        this.started_before = true;
      } else {
        this.game.restart();
      }
    },
    choose: function(no) {
      this.game.choose(no);
    },
    change: function(id, data) {
      if (this.$refs[id]) {
        this.$refs[id].change(data);
        this.$refs[id].card.isFront = !this.$refs[id].card.isFront;
      }
    },
    flip: function(id) {
      if (this.$refs[id]) this.$refs[id].flip();
    },
    toggleVolume() {
      this.volumeOn = !this.volumeOn;
    },
    toggleDiv() {
      this.hide = !this.hide;
    },
    toggleCard: function(card) {
      if (!card.flipable) return;
      card.isFront = !card.isFront;
      card.flipable = false;
      setTimeout(() => {
        if (card.isFront) {
          card.second = this.members[card.pointer];
          card.pointer++;
        } else {
          card.first = this.members[card.pointer];
          card.pointer++;
        }

        if (card.pointer > this.members.length - 1) card.pointer = 0;
        // card
        card.flipable = true;
      }, 500);
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
                  // console.log(this.$parent.songs);
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
    resizeHandler() {
      let gameDiv = document.getElementById("game");
      let hidden = false;
      if (gameDiv.classList.contains("hide")) hidden = true;
      if (hidden) gameDiv.classList.remove("hide");
      gameDiv.style.height = "auto";
      gameDiv.style.height = gameDiv.offsetHeight + "px";
      if (hidden) gameDiv.classList.add("hide");
    },
    editMember(id) {
      //   this.$axios
      //     .post("members/setgraduate/" + id)
      //     .then((res) => {})
      //     .catch((e) => {});
    }
  },
  async mounted() {
    if (!this.is_loading) {
      let gameDiv = document.getElementById("game");
      gameDiv.style.height = gameDiv.offsetHeight + "px";
      window.addEventListener("resize", this.resizeHandler);
    } else {
      console.log(this.members);
      this.loaded_image = 0;
      // for (let i = 0; i < this.members.length; i++) {
      //   let image = new Image();
      //   image.onload = () => {
      //     this.loaded_image++;
      //     this.progress = (this.loaded_image / this.members.length) * 100;
      //   };
      //   image.src = this.members[i].img;
      //   console.log(this.members[i].img);
      // }

      function loadImage(url) {
        return new Promise((resolve, reject) => {
          let image = new Image();
          image.onload = () => {
            resolve();
          };
          image.src = url;
        });
      }

      for (let member of this.members) {
        await loadImage(member.img);
        this.loaded_image++;
        this.progress = (this.loaded_image / this.members.length) * 100;
        console.log(member.img);
      }
      this.is_loading = false;
      // this.is_loading = false;
      this.$nextTick(() => {
        let gameDiv = document.getElementById("game");
        gameDiv.style.height = gameDiv.offsetHeight + "px";
        window.addEventListener("resize", this.resizeHandler);
      });
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  }
};
</script>
