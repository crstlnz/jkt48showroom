<template>
  <div
    class="card"
    v-bind:class="{
      back: !card.isFront,
      flipable: card.flipable
    }"
  >
    <div
      class="card-inner"
      v-bind:title="
        card.isFront
          ? card.first
            ? card.first.name
            : ''
          : card.second
          ? card.second.name
          : ''
      "
    >
      <div class="side depan">
        <div class="wrap">
          <div v-if="!card.first" class="nocard">
            <!-- <img data-src="~/assets/img/jkt48pt.png" alt="" v-lazy-load /> -->
          </div>
          <div v-else class="hascard">
            <div class="gambar">
              <img v-bind:data-src="card.first.img" alt="" v-lazy-load />
            </div>
            <div class="title">
              <div class="wraptext">{{ card.first.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side belakang">
        <div class="wrap">
          <div v-if="!card.second" class="nocard"></div>
          <div v-else class="hascard">
            <div class="gambar">
              <img v-bind:data-src="card.second.img" alt="" v-lazy-load />
            </div>
            <div class="title">
              <div class="wraptext">{{ card.second.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";

.card {
  img {
    &.isLoaded {
      opacity: 1;
    }
    opacity: 0;
    transition: 0.6s;
  }

  -webkit-tap-highlight-color: transparent;
  &.flipable {
    cursor: pointer;
  }
  user-select: none;
  // height: 310px;
  padding-top: 146%;
  width: 100%;
  margin: auto;
  position: relative;
  perspective: 1000px;
  background-color: transparent;
  position: relative;

  // @include for("678px") {
  //   height: 232.5px;
  //   width: 150px;
  // }

  .card-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 3px;
    background: white;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);

    .side {
      padding: 14px;
      @include for("678px") {
        padding: 10px;
      }
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 3px;
      background: white;
      &.belakang {
        transform: rotateY(180deg);
      }

      .wrap {
        position: relative;
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;

        .nocard {
          border-radius: 3px;
          position: absolute;
          // background-image: url("~assets/img/jkt48pt.png");
          background-image: url("/img/jkt48pt.png");
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          overflow: hidden;
          img {
            width: 100%;
          }
        }

        .hascard {
          height: 100%;
          display: flex;
          flex-direction: column;
          // justify-content: center;
          // align-items: center;
          .gambar {
            margin-bottom: 14px;
            @include for("678px") {
              margin-bottom: 10px;
            }
            // background: black;
            height: 80%;
            border-radius: 3px;

            // padding-top: 155%;
            overflow: hidden;
            // @include for("678px") {
            //   height: 160px;
            // }
            img {
              // position: absolute;
              // top: 0;
              // left: 0;
              pointer-events: none;
              width: 100%;
              border-radius: 3px;
            }
          }
          .title {
            overflow: hidden;
            .wraptext {
              @include for("678px") {
                font-size: 14px;
              }
              @include for("500px") {
                font-size: 13px;
              }
              @include for("400px") {
                font-size: 12px;
              }
              @include for("300px") {
                font-size: 11px;
              }
              user-select: none;
              color: $bg-color;
              font-weight: bold;
              font-size: 18px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            width: 100%;

            // white-space: nowrap;
            // display: flex;
            margin: auto;
          }
        }
      }
    }
  }

  &.back {
    .card-inner {
      transform: rotateY(180deg);
    }
  }
}
</style>

<script>
export default {
  props: ["card"],
  // mounted: function() {
  //   setTimeout(() => {
  //     this.flip();
  //     this.$el.scrollIntoView({ behavior: "smooth", block: "center" });
  //   }, 1200);
  // },
  methods: {
    flip: function() {
      if (!this.card.flipable) return;
      this.card.isFront = !this.card.isFront;
      this.card.flipable = false;
      setTimeout(() => {
        this.card.flipable = true;
      }, 500);
    },
    front: function() {
      if (!this.card.flipable || this.card.isFront) return;
      this.card.isFront = true;
      this.card.flipable = false;
      setTimeout(() => {
        this.card.flipable = true;
      }, 500);
    },
    change(data) {
      if (this.card.isFront) {
        this.card.second = data;
        // this.card.isFront = false;
      } else {
        this.card.first = data;
        // this.card.isFront = true;
      }
    }
  }
};
</script>
