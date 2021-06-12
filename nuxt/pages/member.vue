<template>
  <div class="member-list">
    <div class="member-header">List Showroom JKT48</div>
    <div class="member-container">
      <div v-if="error" class="error">Sepertinya telah terjadi error :(</div>
      <div v-else-if="!members || !members.length" class="error kosong">
        Sepertinya tidak ada data tersedia :(
      </div>

      <div v-else class="member-list">
        <MemberList
          class="item"
          v-for="member of members"
          :key="member.room_id"
          :member="member"
        >
        </MemberList>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";
@import "~assets/showroom-card.scss";
.member-list {
  .member-header {
    color: #d4d4d4;
    font-weight: bold;
    font-size: 38px;
    text-align: center;
    margin-bottom: 30px;
    margin-top: 20px;
    @include for("768px") {
      margin-bottom: 25px;
      margin-top: 15px;
      font-size: 30px;
    }
    @include for("500px") {
      font-size: 25px;
      margin-bottom: 20px;
      margin-top: 10px;
    }
  }

  .member-container {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    .error {
      margin: 30px;
      color: $text;
      font-size: large;
      text-align: center;
    }

    .member-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      @include for("768px") {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      gap: 20px;
    }
  }
}
</style>

<script>
import moment from "moment";
moment.locale("id");

export default {
  layout: "48template",
  head: {
    title: "List Showroom | JKT48 Showroom Log",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "List Showroom Member JKT48!"
      }
    ]
  },
  data() {
    return {
      error: false,
      loading: true
    };
  },
  async asyncData({ $axios }) {
    let members = await $axios
      .get("/api/showroom")
      .then(r => r.data)
      .catch(e => []);

    return {
      members: members
    };
  }
};
</script>

<style></style>
