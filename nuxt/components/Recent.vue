<template>
  <div class="recent-item">
    <div class="top">
      <div class="image">
        <div class="action"></div>
        <div class="container">
          <img v-bind:data-src="data.room_info.img" alt="" v-lazy-load />
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
  position: relative;

  .top {
    display: flex;

    .image {
      width: 250px;
      border-radius: 10px;
      overflow: hidden;
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
        }
      }
    }
  }

  .down {
    margin-top: 10px;
    .date {
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
