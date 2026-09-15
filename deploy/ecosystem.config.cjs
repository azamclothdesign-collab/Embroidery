module.exports = {
  apps: [
    {
      name: "embroidery-api",
      cwd: "/var/www/embroidery/Backend",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "embroidery-web",
      cwd: "/var/www/embroidery/Frontend",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
