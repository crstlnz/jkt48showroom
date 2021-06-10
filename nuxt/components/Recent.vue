<template>
  <div class="recent-item">
    <div class="top">
      <div class="image">
        <div class="container">
          <img v-bind:data-src="data.room_info.img" alt="" v-lazy-load />
        </div>
        <div class="action">
          <NuxtLink class="button" :to="`/log/${data.data_id}`">
            <div class="icon"><i class="fas fa-info-circle"></i></div>
            <div class="text">Detail</div>
          </NuxtLink>
        </div>
      </div>
      <div class="information">
        <div class="title">
          {{ data.room_info.name }}
        </div>
        <div class="detail">
          <div class="totalgifts">
            <span class="title-gifts">
              Total Gifts :
            </span>
            {{ convertRupiah(data.total_point) }}
          </div>
        </div>
      </div>
    </div>
    <div class="down">
      <div class="date">
        {{ relativeTime(data.live_info.end_date) }}
      </div>
      <div class="detail">
        <NuxtLink class="button" :to="`/log/${data.data_id}`">Detail</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";
.recent-item {
  background: lighten($color3, 0%);
  -moz-box-shadow: 0 1px 2px rgb(0 0 0 / 40%);
  -webkit-box-shadow: 0 1px 2px rgb(0 0 0 / 40%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(0 0 0 / 40%);
  padding: 10px;
  @include for("500px") {
    padding: 8px;
  }
  position: relative;

  .top {
    display: flex;

    .image {
      width: 250px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      @include for("600px") {
        width: 200px;
      }

      @include for("500px") {
        width: 150px;
      }
      @include for("400px") {
        width: 120px;
      }

      .action {
        position: absolute;
        opacity: 0;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        transition: 0.3s;
        display: flex;
        justify-content: center;
        align-items: center;
        a {
          color: inherit;
          text-decoration: none;
        }

        .button {
          cursor: pointer;
          &:hover {
            .text {
              text-decoration: underline;
            }
          }
          .icon {
            text-align: center;
          }
          .text {
            margin-top: 10px;
            text-align: center;
          }
        }

        i {
          font-size: 36px;
        }

        &:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.7);
        }
      }
      .container {
        width: 100%;
        position: relative;
        padding-top: 56.25%;
        img {
          display: inline-block;
          position: absolute;

          top: 0;
          left: 0;
          width: 100%;
          margin: 0;
          padding: 0;
        }
      }
    }

    .information {
      flex: 1;
      margin-left: 10px;
      display: flex;
      flex-direction: column;
      .title {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        font-size: 22px;
        font-weight: bold;
        @include for("600px") {
          font-size: 18px;
        }

        @include for("500px") {
          font-size: 16px;
        }

        @include for("400px") {
          font-size: 14px;
        }
      }

      .detail {
        flex: 1;
        display: flex;
        flex-direction: column-reverse;

        .totalgifts {
          margin-left: 10px;
          position: relative;
          span {
            top: -20px;
            left: -10px;
            font-size: 12px;
            font-weight: bold;
            position: absolute;
          }
          font-size: 18px;
          font-weight: bold;
          @include for("600px") {
            span {
              font-size: 11px;
            }
            font-size: 16px;
          }

          @include for("500px") {
            span {
              font-size: 10px;
            }
            font-size: 14px;
          }

          @include for("400px") {
            span {
              font-size: 9px;
            }
            font-size: 12px;
          }
        }
      }
    }
  }

  .down {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .date {
      @include for("600px") {
        font-size: 14px;
      }

      @include for("500px") {
        font-size: 13px;
      }
      @include for("400px") {
        font-size: 12px;
      }
    }

    .detail {
      a {
        color: inherit;
        font-size: 18px;
        font-weight: bold;
        text-decoration: none;
        @include for("600px") {
          font-size: 16px;
        }

        @include for("500px") {
          font-size: 15px;
        }
        @include for("400px") {
          font-size: 13.5px;
        }
      }
    }
  }
}
</style>

<script>
export default {
  props: ["data"],
  computed: {
    date_live() {
      let date = new Date(this.data.start_date * 1000);
      return `${date.getHours()}:${this.pad(date.getMinutes())}~`;
    }
  },
  methods: {
    relativeTime: function(timestamps) {
      let str = this.$parent.relativeTime(timestamps);
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    pad(num) {
      return ("00" + num).slice(-2);
    },
    convertRupiah(num) {
      return this.$parent.convertRupiah(num);
    }
  }
};
</script>
