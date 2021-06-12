<template>
  <div class="main logdiv">
    <div v-if="error" class="logerror">Telah terjadi error!</div>
    <div v-else-if="!log" class="logerror">Data tidak ditemukan!</div>
    <div v-else class="log">
      <div class="roomInfo">
        <div class="room">
          <div class="image">
            <img v-bind:data-src="log.room_info.img" v-lazy-load />
          </div>

          <div class="description">
            <div class="name">
              <a
                v-bind:href="'https://showroom-live.com' + log.room_info.url"
                >{{ log.room_info.name }}</a
              >
            </div>
            <div class="totalgifts">
              <div class="giftvalue">
                <span>Total Gifts :</span>{{ toRupiah(log.total_point) }}
              </div>
              <div class="jpnrate">
                <label class="rate" for="rate">JPY Rate</label
                ><input
                  name="rate"
                  v-model="jpnrate"
                  type="number"
                  step="any"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="note">* data tidak 100% akurat</div>

      <div class="timeinfo">
        <div class="startdate">
          <div class="label">Start Date</div>
          <div class="val">{{ time(log.live_info.start_date) }}</div>
        </div>
        <div class="enddate">
          <div class="label">End Date</div>
          <div class="val">{{ time(log.live_info.end_date) }}</div>
        </div>
      </div>

      <div class="subinfo">
        <div class="iteminfo">
          <div class="value">
            {{ dur(log.live_info.end_date, log.live_info.start_date) }}
          </div>
          <div class="title"><i class="fas fa-stopwatch"></i> Durasi Live</div>
        </div>
        <div v-if="log.live_info.penonton" class="iteminfo">
          <div class="value">{{ log.live_info.penonton.peak }}</div>
          <div class="title"><i class="far fa-eye"></i> Jumlah Penonton</div>
        </div>
        <div class="iteminfo">
          <div class="value">
            {{ fixedGifts ? fixedGifts.length : 0 }}
          </div>
          <div class="title"><i class="fas fa-gift"></i> Gift Giver</div>
        </div>
      </div>

      <div class="dropdownInfo">
        <div
          v-if="log.live_info.penonton"
          v-bind:class="{ open: ddInfo.penonton }"
          class="item grafikPenonton"
        >
          <div v-on:click="ddInfo.penonton = !ddInfo.penonton" class="title">
            Penonton
          </div>
          <div class="calcHeight main">
            <div class=" maincontainer">
              <div class="history">
                <watch-chart
                  v-bind:sdate="log.live_info.start_date"
                  v-bind:data="log.live_info.penonton"
                ></watch-chart>
                <div class="tooltip">
                  <div class="value"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="log.live_info.stage_list"
          v-bind:class="{ open: ddInfo.stage_list }"
          class="item stagelist"
        >
          <div
            v-on:click="ddInfo.stage_list = !ddInfo.stage_list"
            class="title"
          >
            Stage List
          </div>
          <div class="calcHeight main">
            <div class=" maincontainer">
              <!-- <button v-on:click="toggleDraw">Toggle</button> -->

              <div
                ref="canvasDiv"
                v-if="log.live_info.stage_list"
                class="canvasPenontonDiv"
              >
                <canvas ref="canvas" id="canvasPenonton"></canvas>

                <div class="switchContainer">
                  <div
                    v-on:click="toggleDraw"
                    v-bind:class="{ checked: canvasData.animState }"
                    class="switch"
                  >
                    <div class="slider"></div>
                  </div>
                  <div class="titleswitch">Animasi</div>
                </div>

                <div class="switchContainer right">
                  <div
                    v-on:click="toggleScreenshot"
                    v-bind:class="{ checked: canvasData.screenshot }"
                    class="switch"
                  >
                    <div class="slider"></div>
                  </div>
                  <div class="titleswitch">Screenshot</div>
                </div>

                <!-- <div id="trigger" ref="trigger"></div> -->
                <div
                  v-on:click="canvasData.hideCon = !canvasData.hideCon"
                  class="toggle"
                  v-bind:class="{ hide: canvasData.hideCon }"
                >
                  <i class="fas fa-angle-up"></i>
                </div>

                <div
                  v-bind:class="{ hide: canvasData.hideCon }"
                  id="timeSlider"
                  class="timeSlider"
                >
                  <div class="tsContainer">
                    <div class="waktu">{{ time(selectedTime) }}</div>
                    <input
                      v-model="timecontrol"
                      type="range"
                      min="0"
                      max="1000"
                      class="slider"
                      id="myRange"
                    />
                  </div>
                </div>
                <!-- <div
                  id="control"
                  v-bind:class="{ fix: fixstate }"
                  class="control"
                ></div> -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="giftlist">
        <div class="title">Gifts</div>
        <div
          v-if="!log.gift_data.gift_log || !log.gift_data.gift_log.length"
          class="gifterror"
        >
          Tidak ada data!
        </div>
        <div v-else ref="giftDiv" class="gifts">
          <virtual-list
            scrollable
            :data-key="'id'"
            :data-sources="fixedGifts"
            :data-component="giftComponent"
            :estimate-size="146"
            :keeps="30"
            class="virtualscroll"
          />

          <!-- <gift-list
            v-for="gift in fixedGifts"
            v-bind:gift="gift"
            v-bind:user_info="
              log.user_list[
                gift.user_data ? gift.user_data.user_id : gift.user_id
              ]
            "
            v-bind:key="gift.user_data ? gift.user_data.user_id : gift.user_id"
          ></gift-list> -->
        </div>

        <!-- <div v-else class="gifts">
          <gift-list
            v-for="gift in fixGifts(log.gift_data)"
            v-bind:gift="gift"
            v-bind:key="gift.user_data ? gift.user_data.user_id : gift.user_id"
          ></gift-list>
        </div> -->
      </div>
    </div>

    <!-- <div v-on:click="$router.back()">{{ $router.hasPrevious() }}</div> -->
    <!-- <NuxtLink to="/showroom/log" prefetch>Back</NuxtLink> -->
    <!-- :style="{ left: user_detail.x, top: user_detail.y }" -->
    <div
      ref="userdetail"
      id="userdetail"
      class="userdetail"
      :style="{ transform: `translate(${user_detail.x},${user_detail.y})` }"
      :class="{ show: user_detail.show, notdrag: !user_detail.drag }"
    >
      <div class="wrapper">
        <div class="draggable" @mousedown="startdrag"></div>
        <div v-on:click="user_detail.show = false" class="close">
          <i class="fas fa-times"></i>
        </div>
        <div v-if="user_detail.isLoading" class="loading"></div>
        <div v-else-if="user_detail.user" class="info">
          <div class="username">
            {{
              user_detail.user.name ? user_detail.user.name : "Tidak ada nama"
            }}
          </div>
          <div class="userimage">
            <img
              v-bind:data-src="
                user_detail.user.image ||
                  'https://image.showroom-cdn.com/showroom-prod/assets/img/no_profile.jpg'
              "
              alt=""
              v-lazy-load
            />
            <div class="avatar">
              <img
                v-bind:data-src="getAvatar(user_detail.user.avatar_id)"
                alt=""
                v-lazy-load
              />
            </div>
          </div>

          <div v-if="user_detail.user.description" class="description">
            {{ user_detail.user.description }}
          </div>

          <div class="userid">
            <a
              target="_target"
              v-bind:href="
                'https://www.showroom-live.com/user/profile?user_id=' +
                  user_detail.user_id
              "
              >Detail</a
            >
          </div>

          <div
            v-if="user_detail.user.sns_list && user_detail.user.sns_list.length"
            class="sns"
          >
            <div
              v-for="sns in user_detail.user.sns_list"
              v-bind:key="sns.url"
              class="sns-item"
            >
              <a v-bind:href="sns.url" target="_blank"
                ><img v-bind:data-src="sns.icon" class="icon" v-lazy-load
              /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~assets/core.scss";
