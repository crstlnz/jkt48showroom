module.exports = {
  apps: [
    {
      name: "JKT48Showroom",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
    },
  ],
};
