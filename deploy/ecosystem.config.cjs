// PM2 process file. Run as the unprivileged "embroidery" user:
//   sudo -u embroidery pm2 start deploy/ecosystem.config.cjs && sudo -u embroidery pm2 save
const root = "/var/www/embroidery-store";

module.exports = {
  apps: [
    {
      name: "emb-api",
      cwd: `${root}/backend`,
      script: "src/server.ts",
      interpreter: "node",
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      kill_timeout: 12000,
      env: { NODE_ENV: "production" },
    },
    {
      name: "emb-web",
      cwd: `${root}/frontend`,
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M",
      kill_timeout: 12000,
      env: { NODE_ENV: "production" },
    },
  ],
};