* {
  margin: 0;
  padding: 0;
}
.logdiv {
  width: 1280px;
  max-width: 95%;

  margin: auto;
  margin-bottom: 20px;
  color: $textsecond;

  .userdetail {
    display: none;
    background-color: transparentize($bg-color, 0.08);
    color: white;
    position: absolute;
    min-width: 250px;
    min-height: 100px;
    max-width: 30vw;
    left: 0;
    top: 0;
    // &:before {
    //   position: absolute;
    //   top: 0;
    //   bottom: 0;
    //   right: 0;
    //   left: 0;
    //   background: rgba(0, 0, 0, 0.8);
    //   content: "";
    //   z-index: -1;
    // }

    @include for("900px") {
      z-index: 10;
      position: fixed !important;
      width: 95% !important;
      max-width: 95%;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
    }
    &.notdrag {
      transition: 0.3s;
      transition-timing-function: ease-out;
    }

    .loading {
      color: #ffffff;
      font-size: 20px;
      margin: 100px auto;
      width: 0.5em;
      height: 0.5em;
      border-radius: 50%;
      position: relative;
      text-indent: -9999em;
      -webkit-animation: load4 1.3s infinite linear;
      animation: load4 1.3s infinite linear;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
    }
    @-webkit-keyframes load4 {
      0%,
      100% {
        box-shadow: 0 -3em 0 0.2em, 2em -2em 0 0em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 0;
      }
      12.5% {
        box-shadow: 0 -3em 0 0, 2em -2em 0 0.2em, 3em 0 0 0, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
      }
      25% {
        box-shadow: 0 -3em 0 -0.5em, 2em -2em 0 0, 3em 0 0 0.2em, 2em 2em 0 0,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
      }
      37.5% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 0, 2em 2em 0 0.2em,
          0 3em 0 0em, -2em 2em 0 -1em, -3em 0em 0 -1em, -2em -2em 0 -1em;
      }
      50% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 0em,
          0 3em 0 0.2em, -2em 2em 0 0, -3em 0em 0 -1em, -2em -2em 0 -1em;
      }
      62.5% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 0, -2em 2em 0 0.2em, -3em 0 0 0, -2em -2em 0 -1em;
      }
      75% {
        box-shadow: 0em -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 -1em,
          2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0.2em,
          -2em -2em 0 0;
      }
      87.5% {
        box-shadow: 0em -3em 0 0, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0, -2em -2em 0 0.2em;
      }
    }
    @keyframes load4 {
      0%,
      100% {
        box-shadow: 0 -3em 0 0.2em, 2em -2em 0 0em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 0;
      }
      12.5% {
        box-shadow: 0 -3em 0 0, 2em -2em 0 0.2em, 3em 0 0 0, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
      }
      25% {
        box-shadow: 0 -3em 0 -0.5em, 2em -2em 0 0, 3em 0 0 0.2em, 2em 2em 0 0,
          0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
      }
      37.5% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 0, 2em 2em 0 0.2em,
          0 3em 0 0em, -2em 2em 0 -1em, -3em 0em 0 -1em, -2em -2em 0 -1em;
      }
      50% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 0em,
          0 3em 0 0.2em, -2em 2em 0 0, -3em 0em 0 -1em, -2em -2em 0 -1em;
      }
      62.5% {
        box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 0, -2em 2em 0 0.2em, -3em 0 0 0, -2em -2em 0 -1em;
      }
      75% {
        box-shadow: 0em -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 -1em,
          2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0.2em,
          -2em -2em 0 0;
      }
      87.5% {
        box-shadow: 0em -3em 0 0, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em,
          0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0, -2em -2em 0 0.2em;
      }
    }

    .wrapper {
      padding: 10px;

      position: relative;
      .draggable {
        z-index: 0;
        position: absolute;
        top: 0;
        left: 0;
        height: 22px;
        width: 100%;
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
        &:active {
          cursor: grabbing;
          cursor: -moz-grabbing;
          cursor: -webkit-grabbing;
        }
      }
      .close {
        padding: 10px;
        position: absolute;
        right: 0;
        top: 0;
        cursor: pointer;
      }
      .info {
        text-align: center;
        padding: 15px;
        .username {
          font-size: 24px;
          font-weight: bold;
        }

        .userimage {
          position: relative;
          height: 120px;
          width: 120px;
          margin: auto;
          margin-top: 15px;
          margin-bottom: 20px;
          img {
            height: 100%;
            width: auto;
            margin-left: 50%;
            transform: translateX(-50%);
          }

          .avatar {
            position: absolute;
            bottom: -15px;
            height: 60px;
            right: -30px;
            img {
              width: auto;
              height: 100%;
            }
          }
        }

        .description {
          margin-bottom: 10px;
        }

        .userid {
          a {
            text-decoration: none;
            font-size: bold;
            color: rgb(85, 173, 255);
            &:hover {
              color: rgb(27, 124, 216);
            }
          }
        }

        .sns {
          margin-top: 10px;
          display: flex;
          .sns-item {
            &:not(:last-child) {
              margin-right: 3px;
            }
            a {
              text-decoration: none;
              .icon {
                width: 2.3em;
              }
            }
          }
        }

        .userid {
          font-size: 14px;
        }
      }
    }
    &.show {
      display: block;
    }
  }

  .logerror {
    color: $textsecond;
    text-align: center;
    font-weight: bold;
    margin: 30px;
    font-size: 30px;
  }

  .log {
    #trigger {
      margin-top: 10px;
    }

    .scroller {
      height: 100%;
    }

    background-color: $abusedang;
    padding: 10px;
    .roomInfo {
      padding: 10px;
      border: 4px dashed lighten($abusedang, 4%);

      .room {
        display: flex;
        width: 100%;
        @include gapH(10px);

        .image {
          width: 320px;
          height: 180px;
          overflow: hidden;
          border-radius: 5px;
          img {
            border-radius: 5px;
            opacity: 0;
            transition: 0.6s;
            &.isLoaded {
              transition: 0.6s;
              opacity: 1;
            }
            width: 100%;
          }
        }

        .description {
          flex: 1;
          display: flex;
          @include gapV(20px);

          justify-content: space-between;
          flex-direction: column;
          .name {
            a {
              text-decoration: none;
              color: inherit;
            }
            font-weight: bold;
            font-size: 22px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
          }

          .totalgifts {
            align-items: center;
            display: flex;
            justify-content: space-between;
            position: relative;
            padding-left: 10px;
            font-size: 18px;
            font-weight: bold;
            align-content: center;

            .giftvalue {
              span {
                font-weight: initial;
                font-size: 14px;
                position: absolute;
                left: 0;
                top: -15px;
              }
            }

            .jpnrate {
              .rate {
                font-size: 16px;
              }
              input {
                width: 75px;
                margin-left: 10px;
                border: none;
                background: transparent;
                color: $textsecond;
                font-size: 18px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    .note {
      font-size: 11px;
      color: darken(white, 30%);
      // font-weight: bold;
      padding-top: 10px;
    }

    .subinfo {
      margin-top: 20px;

      display: grid;
      // grid-auto-columns: minmax(300px, auto);
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
      .iteminfo {
        padding: 15px;
        background: lighten($abusedang, 4%);
        color: darken(white, 40%);
        text-align: center;
        font-size: 26px;
        @include for("900px") {
          font-size: 24px;
          padding: 12px;
        }

        @include for("760px") {
          font-size: 20px;
          padding: 8px;
        }
        .value {
          font-weight: bold;
        }
        .title {
          margin-top: 8px;
          font-size: 12px;
          font-weight: bold;
          @include for("900px") {
            font-size: 11px;
          }

          @include for("760px") {
            font-size: 10px;
          }
        }
      }
    }

    .history {
      padding: 10px;
      user-select: none;
      width: 100%;
      position: relative;
      .tooltip {
        opacity: 0;
        position: absolute;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 5px 12px 3px 12px;
        border-radius: 3px;
        -webkit-transition: all 0.1s ease;
        transition: all 0.2s ease;
        pointer-events: none;
        -webkit-transform: translate(-50%, 0);
        transform: translate(-50%, 0);
      }
    }

    .canvasPenontonDiv {
      user-select: none;
      background: white;
      padding-top: 56.25%;
      position: relative;
      overflow: hidden;
      width: 100%;

      .switchContainer {
        .titleswitch {
          margin-top: 5px;
          position: absolute;
          font-weight: bold;
          font-size: 0.85em;
          @include for("700px") {
            margin-top: 4px;
            font-size: 11px;
          }
          @include for("600px") {
            margin-top: 3px;
            font-size: 9px;
          }
          @include for("500px") {
            margin-top: 2px;

            font-size: 6px;
          }
        }
        position: absolute;
        top: 10px;
        left: 10px;
        // height: 40px;
        margin: auto;
        text-align: center;
        &.right {
          left: initial;
          right: 10px;
          .titleswitch {
            right: 0;
          }
        }

        .switch {
          cursor: pointer;
          display: inline-block;
          font-size: 20px; /* 1 */
          height: 1em;
          width: 2em;
          background: #bdb9a6;
          border-radius: 1em;
          transition: 0.3s;

          .slider {
            height: 1em;
            width: 1em;
            border-radius: 1em;
            background: #fff;
            box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.3);
            -webkit-transition: all 300ms;
            -moz-transition: all 300ms;
            transition: all 300ms;
          }

          &.checked {
            background: #42c1ff;
            .slider {
              -webkit-transform: translate3d(100%, 0, 0);
              -moz-transform: translate3d(100%, 0, 0);
              transform: translate3d(100%, 0, 0);
            }
          }
        }

        @include for("700px") {
          .switch {
            height: 0.7em;
            width: 1.4em;
            .slider {
              height: 0.7em;
              width: 0.7em;
            }
          }
        }
      }

      #canvasPenonton {
        &.user {
          cursor: pointer;
        }
        // width: 100%;
        height: 100%;
        position: absolute;
        top: -9999px;
        bottom: -9999px;
        left: -9999px;
        right: -9999px;
        margin: auto;
        transform: -50%;
      }

      @include for("900px") {
        padding-top: 75%;
      }

      .control {
        position: absolute;
        bottom: 0;
        width: 100%;
        transition: 0.5s;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 10px;
        display: flex;
      }

      .toggle {
        position: absolute;
        width: 2em;
        height: 2em;
        bottom: 0;
        font-size: 20px;
        // padding: 10px;
        text-align: center;
        // padding: 10px;
        // padding-right: 20px;
        // padding-bottom: 0;
        cursor: pointer;
        transition: 0.3s;
        i {
          width: 2em;
          line-height: 2em;
          transition: 0.3s;
          transition-timing-function: ease-out;
        }
        &.hide {
          i {
            transform: rotate(180deg);
          }
        }
      }

      .timeSlider {
        position: absolute;
        // flex: 1;
        bottom: 10px;
        left: 2.5em;
        width: calc(100% - 2.5em - 10px);
        transition: 0.3s;

        .tsContainer {
          // transition: 0.5s;
          position: relative;
          bottom: 0;
          width: 100%;
          transition: 0.3s;
          // transition-timing-function: ease-out;
          .waktu {
            padding-left: 5px;
            font-size: 12px;
            transition: 0.3s;
            transition-timing-function: ease-out;
          }

          .slider {
            width: 100%;
            cursor: pointer;
            // -webkit-appearance: none; /* Override default CSS styles */
            // appearance: none;
            border-radius: 10px;
            width: 100%; /* Full-width */
            height: 8px; /* Specified height */
            // background: #d3d3d3; /* Grey background */
            // outline: none; /* Remove outline */
            // opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
            -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
            transition: opacity 0.2s;
            transition: 0.3s;
            transition-timing-function: ease-out;
            // &:hover {
            //   opacity: 1; /* Fully shown on mouse-over */
            // }

            /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
            // &::-webkit-slider-thumb {
            //   -webkit-appearance: none; /* Override default look */
            //   appearance: none;
            //   width: 15px; /* Set a specific slider handle width */
            //   border-radius: 50%;
            //   height: 15px; /* Slider handle height */
            //   background: #3e98ff; /* Green background */
            //   cursor: pointer; /* Cursor on hover */
            // }

            // &::-moz-range-thumb {
            //   -webkit-appearance: none; /* Override default look */
            //   appearance: none;
            //   width: 15px; /* Set a specific slider handle width */
            //   border-radius: 50%;
            //   height: 15px; /* Slider handle height */
            //   background: #3e98ff; /* Green background */
            //   cursor: pointer; /* Cursor on hover */
            // }
          }
        }
        &.hide {
          // transform: translateY(50px);
          bottom: -50px;
          opacity: 0;
        }
      }
    }

    .dropdownInfo {
      margin-top: 20px;
      .item {
        margin-top: 10px;
        margin-bottom: 15px;
        .title {
          user-select: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 24px;
          padding: 13px;
          // border: 4px solid lighten($abusedang, 4%);
          background: lighten($abusedang, 4%);
          border-radius: 10px;
          &::before {
            display: inline-block;
            font-family: "Font Awesome\ 5 Free";
            content: "\f105";
            margin-right: 10px;
            transition: 0.3s;
          }
        }

        .main {
          height: 0;
          transition: 0.3s;
          overflow: hidden;
          .maincontainer {
            padding-top: 10px;
            padding-bottom: 10px;
          }
        }

        &.open {
          .title {
            &::before {
              transform: rotate(90deg);
            }
          }

          .main {
            height: var(--default-height);
          }
        }
      }
    }

    .timeinfo {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      border: 4px solid lighten($abusedang, 4%);
      .startdate {
        display: flex;
      }

      .enddate {
        display: flex;
        flex-direction: row-reverse;
      }
      div {
        // padding: 10px;
        & > div {
          padding: 10px;

          display: inline-block;
        }

        .label {
          width: 95px;

          // border-right: 4px solid lighten($abusedang, 4%);
          background-color: lighten($abusedang, 4%);
        }
      }
    }

    .giftlist {
      margin-top: 20px;
      .title {
        font-size: 24px;
        font-weight: bold;
      }

      .gifterror {
        text-align: center;
        font-weight: bold;
        font-size: 24px;
        border: 5px solid lighten($abusedang, 4%);
        padding: 35px;
      }

      .gifts {
        border: 5px solid lighten($abusedang, 4%);
        margin-top: 5px;
        display: flex;
        flex-direction: column;
        @include gapV(15px);
        .virtualscroll {
          // padding-left: 10px;
          // padding-right: 10px;
          max-height: 85vh;
          overflow-y: auto;
          /* width */
          &::-webkit-scrollbar {
            padding-right: 3px;
            width: 3px;
          }

          /* Track */
          &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0);
          }

          /* Handle */
          &::-webkit-scrollbar-thumb {
            background: #888;
          }

          /* Handle on hover */
          &::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          div[role="group"] {
            div[role="listitem"] {
              &:not(:last-child) {
                border-bottom: 2px dashed lighten($abusedang, 4%);
                margin-bottom: 8px;
              }

              &:not(:first-child) {
                margin-top: 8px;
              }
            }
          }
        }

        .gift {
          // border: 4px solid lighten($abusedang, 4%);
          padding: 10px;
          display: flex;
          // @include gapH(15px);

          .user {
            .avatar {
              cursor: pointer;
              padding: 10px;
              width: 120px;
              height: 120px;
              img {
                opacity: 0;
                transition: 0.6s;
                &.isLoaded {
                  transition: 0.6s;
                  opacity: 1;
                }
                width: 100%;
              }
            }
          }

          .detail {
            flex: 1;
            display: flex;
            flex-direction: column;
            @include gapV(15px);

            .username {
              margin-left: 15px;
              font-weight: bold;
              font-size: 18px;
            }

            .usergiftlist {
              flex: 1;
              .list {
                display: flex;
                flex-wrap: wrap;
                // display: inline-grid;
                // grid-template-columns: repeat(auto-fit, auto);
                // // grid-auto-flow: column dense;
                // // grid-template-rows: auto;
                // grid-gap: 15px;
                .detailhadiah {
                  margin-bottom: 15px;
                  margin-left: 15px;

                  display: flex;
                  @include gapH(6px);
                  align-items: center;
                  .giftimage {
                    &:hover {
                      .harga {
                        opacity: 1;
                      }
                    }
                    position: relative;
                    width: 50px;
                    height: 50px;
                    // overflow: hidden;
                    // background-color: lighten($abusedang, 3%);
                    img {
                      opacity: 0;
                      transition: 0.6s;
                      &.isLoaded {
                        transition: 0.6s;
                        opacity: 1;
                      }
                      width: 100%;
                    }

                    .harga {
                      z-index: 1;
                      transition: 0.3s;
                      opacity: 0;
                      border-radius: 10px;
                      font-weight: bold;
                      white-space: nowrap;
                      padding: 4px 10px 4px 10px;
                      font-size: 11px;
                      color: $abusedang;
                      position: absolute;
                      background-color: white;
                      text-align: center;
                      width: auto;
                      bottom: -20px;
                      left: 50%;
                      transform: translateX(-50%);
                    }
                  }
                  .num {
                    font-size: 15px;
                    font-weight: bold;

                    span {
                      font-weight: initial;
                      font-size: 12px;
                    }
                  }
                }
              }

              .total {
                margin-left: 15px;
                font-weight: bold;
                margin-top: 5px;
              }
            }
          }
        }
        // border: 4px dashed lighten($abusedang, 4%);
      }
    }
  }
}

