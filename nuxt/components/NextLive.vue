<template>
  <div class="nextlive-item showroom-card">
    <img v-bind:data-src="data.img" alt="" v-lazy-load />
    <div class="gradient"></div>
    <div class="information">
      <div class="date">
        {{ date_live }}
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

<style lang="scss"></style>

<script>
export default {
  props: ["data"],
  computed: {
    date_live() {
      let now = new Date();
      let date = new Date(this.data.epoch * 1000);
      if (
        now.getDate() == date.getDate() &&
        now.getMonth() == date.getMonth() &&
        now.getFullYear() == date.getFullYear()
      ) {
        return `${date.getHours()}:${this.pad(date.getMinutes())}~`;
      }

      return `${date.getDate()}/${date.getMonth() +
        1} ${date.getHours()}:${this.pad(date.getMinutes())}~`;
    }
  },
  methods: {
    pad(num) {
      return ("00" + num).slice(-2);
    }
  }
};
</script>
