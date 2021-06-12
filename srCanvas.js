let xB, yB;

module.exports = class srCanvas {
  constructor(ctx, canvas, div) {
    this.ss_created = false;
    this.ssnf = new Image();
    this.ssnf.src = "/img/ssnotfound.png";
    this.ssnf.onload = () => {
      if (this.ss_not_found)
        requestAnimationFrame(() => {
          this.draw();
        });
    };

    this.pp_image = new Map();

    this.usernameMap = new Map();
    this.canvasDiv = div;
    this.ctx = ctx;
    this.c = canvas;
    this.animating = true;
    xB = this.c.width / 1600;
    yB = this.c.height / 900;
    this.rotation = 0;
    this.maxRotation = 6;
    this.avasize = [120, 120];
    this.pos = this.getPos();
    this.hoveredUsername = null;
    this.stage_list = [];
    for (let i = 0; i < 100; i++) {
      let name = new Image();
      let ava = new Image();

      name.onload = () => {
        if (!this.animating)
          requestAnimationFrame(() => {
            this.draw();
          });
      };
      ava.onload = () => {
        if (!this.animating)
          requestAnimationFrame(() => {
            this.draw();
          });
      };

      ava.onerror = () => {
        ava.src = this.getAvatarUrl(1);
      };
      // let hover = new Image();

      this.stage_list.push({
        index: i,
        name: null,
        ava: ava,
        username: name,
        user_id: null,
        generateName: true,
        draw: true,
        jumping: false,
        jumpPos: {
          x: 0,
          y: 0,
          t: 0
        },
        jump: function() {
          if (this.jumping) return;
          this.jumping = true;
          this.jumpPos = {
            x: 0,
            y: 0,
            t: 0
          };
        },
        jumpFinish: function() {
          this.jumping = false;
        }
        // hover: hover,
        // draw: true,
      });
    }

    this.gift = {
      pos: {
        x: 960,
        y: 510,
        w: 750,
        h: 40
      },
      redzone: 550,
      rp: 80, /// persentase tak boleh di redzone
      w: 120,
      h: 120
    };

    // this.randomJump();
  }

  // set_ss(ss) {
  //   console.log(ss);
  //   this.ss = ss;
  //   return this;
  // }

  // set_ss_url(url) {
  //   console.log(url);

  //   this.ss_url = url;
  //   return this;
  // }

  getSpeed() {
    return 0.1 * 16 + Math.random() * 0.1;
  }

  setTime(time) {
    this.selectedTime = time;
    if (!this.animating) {
      clearTimeout(this.toDraw);
      this.toDraw = setTimeout(() => {
        requestAnimationFrame(() => {
          this.draw();
        });
      }, 500);
    }

    return this;
  }

  getRandomGiftPos() {
    let [x, y] = [-this.gift.pos.w / 2, -this.gift.pos.h / 2];
    let [xx, yy] = [
      x + Math.random() * this.gift.pos.w,
      y + Math.random() * this.gift.pos.h
    ];

    let teru = true;
    while (teru) {
      if (xx < this.gift.redzone / 2 && xx > -this.gift.redzone / 2) {
        let ran = Math.random() < this.gift.rp / 100;
        if (ran) {
          xx = x + Math.random() * this.gift.pos.w;
        } else {
          teru = false;
        }
      } else {
        teru = false;
      }
    }
    return {
      x: xx,
      y: yy
    };
  }

  setPodiumGifts(gifts) {
    this.podiumGifts = [];
    for (let g of gifts) {
      for (let i = 0; i < g.num; i++) {
        let img = new Image();
        img.onload = () => {
          if (!this.animating) {
            this.draw();
          }
        };
        img.src = g.image;
        let pos = this.getRandomGiftPos();
        this.podiumGifts.push({
          image: img,
          gift_id: g.gift_id,
          point: g.point,
          date: g.date,
          x: pos.x - this.gift.w / 2,
          y: pos.y - this.gift.h
        });
      }
    }

    this.podiumGifts = this.podiumGifts.sort((a, b) => a.y - b.y);
    this.visibleGifts = this.podiumGifts.length;
    return this;
  }

  drawPodiumGifts() {
    for (let g of this.podiumGifts) {
      if (this.selectedTime && new Date(g.date).getTime() > this.selectedTime)
        continue;
      if (!g.image) continue;
      this.ctx.setTransform(1, 0, 0, 1, this.gift.pos.x, this.gift.pos.y);
      this.ctx.drawImage(g.image, g.x, g.y, this.gift.w, this.gift.h);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  isUserHovered(event) {
    let mousePos = this.getMousePos(this.c, event);
    let nemu = null;
    let i = this.stage_list.length - 1;
    let pos = this.pos;
    let [x, y] = this.avasize;
    while (!nemu && i > 12) {
      let [posX, posY] = pos[i];
      if (mousePos.x > posX - x / 2 && mousePos.x < posX + y / 2) {
        if (mousePos.y < posY && mousePos.y > posY - y) {
          nemu = true;
        }
      }
      i--;
    }

    if (!nemu) {
      i = 0;
      while (!nemu && i < 13) {
        let [posX, posY] = pos[i];

        if (mousePos.x > posX - x / 2 && mousePos.x < posX + y / 2) {
          if (mousePos.y < posY && mousePos.y > posY - y) {
            nemu = true;
          }
        }
        i++;
      }
    }

    return nemu;
  }

  getUserByEvent(event) {
    let mousePos = this.getMousePos(this.canvasDiv, this.c, event);
    let nemu = null;
    let i = this.stage_list.length - 1;
    let pos = this.pos;
    let [x, y] = this.avasize;
    while (!nemu && i > 12) {
      let [posX, posY] = pos[i];

      if (mousePos.x > posX - x / 2 && mousePos.x < posX + y / 2) {
        if (mousePos.y < posY && mousePos.y > posY - y) {
          nemu = true;
          if (!this.stage_list[i].draw) return false;
          return {
            user_id: this.stage_list[i].user_id,
            x: mousePos.realX,
            y: mousePos.realY
          };
        }
      }
      i--;
    }

    if (!nemu) {
      i = 0;
      while (!nemu && i < 13) {
        let [posX, posY] = pos[i];

        if (mousePos.x > posX - x / 2 && mousePos.x < posX + y / 2) {
          if (mousePos.y < posY && mousePos.y > posY - y) {
            nemu = true;
            if (!this.stage_list[i].draw) return false;
            return {
              user_id: this.stage_list[i].user_id,
              x: mousePos.realX,
              y: mousePos.realY
            };
          }
        }
        i++;
      }
    }

    return false;
  }

  getMousePos(canvasDiv, canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    let recccc = canvasDiv.getBoundingClientRect();
    return {
      realX: evt.x - recccc.left,
      realY: evt.y - recccc.top,
      x: ((evt.x - rect.left) / rect.width) * canvas.width,
      y: ((evt.y - rect.top) / rect.height) * canvas.height
    };
  }

  loadImage(url) {
    let image = new Image();
    image.src = url;
    return image;
  }
  loadImageAsync(url) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = url;
      image.onload = function() {
        return resolve(image);
      };
      image.onerror = function() {
        return resolve(new Image());
      };
    });
  }

  setAnimate(bool) {
    this.animating = bool;
    return this;
  }

  setBackground(bg) {
    let img = new Image();
    img.onload = () => {
      if (!this.animating)
        requestAnimationFrame(() => {
          this.draw();
        });
    };
    img.src = bg;
    this.bg = img;
    return this;
  }

  setForeground(fg) {
    let img = new Image();
    img.onload = () => {
      if (!this.animating)
        requestAnimationFrame(() => {
          this.draw();
        });
    };
    img.src = fg;
    this.fg = img;
    return this;
  }

  setScreenshotNotFound(bool) {
    this.ss_not_found = bool;
    if (bool) this.setProfilePic(this.defaultProfilePic);
    if (!this.animating)
      requestAnimationFrame(() => {
        this.draw();
      });
  }

  setShowScreenshot(bool) {
    this.show_screenshot = bool;
    if (!this.animating)
      requestAnimationFrame(() => {
        this.draw();
      });
    return this;
  }

  setDefaultProfilePic(url) {
    this.defaultProfilePic = url;
    let img = new Image();
    img.src = url;
    img.onload = () => {
      if (!this.animating)
        if (this.pp_id == -1)
          requestAnimationFrame(() => {
            this.draw();
          });
    };
    this.pp_image.set(-1, img);
    return this;
  }

  setSS_Url(url) {
    this.ss_url = url;
    return this;
  }

  setScreenshots(ss) {
    let folder = ss.folder;
    let format = ss.format;

    for (let [i, s] of ss.list.entries()) {
      let img = new Image();
      this.pp_image.set(i, img);
      img.src = `${this.ss_url}/${folder}/${s}.${format}`;
      img.onload = () => {
        if (!this.animating)
          if (this.pp_id == i)
            requestAnimationFrame(() => {
              this.draw();
            });
      };

      img.onerror = () => {
        this.pp_image.set(i, null);
      };
    }

    this.ss_created = true;

    return this;
  }

  setProfilePicId(id) {
    try {
      if (this.pp_id == id) return this;
      this.pp_id = id;
      let image = this.pp_image.get(id);
      if (image == null) {
        this.pp_id = -1;
        image = this.pp_image.get(-1);
      }
      this.profilePic = image;
      if (!this.animating)
        requestAnimationFrame(() => {
          this.draw();
        });

      return this;
    } catch (e) {
      console.log(e);
      return this;
    }
  }
  // setScreenshotId(pp) {
  //   if (this.pp_url == pp) return this;
  //   this.pp_url = pp;
  //   if (!this.profilePic) {
  //     this.profilePic = new Image();
  //     this.profilePic.onload = () => {
  //       if (!this.animating)
  //         requestAnimationFrame(() => {
  //           this.draw();
  //         });
  //     };
  //     this.profilePic.onerror = () => {
  //       this.ss_not_found = true;
  //       this.setProfilePic(this.defaultProfilePic);
  //     };
  //   }

  //   this.profilePic.src = pp;
  //   return this;
  // }

  setProfilePic(pp) {
    if (this.pp_url == pp) return this;
    this.pp_url = pp;
    if (!this.profilePic) {
      this.profilePic = new Image();
      this.profilePic.onload = () => {
        if (!this.animating)
          requestAnimationFrame(() => {
            this.draw();
          });
      };
    }

    this.profilePic.src = pp;
    return this;
  }

  createUsername(penonton) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      let fS = 14; // font size
      var ctx = canvas.getContext("2d");
      ctx.font = "bolder " + fS + "px Arial";
      let username = penonton.name || "";
      let [x, y] = this.avasize;
      let mTw = u => ctx.measureText(u).width;
      let maxBW = x + 20;
      let bW = x + 20; // boxWidth
      if (mTw(username) + 20 > maxBW) {
        while (mTw(username) + 20 > maxBW) {
          username = username.slice(0, username.length - 1);
        }
      } else {
        bW = mTw(username) + 20;
        if (bW < 70) bW = 70;
      }

      // console.log(username);

      let bH = 30; // boxHeight
      if (penonton.index < 13) {
        bH = 55;
      }

      canvas.width = bW;
      canvas.height = bH;

      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.3;
      // this.ctx.fillRect(0, -y - bH / 2, bW, bH);
      ctx.fillRect(0, 0, bW, bH);
      ctx.globalAlpha = 1;
      ctx.textBaseline = "middle";

      if (penonton.index < 13) {
        ctx.textAlign = "left";
        ctx.font = "bolder " + (fS + 1) + "px Arial";
        ctx.fillStyle = "#F2F20D";
        ctx.fillText(penonton.index + 1 + "位", 10, bH - 35);
      }

      ctx.font = "bolder " + fS + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(username, bW / 2, bH - 15);
      ctx.stroke();
      // penonton.username.src = canvas.toDataURL();
      let imagee = new Image();
      imagee.onload = () => {
        penonton.username = imagee;
        if (!this.animating)
          requestAnimationFrame(() => {
            this.draw();
          });
        resolve();
      };
      imagee.onerror = () => {
        resolve(imagee);
      };

      imagee.src = canvas.toDataURL("image/jpg");
      penonton.generateName = false;
    });
  }

  createUsernameImg(username) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      let fS = 14; // font size
      var ctx = canvas.getContext("2d");
      ctx.font = "bolder " + fS + "px Arial";
      username = username || "";
      let [x, y] = this.avasize;
      let mTw = u => ctx.measureText(u).width;
      let maxBW = x + 20;
      let bW = x + 20; // boxWidth
      if (mTw(username) + 20 > maxBW) {
        while (mTw(username) + 20 > maxBW) {
          username = username.slice(0, username.length - 1);
        }
      } else {
        bW = mTw(username) + 20;
        if (bW < 70) bW = 70;
      }

      // console.log(username);

      let bH = 30; // boxHeight
      // if (penonton.index < 13) {
      //   bH = 55;
      // }

      canvas.width = bW;
      canvas.height = bH;

      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.3;
      // this.ctx.fillRect(0, -y - bH / 2, bW, bH);
      ctx.fillRect(0, 0, bW, bH);
      ctx.globalAlpha = 1;
      ctx.textBaseline = "middle";

      // if (penonton.index < 13) {
      //   ctx.textAlign = "left";
      //   ctx.font = "bolder " + (fS + 1) + "px Arial";
      //   ctx.fillStyle = "#F2F20D";
      //   ctx.fillText(penonton.index + 1 + "位", 10, bH - 35);
      // }

      ctx.font = "bolder " + fS + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(username, bW / 2, bH - 15);
      ctx.stroke();
      // penonton.username.src = canvas.toDataURL();
      let imagee = new Image();
      imagee.onload = () => {
        resolve(imagee);
      };
      imagee.onerror = () => {
        resolve(imagee);
      };

      imagee.src = canvas.toDataURL("image/jpg");
      // penonton.generateName = false;
    });
  }

  async generateUsernameText() {
    for (let penonton of this.stage_list) {
      if (penonton.generateName) {
        await this.createUsername(penonton);
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // username = this.stage_list[i].name;
        // ctx.font = "bolder " + (fS + 10) + "px Arial";
        // let ww = mTw(username);
        // canvas.width = ww + 30;
        // canvas.height = 60;
        // ctx.globalAlpha = 0.8;
        // ctx.fillStyle = "black";
        // ctx.textAlign = "center";
        // ctx.textBaseline = "middle";
        // ctx.font = "bolder " + (fS + 10) + "px Arial";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = "white";
        // ctx.globalAlpha = 1;
        // ctx.fillText(username, canvas.width / 2, canvas.height / 2);
        // this.stage_list[i].hover.src = canvas.toDataURL();
        // console.log(dataurl);
        // requestAnimationFrame(() => {});
      }
    }
    // for (let i = 0; i < this.stage_list.length; i++) {
    //   if (this.stage_list[i].generateName) {
    //     requestAnimationFrame(() => {
    //       let canvas = document.createElement("canvas");
    //       canvas.width = 1000;
    //       canvas.height = 1000;
    //       let fS = 14; // font size
    //       var ctx = canvas.getContext("2d");
    //       ctx.font = "bolder " + fS + "px Arial";
    //       let username = this.stage_list[i].name || "";
    //       let [x, y] = this.avasize;
    //       let mTw = (u) => ctx.measureText(u).width;
    //       let maxBW = x + 20;
    //       let bW = x + 20; // boxWidth
    //       if (mTw(username) + 20 > maxBW) {
    //         while (mTw(username) + 20 > maxBW) {
    //           username = username.slice(0, username.length - 1);
    //         }
    //       } else {
    //         bW = mTw(username) + 20;
    //         if (bW < 70) bW = 70;
    //       }

    //       // console.log(username);

    //       let bH = 30; // boxHeight
    //       if (i < 13) {
    //         bH = 55;
    //       }

    //       canvas.width = bW;
    //       canvas.height = bH;

    //       ctx.fillStyle = "black";
    //       ctx.globalAlpha = 0.3;
    //       // this.ctx.fillRect(0, -y - bH / 2, bW, bH);
    //       ctx.fillRect(0, 0, bW, bH);
    //       ctx.globalAlpha = 1;
    //       ctx.textBaseline = "middle";

    //       if (i < 13) {
    //         ctx.textAlign = "left";
    //         ctx.font = "bolder " + (fS + 1) + "px Arial";
    //         ctx.fillStyle = "#F2F20D";
    //         ctx.fillText(i + 1 + "位", 10, bH - 35);
    //       }

    //       ctx.font = "bolder " + fS + "px Arial";
    //       ctx.textAlign = "center";
    //       ctx.fillStyle = "white";
    //       ctx.fillText(username, bW / 2, bH - 15);
    //       ctx.stroke();
    //       this.stage_list[i].username.src = canvas.toDataURL();
    //       this.stage_list[i].generateName = false;

    //       // ctx.clearRect(0, 0, canvas.width, canvas.height);
    //       // username = this.stage_list[i].name;
    //       // ctx.font = "bolder " + (fS + 10) + "px Arial";
    //       // let ww = mTw(username);
    //       // canvas.width = ww + 30;
    //       // canvas.height = 60;
    //       // ctx.globalAlpha = 0.8;
    //       // ctx.fillStyle = "black";
    //       // ctx.textAlign = "center";
    //       // ctx.textBaseline = "middle";

    //       // ctx.font = "bolder " + (fS + 10) + "px Arial";
    //       // ctx.fillRect(0, 0, canvas.width, canvas.height);
    //       // ctx.fillStyle = "white";
    //       // ctx.globalAlpha = 1;
    //       // ctx.fillText(username, canvas.width / 2, canvas.height / 2);
    //       // this.stage_list[i].hover.src = canvas.toDataURL();
    //       // console.log(dataurl);
    //     });
    //   }
    // }
  }

  async setUserList(user_list) {
    if (!this.usernameMap) this.usernameMap = new Map();
    for (let user of user_list) {
      this.usernameMap.set(
        user.user_id,
        await this.createUsernameImg(user.name)
      );
    }
  }

  getAvatarUrl(id) {
    return `https://image.showroom-cdn.com/showroom-prod/image/avatar/${id}.png?v=87`;
  }

  async setStageList(stage_list) {
    console.log(stage_list);
    // this.stage_list = stage_list;
    // console.log(stage_list);
    if (!this.setId) this.setId = 0;
    this.setId++;
    let id = this.setId;

    for (let i = stage_list.length; i < 100; i++) {
      this.stage_list[i].draw = false;
    }

    for (let penonton of this.stage_list) {
      let i = penonton.index;
      if (id !== this.setId) break;
      if (stage_list[i] == null) {
        penonton.draw = false;
      } else {
        penonton.draw = true;
        penonton.user_id = stage_list[i].user_id;
        if (penonton.name != stage_list[i].name) {
          penonton.name = stage_list[i].name;
          penonton.username = null;
          penonton.generateName = true;
          // penonton.username = this.usernameMap.get(penonton.user_id);
        }

        if (penonton.avaId != stage_list[i].avatar_id) {
          penonton.avaId = stage_list[i].avatar_id;
          // let avaimg = new Image();
          // avaimg.onload = () => {
          //   penonton.ava = avaimg;
          // };
          // avaimg.src = stage_list[i].avatar_url;
          penonton.ava.src = this.getAvatarUrl(stage_list[i].avatar_id);
        }
        await this.createUsername(penonton);
      }
    }

    // for (let [i, penonton] of this.stage_list.entries()) {
    //   await this.createUsername(penonton);
    // }

    // this.generateUsernameText();
    // this.randomJump();
    // this.ava = stage_list.map((i) => {
    //   // return this.loadImage(i.avatar_url);
    //   let img = new Image();
    //   img.src = i.avatar_url;
    //   return img;
    // });
    return this;
  }

  randomJump() {
    setInterval(() => {
      console.log(
        this.stage_list[Math.floor(Math.random() * this.stage_list.length)]
      );
      this.stage_list[
        Math.floor(Math.random() * this.stage_list.length)
      ].jump();
    }, 1300);
    setInterval(() => {
      this.stage_list[
        Math.floor(Math.random() * this.stage_list.length)
      ].jump();
    }, 800);
    setInterval(() => {
      this.stage_list[
        Math.floor(Math.random() * this.stage_list.length)
      ].jump();
    }, 1800);
  }

  getPPPos() {
    this.ppdata = {
      width: 535 * xB,
      height: ((this.profilePic.height * 535) / this.profilePic.width) * yB,
      x: 534 * xB,
      y: 82 * yB
    };
  }

  getSSNFPos() {
    this.ssnfdata = {
      width: (535 * xB) / 1.6,
      height: ((this.ssnf.height * 535) / 1.6 / this.ssnf.width) * yB,
      x: 534 * xB + (535 * xB - (535 * xB) / 1.6) / 2,
      y:
        82 * yB +
        (((this.profilePic.height * 535) / this.profilePic.width) * yB) / 2 -
        (((this.ssnf.height * 535) / 1.6 / this.ssnf.width) * yB) / 2
    };
  }

  drawProfilePic() {
    // let profilePic = await this.loadImage(this.profilePic);

    try {
      if (!this.ppdata || this.ppdata.width) this.getPPPos();
      let pos = this.ppdata;

      this.ctx.drawImage(this.profilePic, pos.x, pos.y, pos.width, pos.height);

      if (this.show_screenshot && this.pp_id == -1) {
        if (!this.ssnfdata || this.ssnfdata.width) this.getSSNFPos();
        let spos = this.ssnfdata;
        this.ctx.drawImage(this.ssnf, spos.x, spos.y, spos.width, spos.height);
      }
      // this.ctx.drawImage(
      //   this.profilePic,
      //   534 * xB,
      //   82 * yB,
      //   535 * xB,
      //   ((this.profilePic.height * 535) / this.profilePic.width) * yB
      // );
      // if (!this.ss_not_found)
      //   this.ctx.drawImage(
      //     this.ssnf,
      //     534 * xB,
      //     82 * yB,
      //     (535 * xB) / 1.5,
      //     ((this.ssnf.height * 535) / 1.5 / this.ssnf.width) * yB
      //   );
    } catch (e) {}
  }

  drawBackground() {
    // let bg = await this.loadImage(this.bg);
    this.ctx.drawImage(this.bg, 0, 0, this.c.width, this.c.height);
  }

  drawForeground() {
    // let fbg = await this.loadImage(this.fg);
    this.ctx.drawImage(this.fg, 0, 0, this.c.width, this.c.height);
  }

  jumpSpeed() {
    let s = 0.75; // berapa detik animasinya
    return 180 / s;
  }

  calcJump(penonton) {
    if (!this.animating) return;
    if (!penonton) return;

    if (!penonton.jumpPos.speed) penonton.jumpPos.speed = this.jumpSpeed();

    penonton.jumpPos.t += penonton.jumpPos.speed * this.dt;
    if (penonton.jumpPos.t > 180) penonton.jumpFinish();
    penonton.jumpPos.y = Math.sin((penonton.jumpPos.t * Math.PI) / 180) * 100;
    // console.log(penonton.jumpPos.y);
  }

  calcRotate(penonton) {
    if (!this.animating) return;
    if (!penonton) return;
    if (penonton.jumping) return;
    if (!penonton.speed) penonton.speed = this.getSpeed();
    if (!penonton.time) penonton.time = Math.random() * 360;

    penonton.time += penonton.speed * this.dt;
    penonton.rotation = Math.sin(penonton.time) * this.maxRotation;
  }

  drawPenonton(penonton, num, posX, posY, resize = 90) {
    if (!penonton.draw) return;
    resize = resize / 100; // persen
    /// podium
    // let user = await this.loadImage(ava);
    let ava = penonton.ava;
    let username = penonton.username;
    let [x, y] = this.avasize.map(i => i * resize);
    // let [xx, yy] = [x / 2, y];
    // let mousePos = this.mousePos;
    // console.log(mousePos);

    // this.ctx.save();

    if (this.animating) {
      if (penonton.jumping) {
        this.calcJump(penonton);
        this.ctx.setTransform(1, 0, 0, 1, posX, posY - penonton.jumpPos.y);
      } else {
        this.calcRotate(penonton);
        this.ctx.setTransform(1, 0, 0, 1, posX, posY);
        this.ctx.rotate((penonton.rotation * Math.PI) / 180);
      }
    } else {
      this.ctx.setTransform(1, 0, 0, 1, posX, posY);
    }
    // this.ctx.translate(this.c.width / 2, this.c.height / 2);
    this.ctx.drawImage(ava, -x / 2, -y, x, y);

    if (username)
      this.ctx.drawImage(
        username,
        -username.width / 2,
        -y - username.height + 20,
        username.width,
        username.height
      );

    // this.ctx.font = fS + "px Arial";
    // this.ctx.fillText(username, -xx + x / 2, -yy);
    this.ctx.stroke();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.rotate((0 * Math.PI) / 180);
    // this.ctx.restore();
  }

  getPos() {
    let pos = [
      [800 * xB, 520 * yB],
      [735 * xB, 530 * yB],
      [865 * xB, 530 * yB]
    ];

    let [x, y] = pos[0];
    let xJ = 130 * xB; // base jarak x
    let xGap = 60 * xB;
    let yJ = 20 * yB;
    let yGap = 10 * yB;

    for (let i = 0; i < 5; i++) {
      let xx = x - (xJ + xGap * i);
      pos.push([xx, y + yJ - yGap * i]);

      let xxx = x + (xJ + xGap * i);
      pos.push([xxx, y + yJ - yGap * i]);
    }

    [x, y] = [350 * xB, 600 * yB];
    xJ = 140 * xB; // base jarak x
    xGap = 60 * xB;
    yJ = 20 * yB;
    yGap = 10 * yB;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 16; j++) {
        let xz = x + j * xGap;
        let yz = y + xGap * i;
        pos.push([xz, yz]);
      }
    }

    return pos;
  }

  loadAvatars() {
    // this.ava = await Promise.all(this.ava);
  }

  calcDeltaTime(time) {
    this.time = time;
    if (!this.lastdate) {
      this.lastdate = time;
      this.dt = 0;
    } else {
      this.dt = (time - this.lastdate) / 1000;
      this.lastdate = time;
    }
  }

  drawTop100() {
    let pos = this.pos;
    if (this.stage_list.length >= 13) {
      for (let i = 12; i >= 0; i--) {
        this.drawPenonton(this.stage_list[i], i, ...pos[i]);
      }
      for (let i = 13; i < this.stage_list.length; i++) {
        this.drawPenonton(this.stage_list[i], i, ...pos[i]);
      }
    } else {
      for (let i = this.stage_list.length - 1; i >= 0; i--) {
        this.drawPenonton(this.stage_list[i], i, ...pos[i]);
      }
    }
  }

  async draw(time) {
    this.clear();
    if (this.animating) this.calcDeltaTime(time);
    this.drawProfilePic();
    this.drawBackground();

    this.drawPodiumGifts();
    this.drawTop100();

    this.ctx.globalAlpha = 0.9;
    this.drawForeground();
    this.ctx.globalAlpha = 1;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
  }
};