@include for("900px") {
  .logdiv {
    .log {
      .roomInfo {
        .room {
          .image {
            width: 264px;
            height: 148.5px;
          }

          .description {
            .name {
              font-size: 21px;
            }

            .totalgifts {
              .giftvalue {
              }

              .jpnrate {
                .rate {
                }
              }
            }
          }
        }
      }

      .timeinfo {
        font-size: 14px;

        flex-direction: column;
        justify-content: initial;
        div {
          &:last-child {
            flex: 1;
          }
          &:first-child {
            .label {
              border-bottom: 4px solid lighten($abusedang, 4%);
            }

            .val {
              border-bottom: 4px solid lighten($abusedang, 4%);
            }
          }
        }

        .startdate {
        }

        .enddate {
          flex-direction: row;
        }
        div {
          // padding: 10px;
          & > div {
          }

          .label {
            text-align: center;
            // &:first-child {
            //   border-bottom: 4px solid lighten($abusedang, 4%);
            // }
            width: 100px;
            border-right: 4px solid lighten($abusedang, 4%);
            background-color: initial;
          }

          .val {
            &:first-child {
              border-bottom: 4px solid lighten($abusedang, 4%);
            }
          }
        }
      }

      .penonton {
        .subinfo {
          display: block;
          .iteminfo {
            &:not(:first-child) {
              margin-top: 10px;
            }
          }
        }
      }

      .giftlist {
        .title {
        }

        .gifterror {
        }

        .gifts {
          .gift {
            .user {
              .avatar {
                width: 110px;
                height: 110px;
              }
            }

            .detail {
              .username {
                font-size: 17px;
              }

              .usergiftlist {
                .list {
                  .detailhadiah {
                    .giftimage {
                      width: 40px;
                      height: 40px;
                      &:hover {
                        .harga {
                        }
                      }

                      img {
                        &.isLoaded {
                        }
                      }

                      .harga {
                      }
                    }
                    .num {
                      span {
                      }
                    }
                  }
                }

                .total {
                  font-size: 16px;
                }
              }
            }
          }
          // border: 4px dashed lighten($abusedang, 4%);
        }
      }
    }
  }
}

