module.exports = {
  apps: [
    {
      script: "./dist/index.js",
      name: "googletv-socket.io",
      node_args: "-r dotenv/config",
    },
  ],
}
