<template>
  <div class="srLog">
    <div class="top">
      <div class="image">
        <img v-bind:data-src="log.room_info.img" v-lazy-load />
      </div>
      <div class="description">
        <div class="info">
          <div class="nama">
            <a v-bind:href="'https://showroom-live.com' + log.room_info.url">{{
              log.room_info.nama
            }}</a>
          </div>
          <div class="gifttotal">
            <span>Total Gifts :</span>{{ $parent.toRupiah(log.total_point) }}
          </div>
        </div>
        <div class="action">
          <!-- <a
            v-bind:href="
              'https://www.showroom-live.com/room/profile?room_id=' +
                log.room_info.id
            "
            target="_blank"
            ><i title="User Room" class="fas fa-user"></i
          ></a> -->

          <div v-if="$parent.isAdmin" class="admin">
            <i v-on:click="deleteLog" class="fas fa-trash" />
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div
        v-bind:title="$parent.time(log.live_info.end_date)"
        v-if="log.live_info && log.live_info.end_date"
        class="waktu"
      >
        Selesai {{ relativeTime }}
      </div>
      <div class="detail">
        <NuxtLink target="_blank" v-bind:to="'/showroom/log/' + log.data_id">
          Detail Page
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
moment.locale("id");
export default {
  // components: true,
  props: ["log"],
  data() {
    return {
      jpnRate: 135.79,
      date: new Date(),
    };
  },
  computed: {
    user: function() {
      return this.$store.getters.getUser;
    },
    relativeTime: function() {
      return moment(this.log.live_info.end_date).from(this.date);
    },
  },
  mounted() {
    this.timer = setInterval(this.updateTime, 60000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    updateTime() {
      this.date = new Date();
    },
    deleteLog() {
      let root = this.$parent;
      let timetext = root.relativeTime(this.log.live_info.end_date);

      Swal.queue([
        {
          title: this.log.room_info.nama,
          background: "#36393f",
          icon: "warning",
          text: timetext + ", Delete ke log ini!",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Delete!",
          showLoaderOnConfirm: true,
          preConfirm: () => {
            return new Promise((resolve, reject) => {
              this.$axios
                .post("deleteshowroomlog", { data_id: this.log._id })
                .catch(({ response: e }) => {
                  resolve(
                    Swal.insertQueueStep({
                      icon: "error",
                      background: "#36393f",
                      title: e.data,
                      showConfirmButton: false,
                      timer: 1500,
                    })
                  );
                })
                .then(({ data: res }) => {
                  // console.log(this.$parent.songs);
                  root.logs = root.logs.filter((item) => {
                    return item._id !== this.log._id;
                  });
                  // root.songsTemp = root.songs;
                  resolve(
                    Swal.insertQueueStep({
                      icon: "success",
                      title: this.log.room_info.nama,
                      background: "#36393f",
                      text: timetext + "\n telah berhasil di delete!",
                      showConfirmButton: false,
                      timer: 1500,
                    })
                  );
                });
            });
          },
          allowOutsideClick: () => !Swal.isLoading(),
        },
      ]);
    },
  },
};
</script>
