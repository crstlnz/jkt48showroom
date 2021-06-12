<template>
  <div class="template48">
    <div class="wrapper48">
      <nav>
        <NuxtLink to="/games" class="logo homelink" prefetch>
          <img src="/img/jkt48.png" alt="" />
        </NuxtLink>
        <NuxtLink class="homelink title" to="/games" prefetch>
          Oshi Calculator
        </NuxtLink>
        <NuxtLink class="homelink title" to="/games/members" prefetch>
          Member List
        </NuxtLink>
      </nav>

      <!-- <div class="container content"> -->
      <nuxt class="maincontent" />
      <!-- </div> -->

      <footer>
        <div class="credit">
          <span class="left">© SegiempatPTK 2020</span>
          <span class="right"
            >By <a href="https://twitter.com/crstlnz">@crstlnz</a></span
          >
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";

#__nuxt {
  min-height: 100%;
}
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  width: 100vw;
  overflow-x: hidden;
}

.template48 {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  background: radial-gradient(
    ellipse at center,
    #f9f9f9 0%,
    #e1e4e8 62%,
    #d1d6db 100%
  );
  color: $bg-color;
  min-height: 100vh;

  .wrapper48 {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 1024px;
    margin: auto;
    @include for("1024px") {
      width: 80%;
    }

    @include for("768px") {
      width: 85%;
    }

    @include for("678px") {
      width: 90%;
    }

    .main {
      flex: 1;
    }

    nav {
      a {
        transition: 0.3s;
        position: relative;
        &.nuxt-link-exact-active:before {
          visibility: visible;
          transform: scaleX(1);
        }

        &:before {
          content: "";
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -5px;
          left: 0;
          background: $bg-color;
          visibility: hidden;
          border-radius: 5px;
          transform: scaleX(0);
          transition: 0.25s linear;
        }

        &:hover {
          &:before {
            visibility: visible;
            transform: scaleX(1);
          }
        }
        text-shadow: 2px 2px 6px rgb(0 0 0 / 20%);
        &:not(:last-child) {
          margin-right: 18px;
          @include for("678px") {
            margin-right: 12px;
          }
        }
      }
      margin-top: 25px;
      margin-bottom: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      .logo {
        display: inline-block;
        width: 80px;
        height: 80px;
        overflow: hidden;
        border-radius: 50%;
        position: relative;
        box-shadow: 2px 2px 6px rgb(0 0 0 / 20%);

        @include for("678px") {
          width: 50px;
          height: 50px;
        }

        img {
          width: 100%;
        }
      }

      .title {
        font-size: 24px;
        color: $bg-color;
        font-weight: bold;
        @include for("678px") {
          font-size: 14px;
        }
      }
    }
  }

  .maincontent {
    flex: 1;
  }

  footer {
    .credit {
      span {
        color: $bg-color;
        font-weight: bold;
        a {
          color: inherit;
          text-decoration: none;
        }
      }
      padding-top: 30px;
      padding-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>

<script>
// import axios from "axios";

export default {
  // transition(to, from) {
  //   if (!from) {
  //     return "slide-left";
  //   }
  //   return +to.query.page < +from.query.page ? "fade" : "fade";
  // },
  head: {
    script: [
      {
        src: "https://kit.fontawesome.com/4446a480a3.js"
      }
    ],
    link: [
      {
        rel: "stylesheet",
        type: "text/css",
        href:
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      }
    ]
  },
  data: function() {
    return {};
  },
  computed: {
    user: function() {
      return this.$store.getters.getUser;
    }
  },

  methods: {
    isAdmin: function() {
      if (this.user && this.user.id == "336223763953614859") {
        return true;
      }
      return false;
    },
    getUsername: function() {
      if (this.user)
        if (this.user.username) {
          return this.user.username;
        }
      return "Account";
    },

    userMenu: function() {
      this.userMenuOpened = !this.userMenuOpened;
    }
  }
};
</script>
