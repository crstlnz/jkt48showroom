<template>
  <div class="main-container">
    <div v-bind:class="{ open: nav_open }" class="nav">
      <div class="title">
        <NuxtLink to="/" class="logo" prefetch
          ><img src="/logo2.jpg" alt="" v-lazy-load
        /></NuxtLink>
        <NuxtLink to="/" class="text link" prefetch
          >JKT48 Showroom Log</NuxtLink
        >
      </div>
      <div class="burger" v-on:click="toggleNav">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="outsideclick" v-on:click="toggleNav"></div>
      <div class="nav-menu">
        <NuxtLink to="/log" class="item link" prefetch>Log</NuxtLink>
        <NuxtLink to="#" class="item link" prefetch>Member</NuxtLink>
        <NuxtLink to="#wew" class="item link" prefetch>Fans</NuxtLink>
        <!-- <div class="center">
        </div> -->
        <!-- <div class="side">
          <div class="contact">
            <a class="link" target="_blank" href="https://twitter.com/crstlnz"
              ><span class="twitter"></span
            ></a>
          </div>
        </div> -->
      </div>
    </div>
    <nuxt class="content" />
    <div class="footer">
      <div class="wrapper">
        <div class="kiri">© 2021 SegiempatPTK</div>
        <div class="kanan">
          By <a target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";

*,
html {
  padding: 0;
  margin: 0;
}

body {
  background-color: lighten($color3, 3%);
  width: 100vw;
  overflow-x: hidden;
  &.disablescroll {
    overflow-y: hidden;
  }
}

div#__nuxt,
#__layout,
#__layout > div,
#app {
  min-height: 100vh;
}

@font-face {
  font-family: iconJKTSR;
  src: url("/icomoon.ttf");
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: lighten($color3, 3%);
}

::-webkit-scrollbar-thumb {
  background: lighten($color3, 30%);
}

::-webkit-scrollbar-thumb:hover {
  background: lighten($color3, 20%);
}

.main-container {
  margin: auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  .nav {
    width: 100vw;
    position: fixed;
    z-index: 9;
    top: 0;
    left: 0;
    right: 0;
    background: $color3;
    color: darken($color: white, $amount: 15%);
    a {
      text-decoration: none;
      color: darken($color: white, $amount: 15%);
    }
    border-bottom: 2px solid darken($color3, 3%);
    box-shadow: 0px 0px 2px darken($color3, 3%);
    padding: 10px 22px;
    // padding-left: 22px;
    // padding-right: 22px;
    display: flex;
    align-items: center;

    .link {
      padding-top: 8px;
      padding-bottom: 8px;
      transition: 0.3s;
      &:hover {
        color: lighten($color: $red, $amount: 25%);
      }
    }

    .title {
      flex: 1;

      display: flex;
      // justify-content: center;
      // justify-items: center;
      align-items: center;
      .logo {
        border-radius: 50%;
        width: 50px;
        height: 50px;
        overflow: hidden;
        img {
          width: 100%;
          height: auto;
        }
      }

      .text {
        margin-left: 10px;
        font-size: 18px;
        font-weight: bold;
        padding-top: 5px;
        padding-bottom: 5px;
      }
    }

    .burger {
      display: none;
      user-select: none;
      transition: 0.3s;
      span {
        transition: 0.3s;
      }
    }

    .outsideclick {
      // visibility: ;
      user-select: none;
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      visibility: hidden;
      opacity: 0;
      transition: 0.4s;
      background: rgba(0, 0, 0, 0.8);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      margin-left: 25px;

      .item {
        text-align: center;
        padding-left: 20px;
        padding-right: 20px;
        display: inline-block;
        min-width: 80px;
        text-decoration: none;
        font-size: 18px;
        font-weight: bold;
      }
    }

    @include for("700px") {
      padding: 10px 15px;
      // display: block;
      .burger {
        padding: 2px;
        cursor: pointer;
        display: initial;
        // border: 2px solid $text;
        width: 34px;
        height: 34px;
        z-index: 100;
        // border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        span {
          width: 100%;
          height: 4px;
          background: $text;
          border-radius: 2px;
          // border-bottom: 4px solid $text;
        }
      }

      .nav-menu {
        background: $color3;
        box-shadow: 0px 0px 2px darken($color3, 3%);
        position: fixed;
        // width: calc((100% - 90px) - 100%);
        width: 100%;
        right: 0;
        top: 0;
        bottom: -100px; /// untuk android yang bisa hide browser tab
        z-index: 10;
        flex-direction: column;
        transition: 0.4s ease-out;
        transform: translateX(-100%);
        padding: 20px;
        .link {
          font-size: 24px;
          line-height: 30px;
        }
      }

      &.open {
        .nav-menu {
          transform: translateX(0);
        }
        .outsideclick {
          // visibility: ;

          visibility: initial;
          opacity: 1;
        }

        .burger {
          span {
            &:first-child {
              transform: translateY(10px) rotate(45deg);
            }
            &:nth-child(2) {
              opacity: 0;
            }
            &:last-child {
              transform: translateY(-10px) rotate(-45deg);
            }
          }
        }
      }
    }
  }

  .content {
    padding-top: 80px;
    flex: 1;
    width: 1200px;
    max-width: calc(100% - 20px);
    // background: lighten($color3, 6%);
    margin: auto;
    margin-bottom: 10px;
    margin-top: 10px;
    transition: 0.3s;
  }

  .footer {
    background: $red;
    .wrapper {
      padding: 10px;
      padding-left: 20px;
      padding-right: 20px;
      display: flex;
      justify-content: space-between;

      .kiri,
      .kanan {
        font-size: 13px;
        color: darken($color: white, $amount: 15%);
        a {
          text-decoration: none;
          color: inherit;
          font-weight: bold;
        }
      }
    }
  }
}
.custom-enter-active,
.custom-leave-active {
  transition: opacity 0.5s;
}
.custom-enter,
.custom-leave-active {
  opacity: 0;
  // transform: scaleY(0%);
}
</style>

<script>
export default {
  head: {
    script: [
      {
        src: "https://kit.fontawesome.com/4446a480a3.js",
        crossorigin: "anonymous",
        SameSite: "None"
      }
    ],
    link: [
      {
        rel: "stylesheet",
        type: "text/css",
        href:
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      }
    ],
    meta: [
      {
        name: "theme-color",
        content: "#313131"
      }
    ]
  },
  watch: {
    $route(to, from) {
      this.nav_open = false;
      // menu.removeAttribute("style");
      // this.isOpen = false;
      // this.$nextTick(() => {
      //   this.calcHeight();
      // });
    }
  },
  data() {
    return {
      nav_open: false
    };
  },
  methods: {
    resize() {
      this.nav_open = false;
    },
    toggleNav() {
      this.nav_open = !this.nav_open;
      try {
        if (this.nav_open) {
          document.body.classList.add("disablescroll");
        } else {
          document.body.classList.remove("disablescroll");
        }
      } catch (e) {}
    }
  },
  mounted() {
    // window.addEventListener("resize", this.resize);
  },
  beforeDestroy() {
    // window.removeEventListener("resize", this.resize);
  }
};
</script>
