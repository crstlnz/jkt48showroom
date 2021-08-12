<template>
  <div class="ranks-fans">
    <div class="ranks-header">Ranking Fans</div>
    <div class="ranks-container">
      <div v-if="error" class="error">Sepertinya telah terjadi error :(</div>
      <div v-else-if="!ranks || !ranks.length" class="error kosong">
        Sepertinya tidak ada data tersedia :(
      </div>

      <div v-else class="ranks-content">
        <table class="ranks-table">
          <tr>
            <th>No</th>
            <th>Username</th>
            <th>Total Point</th>
            <th>Action</th>
          </tr>
          <tr v-for="(rank, i) in ranks" :key="rank._id">
            <td>{{ (i + 1) * page }}</td>
            <td>{{ rank.name }}</td>
            <td>{{ rank.point }}</td>
            <td>Detail</td>
          </tr>
        </table>

        <ul class="pagination">
          <li :class="{ active: page == 1 }" class="first-page">1</li>
          <li v-if="page > 4" class="separator">...</li>
          <li :class="{ active: page == 2 }" v-else>2</li>
          <li
            v-for="i in 3"
            :key="i"
            :class="{ active: page == pag_center + i }"
          >
            {{ pag_center + i }}
          </li>
          <li v-if="page < max_page - 4" class="separator">...</li>
          <li :class="{ active: page == max_page - 1 }" v-else>
            {{ max_page - 1 }}
          </li>
          <li :class="{ active: page == max_page }" class="last-page">
            {{ max_page }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import "~assets/core.scss";
.ranks-fans {
  .ranks-header {
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

  .ranks-container {
    .error {
      margin: 30px;
      color: $text;
      font-size: large;
      text-align: center;
    }

    .ranks-content {
      //   background-color: $color3;
      //   table,
      //   th,
      //   td {
      //     border: 1px solid black;
      //     border-collapse: collapse;
      //   }
      .ranks-table {
        overflow: hidden;
        border-radius: 5px;
        width: 100%;
        border-collapse: collapse;
        tr {
          &:first-child {
            background: darken($color: $color3, $amount: 8%);
          }
          th {
            height: 30px;
            font-weight: bold;
            text-align: left;
          }

          th,
          td {
            padding: 10px 15px;
          }

          &:not(:first-child) {
            &:nth-child(even) {
              background: darken($color3, 5%);
            }

            &:nth-child(odd) {
              background: darken($color3, 3%);
            }
          }
        }
        width: 100%;
        color: $text;
      }

      .pagination {
        margin: 0;
        padding: 0;
        margin: 10px 0;
        float: right;
        color: $text;
        li {
          background: darken($color3, 3%);
          margin: 0;
          padding: 5px 10px;
          display: inline-block;
          list-style-type: none;
        }
      }
    }
  }
}
</style>

<script>
export default {
  layout: "48template",
  head: {
    title: "Ranking Fans | JKT48 Showroom Log",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "Ranking para fans di showroom!"
      }
    ]
  },
  data: function() {
    return {
      error: false,
      ranks: [],
      page: 1
    };
  },
  computed: {
    pag_center() {
      if (this.page < 5) {
        return 3;
      } else if (this.page < this.max_page - 5) {
        return this.max_page - 5;
      } else {
        return this.page - 1;
      }
    }
  },
  async asyncData({ $axios }) {
    let result = await $axios
      .get("/api/showroom/user/ranks", {
        params: {
          page: 1,
          count: true
        }
      })
      .then(r => r.data)
      .catch(e => []);

    return {
      ranks: result.list,
      total: result.total,
      max_page: Math.ceil(result.total / result.perpage),
      page: 1
    };
  }
};
</script>