@include for("700px") {
  .logdiv {
    .logerror {
    }

    .log {
      .roomInfo {
        .room {
          flex-direction: column;
          & > {
            margin-right: 0;
          }
          @include gapV(10px);

          .image {
            position: relative;
            width: 100%;
            padding-top: 56.25%;
            img {
              position: absolute;
              z-index: 100;
              top: 0;
            }
          }

          .description {
            .name {
              font-size: 19px;
            }

            .totalgifts {
              .giftvalue {
                font-size: 15px;
                span {
                  top: -12px;
                  font-size: 12px;
                }
              }

              .jpnrate {
                .rate {
                  font-size: 13px;
                }
                input {
                  font-size: 15px;
                  width: 70px;
                }
              }
            }
          }
        }
      }

      .timeinfo {
        font-size: 11px;
        div {
          &:last-child {
          }
          &:first-child {
            .label {
            }

            .val {
            }
          }
        }

        .penonton {
          .subinfo {
            display: block;
          }
        }

        .startdate {
        }

        .enddate {
        }
        div {
          // padding: 10px;
          & > div {
          }

          .label {
            width: 80px;
            // &:first-child {
            //   border-bottom: 4px solid lighten($abusedang, 4%);
            // }
          }

          .val {
            &:first-child {
            }
          }
        }
      }

      .giftlist {
        .title {
        }

        .gifterror {
        }

        .gifts {
          .gift {
            .user {
              .avatar {
                width: 100px;
                height: 100px;
              }
            }

            .detail {
              .username {
                font-size: 16px;
              }

              .usergiftlist {
                .list {
                  .detailhadiah {
                    .giftimage {
                      width: 30px;
                      height: 30px;
                      &:hover {
                        .harga {
                        }
                      }

                      img {
                        &.isLoaded {
                        }
                      }

                      .harga {
                      }
                    }
                    .num {
                      span {
                      }
                    }
                  }
                }

                .total {
                  font-size: 14px;
                }
              }
            }
          }
          // border: 4px dashed lighten($abusedang, 4%);
        }
      }
    }
  }
}

