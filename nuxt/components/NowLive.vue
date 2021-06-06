<template>
  <div class="nowlive-item">
    <img v-bind:data-src="data.img" alt="" v-lazy-load />
    <div class="gradient"></div>
    <div class="information">
      <div class="live_info">
        <div class="date">
          {{ date_live }}
        </div>
        <div class="livenow">
          Live!
        </div>
      </div>
      <div class="title">
        {{ data.name }}
      </div>
    </div>
    <div class="action">
      <div class="container">
        <a
          :href="`https://www.showroom-live.com${data.url}`"
          target="_blank"
          class="room button"
        >
          <i class="fas fa-person-booth"></i>
          <div class="text">Enter Room</div>
        </a>
        <a
          target="_blank"
          :href="
            `https://www.showroom-live.com/room/profile?room_id=${data.room_id}`
          "
          class="profile button"
        >
          <i class="fas fa-user"></i>
          <div class="text">Profile</div>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.nowlive-item {
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  padding-top: 56.25%;

  img {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .gradient {
    position: absolute;
    -moz-box-shadow: inset 0 -65px 38px -30px rgba(0, 0, 0, 0.7);
    -webkit-box-shadow: inset 0 -65px 38px -30px rgba(0, 0, 0, 0.7);
    box-shadow: inset 0 -65px 38px -30px rgba(0, 0, 0, 0.7);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .information {
    color: white;
    padding-left: 10px;
    position: absolute;
    bottom: 0;
    .title {
      font-weight: bold;
    }

    .live_info {
      div {
        display: inline-block;
      }

      .livenow {
        background: rgba(0, 0, 0, 0.5);
        margin-bottom: 2px;
        display: inline-block;
        margin-right: 5px;
        border-radius: 4px;
        padding: 0 4px;
        font-weight: bold;
        font-size: 12px;
        line-height: 18px;
        height: 18px;
        box-sizing: border-box;
      }
      .date {
        margin-bottom: 2px;
        display: inline-block;
        background: rgba(255, 1, 1, 0.7);
        margin-right: 5px;
        border-radius: 4px;
        padding: 0 4px;
        font-weight: bold;
        font-size: 12px;
        line-height: 18px;
        height: 18px;
        letter-spacing: 1.8px;
        box-sizing: border-box;
      }
    }
  }

  .action {
    .container {
      height: 100%;
      width: 60%;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: space-evenly;

      a {
        text-decoration: none;
        &.button {
          transition: 0.3s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          font-size: 42px;
          &:hover {
            .text {
              text-decoration: underline;
            }
          }
          .text {
            margin-top: 5px;
            font-size: 14px;
            text-align: center;
          }
        }
      }
    }

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.7);
    }
    transition: 0.3s;
    opacity: 0;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
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
    pad(num) {
      return ("00" + num).slice(-2);
    }
  }
};
</script>
