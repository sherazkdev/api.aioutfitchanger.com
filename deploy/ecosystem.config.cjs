/**
 * PM2 — single Next.js process (API + admin + broadcast scheduler).
 * Usage on VPS:
 *   cd /var/www/ai-outfit-changer   # or your app path
 *   npm ci && npm run build
 *   pm2 startOrReload deploy/ecosystem.config.cjs --env production
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: "ai-outfit-changer",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3020 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: "3020",
      },
    },
  ],
};