@include for("550px") {
  .logdiv {
    .logerror {
    }

    .log {
      .roomInfo {
        .room {
          // .image {
          //   width: 140px;
          //   height: 78.75px;
          // }

          .description {
            .name {
              font-size: 16px;
            }

            .totalgifts {
              .giftvalue {
                font-size: 13px;
                span {
                  top: -8px;
                  font-size: 11px;
                }
              }

              .jpnrate {
                .rate {
                  font-size: 12px;
                }
                input {
                  font-size: 13px;
                  width: 60px;
                }
              }
            }
          }
        }
      }

      .note {
        font-size: 8px;
      }

      .timeinfo {
      }

      .giftlist {
        .title {
        }

        .gifterror {
        }

        .gifts {
          .gift {
            .user {
              .avatar {
                width: 90px;
                height: 90px;
              }
            }

            .detail {
              .username {
                font-size: 15px;
              }

              .usergiftlist {
                .list {
                  .detailhadiah {
                    .giftimage {
                      width: 25px;
                      height: 25px;

                      &:hover {
                        .harga {
                        }
                      }

                      img {
                        &.isLoaded {
                        }
                      }

                      .harga {
                        font-size: 10px;
                      }
                    }
                    .num {
                      font-size: 12px;
                      span {
                        font-size: 10px;
                      }
                    }
                  }
                }

                .total {
                  font-size: 12px;
                }
              }
            }
          }
          // border: 4px dashed lighten($abusedang, 4%);
        }
      }
    }
  }
}

