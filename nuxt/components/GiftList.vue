<template>
  <div class="gift">
    <div class="user">
      <div ref="avatar" @click="showUserDetail" class="avatar">
        <img
          v-bind:data-src="
            $parent.$parent.$parent.getAvatar(user_data.avatar_id)
          "
          v-lazy-load
        />
      </div>
    </div>
    <div class="detail">
      <div class="username">
        {{ user_data.name }}
      </div>
      <div class="usergiftlist">
        <div v-if="user_data" class="list">
          <div
            v-for="hadiah in gifts"
            v-bind:key="hadiah._id ? hadiah._id : hadiah.gift_id"
            class="detailhadiah"
          >
            <div class="giftimage">
              <img v-bind:data-src="hadiah.image" v-lazy-load />
              <div class="harga">{{ toRupiah(hadiah.point) }}</div>
            </div>

            <div class="num"><span>x</span>{{ hadiah.num }}</div>
          </div>
        </div>
        <div class="total"><span>Total : </span>{{ toRupiah(total) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
// import moment from "moment";
// moment.locale("id");
export default {
  // components: true,
  props: {
    index: {
      // index of current item
      type: Number
    },
    source: {
      // here is: {uid: 'unique_1', text: 'abc'}
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    jpnrate() {
      return this.$parent.$parent.$parent.jpnrate;
    }
  },
  methods: {
    showUserDetail(e) {
      let avaDiv = this.$refs.avatar;
      let rect = this.$parent.$parent.$parent.$refs.giftDiv.getBoundingClientRect();
      this.$parent.$parent.$parent.showUserDetail(
        this.user_data.user_id,
        e.clientX - rect.left,
        e.clientY + window.scrollY - avaDiv.offsetHeight
      );
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
    }
  },
  data() {
    return {
      user_data: this.source.user_data,
      gifts: this.source.gifts,
      total: this.source.total
        ? this.source.total
        : this.source.point
        ? this.source.point
        : 0
    };
  },
  mounted() {
    // console.log(this.$parent.$parent);
  }
  //   computed: {
  //     user: function() {
  //       return this.$store.getters.getUser;
  //     },
  //   },
};
</script>