@include for("450px") {
  .logdiv {
    .logerror {
    }

    .log {
      .roomInfo {
        .room {
          .description {
            .name {
              font-size: 16px;
            }

            .totalgifts {
              .giftvalue {
              }

              .jpnrate {
                .rate {
                }
              }
            }
          }
        }
      }

      .note {
        font-size: 6px;
      }

      .timeinfo {
      }

      .penonton {
        .subinfo {
          display: block;
        }
      }

      .giftlist {
        .title {
        }

        .gifterror {
        }

        .gifts {
          .gift {
            .user {
              .avatar {
                width: 90px;
                height: 90px;
              }
            }

            .detail {
              .username {
                font-size: 15px;
              }

              .usergiftlist {
                .list {
                  .detailhadiah {
                    .giftimage {
                      width: 25px;
                      height: 25px;

                      &:hover {
                        .harga {
                        }
                      }

                      img {
                        &.isLoaded {
                        }
                      }

                      .harga {
                        font-size: 10px;
                      }
                    }
                    .num {
                      font-size: 12px;
                      span {
                        font-size: 10px;
                      }
                    }
                  }
                }

                .total {
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

<script>
import GiftList from "~/components/GiftList.vue";
import moment from "moment";
moment.updateLocale("en", {
  relativeTime: {
    s: function(number, withoutSuffix, key, isFuture) {
      return number + " seconds";
    }
  }
});
// import WatchChart from "../../../components/showroom/log/watch-chart.vue";
import VirtualList from "vue-virtual-scroll-list";

import srCanvas from "../../../srCanvas.js";

const stageBackground =
  "https://www.showroom-live.com/assets/img/room/background/default.png";
const stageForeground =
  "https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/stand.png";
moment.locale("id");
export default {
  layout: "48template",
  middleware: "japan_rate",
  head: {
    title: "Gift Data | JKT48 Showroom",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "Log Gift Showroom yang tercatat!"
      }
    ]
  },
  components: {
    "virtual-list": VirtualList
    // GiftList,
    // WatchChart
  },
  data() {
    return {
      ss_url: "https://res.cloudinary.com/haymzm4wp/image/upload/",
      log: null,
      timecontrol: 1000,
      giftComponent: GiftList,
      error: false,
      jpnrate: 135.65,
      fixstate: false,
      canvasData: {
        hideCon: true,
        animState: true
      },
      ddInfo: {
        penonton: false,
        stage_list: true
      },
      user_detail: {
        posX: 0,
        posY: 0,
        dragX: 0,
        dragY: 0,
        set x(x) {
          this.posX = x + 10 + 30;
        },
        set y(y) {
          this.posY = y - 40;
        },
        get x() {
          return this.posX + "px";
        },
        get y() {
          return this.posY + "px";
        },
        show: false,
        user_id: null,
        isLoading: true,
        ctx: this,
        user: {}
      }
    };
  },
  computed: {
    selectedScreenshotNum() {
      try {
        if (!this.canvasData.screenshot) return -1;
        if (!this.log || !this.log.live_info || !this.log.live_info.screenshot)
          return -1;
        if (!this.log.live_info.screenshot.list) return -1;
        let screenshot = this.log.live_info.screenshot;

        let sT = this.selectedTime;
        let num = screenshot.list.length - 1;

        while (num >= 0 && sT < screenshot.list[num]) {
          num--;
        }
        if (num < 0) num = 0;

        let diff = sT - screenshot.list[num];
        if (diff < -180000 || diff > 180000) return -1;
        return num;
      } catch (e) {
        return -1;
      }
    },
    fixedGifts() {
      try {
        if (!this.log) return [];
        let log = this.log;
        let gift_log = log.gift_data.gift_log;
        let fixed =
          gift_log && gift_log[0].gifts && gift_log[0].gifts[0].date
            ? this.fixGifts(gift_log)
            : gift_log;

        let mapped = fixed
          .map(i => {
            i = { ...i }; // clone object
            i.id = i.user_id;
            i.user_data = log.users[i.user_id];
            i.gifts = i.gifts.filter(i => !i.free);
            return i;
          })
          .filter(i => i.gifts && i.gifts.length);
        // console.log(mapped);
        return mapped;
      } catch (e) {
        return [];
      }
    },
    selectedTime() {
      if (!this.log) return 0;
      let liveinfo = this.log.live_info;
      let d = new Date(liveinfo.start_date);
      let dd = new Date(liveinfo.end_date);
      let diff = Math.abs(dd - d);
      let choice = (diff / 1000) * this.timecontrol;

      return d.getTime() + choice;
    },
    selectedStageListNum() {
      if (!this.log) return 0;
      if (!this.log.live_info.stage_list) return null;
      let stage_list = this.log.live_info.stage_list;
      let sT = new Date(this.selectedTime);
      let num = stage_list.length - 1;
      while (
        num >= 0 &&
        sT.getTime() < new Date(stage_list[num].date).getTime()
      ) {
        // stage_list[num];
        num--;
      }
      if (num < 0) num = 0;
      return num;
    },
    gifts() {
      try {
        let gifts = [];
        if (!this.log) return gifts;
        if (!this.log.gift_data) return gifts;
        if (!this.log.gift_data.gift_log.length) return gifts;
        for (let user of this.log.gift_data.gift_log) {
          for (let hadiah of user.gifts) {
            gifts.push({
              user_id: user.user_id,
              ...hadiah
            });
          }
        }
        return gifts;
      } catch (e) {
        return [];
      }
    },
    podiumGifts() {
      if (!this.log) return [];
      if (!this.gifts) return [];
      let podium = [];
      if (!this.recursiveId) this.recursiveId = 0;
      this.recursiveId++;
      let id = this.recursiveId;
      for (let gift of this.gifts) {
        if (id !== this.recursiveId) break;
        if (new Date(gift.date) < this.selectedTime && gift.point >= 10000)
          podium.push(gift);
      }
      return podium;
    }
  },
  watch: {
    selectedTime(val, old) {
      try {
        this.canvas.setTime(val);
      } catch (e) {}
    },
    selectedScreenshotNum(val, old) {
      if (!this.canvasData.screenshot) return;
      if (val !== old) {
        clearTimeout(this.timeoutSS);
        this.timeoutSS = setTimeout(() => {
          this.canvas.setProfilePicId(val);
        }, 5);
      }
    },
    selectedStageListNum(val, old) {
      try {
        if (val != old) {
          clearTimeout(this.timeoutCanvas);
          this.timeoutCanvas = setTimeout(() => {
            let sl = this.log.live_info.stage_list[val].list.map(
              i => this.log.users[i]
            );
            this.canvas.setStageList(sl);
          }, 50);
        }
      } catch (e) {}
    }
  },
  methods: {
    getAvatar(id) {
      return `https://image.showroom-cdn.com/showroom-prod/image/avatar/${id}.png?v=87`;
    },
    drawCanvas() {
      this.stopDraw();
      this.startDraw();
    },
    draw(time) {
      this.drawId = undefined;
      this.canvas.draw(time);
      if (this.canvas.animating) this.startDraw();
    },
    startDraw() {
      if (!this.drawId) this.drawId = requestAnimationFrame(this.draw);
    },
    stopDraw() {
      if (this.drawId) {
        cancelAnimationFrame(this.drawId);
        this.drawId = undefined;
        this.canvas.setAnimate(false);
      }
    },
    toggleDraw() {
      if (this.canvas.animating) {
        this.canvasData.animState = false;
        this.stopDraw();
        this.startDraw();
        this.$cookiz.set("isAnimate", false, {
          path: "/",
          maxAge: 3600 * 24 * 30 * 12 * 10,
          sameSite: true
        });
      } else {
        this.canvasData.animState = true;
        this.canvas.setAnimate(true);
        this.$cookiz.set("isAnimate", true, {
          path: "/",
          maxAge: 3600 * 24 * 30 * 12 * 10,
          sameSite: true
        });
        this.startDraw();
      }
    },
    toggleScreenshot() {
      clearTimeout(this.timeoutSS);
      if (this.canvasData.screenshot) {
        this.canvasData.screenshot = false;
        this.canvas.setShowScreenshot(false);
        this.$cookiz.set("showScreenshot", false, {
          path: "/",
          maxAge: 3600 * 24 * 30 * 12 * 10,
          sameSite: true
        });
        return this.canvas.setProfilePicId(-1);
      } else {
        this.canvas.setShowScreenshot(true);
        if (!this.canvas.ss_created)
          this.canvas
            .setSS_Url(this.ss_url)
            .setScreenshots(this.log.live_info.screenshot);

        this.canvasData.screenshot = true;
        this.$cookiz.set("showScreenshot", true, {
          path: "/",
          maxAge: 3600 * 24 * 30 * 12 * 10,
          sameSite: true
        });

        try {
          let num = this.selectedScreenshotNum;
          return this.canvas.setProfilePicId(num);
        } catch (e) {
          console.log(e);
          return this.canvas.setProfilePicId(-1);
        }
      }
    },

    dragging(ev) {
      requestAnimationFrame(() => {
        ev.preventDefault();
        ev = ev || window.event;
        let x = this.user_detail.dragX - ev.clientX;
        let y = this.user_detail.dragY - ev.clientY;
        this.user_detail.dragX = ev.clientX;
        this.user_detail.dragY = ev.clientY;
        this.user_detail.posX -= x;
        this.user_detail.posY -= y;
      });
    },
    startdrag(ev) {
      ev.preventDefault();
      this.user_detail.drag = true;
      this.user_detail.dragX = ev.clientX;
      this.user_detail.dragY = ev.clientY;
      this.user_detail.scrollPos = window.pageYOffset;
      document.onmouseup = this.stopdrag;
      document.onmousemove = this.dragging;
      window.onscroll = this.dragscroll;
    },
    stopdrag(ev) {
      ev.preventDefault();
      this.user_detail.drag = false;
      document.onmouseup = null;
      document.onmousemove = null;
      window.onscroll = null;
    },
    dragscroll(ev) {
      ev = ev.currentTarget.pageYOffset;
      requestAnimationFrame(() => {
        let newY = ev - this.user_detail.scrollPos;
        this.user_detail.scrollPos = ev;
        this.user_detail.posY += newY;
      });
    },
    fixGifts(arr) {
      return arr.map(item => {
        let map = new Map();
        for (let i of item.gifts) {
          if (map.has(i.gift_id)) {
            map.get(i.gift_id).num += i.num;
          } else {
            map.set(i.gift_id, i);
          }
        }
        item.gifts = Array.from(map.values());
        item.gifts = item.gifts.sort((a, b) => b.point - a.point);
        return item;
      });
    },
    toRupiah: function(total) {
      total = total * this.jpnrate;

      return (
        "Rp. " +
        total
          .toFixed(2)
          .replace(".", ",")
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
      );
    },
    time: function(timestamps) {
      return moment(timestamps).format("LLLL");
    },
    dur: function(ts1, ts2) {
      ts1 = new Date(ts1);
      ts2 = new Date(ts2);

      return this.humanize(moment.duration(Math.abs(ts2 - ts1)));
    },
    humanize(duration) {
      let type = {
        years: "tahun",
        days: "hari",
        hours: "jam",
        minutes: "menit",
        seconds: "detik"
      };
      let keys = Object.keys(type);
      let str = [];
      let i = 0;
      while (str.length < 2 && i < keys.length) {
        let time = duration.get(keys[i]);
        if (time) str.push(`${time} ${type[keys[i]]}`);
        i++;
      }

      if (str.length) return str.join(" ");
      return "0 detik";
    },
    relativeTime: function(timestamps) {
      return moment(timestamps).fromNow();
    },
    duration: function(date1, date2) {
      let d = Math.abs(new Date(date2) - new Date(date1));
      return moment.duration(d).humanize();
    },
    showUserDetail(user_id, x, y) {
      let reload = this.user_detail.user_id !== user_id;
      this.user_detail.user_id = user_id;
      this.user_detail.x = x;
      this.user_detail.y = y;

      if (!reload) return;

      this.user_detail.isLoading = true;
      this.user_detail.user = {};
      this.user_detail.show = true;
      this.$axios
        .get("/api/user/profile", {
          params: { user_id: user_id },
          progress: false
        })
        .then(res => {
          console.log(res);
          this.user_detail.user = res.data;
          this.user_detail.isLoading = false;
        })
        .catch(e => {
          this.user_detail.user = this.log.users[user_id];
          this.user_detail.isLoading = false;
        });
    },
    checkUserClick(evt) {
      let us = this.canvas.getUserByEvent(evt);
      if (us) {
        us.y += this.$refs.canvas.offsetParent.offsetTop;
        this.showUserDetail(us.user_id, us.x, us.y);
      }
    },
    calcHeight() {
      let calcTargets = document.getElementsByClassName("calcHeight");
      for (let t of calcTargets) {
        let value = t.firstElementChild.offsetHeight + "px";
        t.style.setProperty("--default-height", value);
      }
    },
    destroy() {
      try {
        this.animate = false;
        this.stopDraw();
        window.removeEventListener("scroll", this.controlPos);
        window.removeEventListener("resize", this.calcHeight);
        this.$refs.canvas.removeEventListener("click", this.checkUserClick);
        document.onmouseup = null;
        document.onmousemove = null;
        window.onscroll = null;
      } catch (e) {}
    }
  },

  async asyncData({ params, $axios, error, $cookiz }) {
    let jpnrate = $cookiz.get("jpn_rate");
    if (!jpnrate) jpnrate = $cookiz.get("jpn_rate", { fromRes: true });

    try {
      let { data } = await $axios.get(
        "/api/showroom/log/" + params.id + ".json"
      );

      let dataSR = data.data;
      if (dataSR)
        dataSR.gift_data.gift_log = dataSR.gift_data.gift_log.map(i => {
          i.gifts = i.gifts.map(g => {
            return {
              date: g.date,
              num: g.num,
              ...dataSR.gift_data.gift_list[g.gift_id]
            };
          });
          return i;
        });

      let animState = $cookiz.get("isAnimate");
      let ssstate = $cookiz.get("showScreenshot");
      return {
        log: dataSR || null,
        jpnrate: jpnrate,
        canvasData: {
          hideCon: true,
          animState: animState != null ? animState : true,
          screenshot: ssstate != null ? ssstate : true
        }
      };
    } catch (e) {
      return {
        log: null,
        error: true,
        jpnrate: jpnrate,
        canvasData: {
          hideCon: true,
          animState: $cookiz.get("isAnimate")
        }
      };
    }
  },
  async mounted() {
    try {
      if (!this.log) return;

      if (!this.log.live_info.stage_list) return;

      let c = this.$refs.canvas;
      let ctx = c.getContext("2d");

      ctx.canvas.width = 1920;
      ctx.canvas.height = 1080;

      this.canvas = new srCanvas(ctx, c, this.$refs.canvasDiv);

      this.$refs.canvas.addEventListener("click", this.checkUserClick);

      let s = this.selectedStageListNum;
      let sl = this.log.live_info.stage_list;
      if (s === null) return;
      // console.log(s);
      let stage_list = sl[s].list.map(i => this.log.users[i]);

      this.canvas.setStageList(stage_list);

      let bg = this.log.live_info.background_image;

      let profPic = this.log.room_info.img;

      this.canvas.setDefaultProfilePic(profPic);
      this.canvas.setShowScreenshot(this.canvasData.screenshot);

      if (this.canvasData.screenshot) {
        let screenshot = this.log.live_info.screenshot;
        if (screenshot && screenshot.list && screenshot.list.length) {
          this.canvas
            .setSS_Url(this.ss_url)
            .setScreenshots(this.log.live_info.screenshot);
          this.canvas.setProfilePicId(this.selectedScreenshotNum);
        } else {
          this.canvas.setScreenshotNotFound(true);
        }
      } else {
        this.canvas.setProfilePicId(-1);
      }
      this.canvas
        .setPodiumGifts(this.podiumGifts)
        .setBackground(bg ? bg : stageBackground)
        .setForeground(stageForeground)
        .setAnimate(this.canvasData.animState)
        .draw();

      this.drawCanvas();
    } catch (e) {
      console.log(e);
    }
  },
  beforeDestroy() {
    this.destroy();
  },
  $route(to, from) {
    this.destroy();
  }
};
</script>
