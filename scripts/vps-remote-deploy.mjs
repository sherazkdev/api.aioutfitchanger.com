/**
 * One-off remote deploy via SSH (password from env VPS_SSH_PASS only — never commit).
 * Usage: VPS_SSH_PASS=... node scripts/vps-remote-deploy.mjs
 */
import { Client } from "ssh2";

const host = process.env.VPS_HOST || "13.140.131.209";
const user = process.env.VPS_USER || "root";
const password = process.env.VPS_SSH_PASS?.trim();
const appRoot = process.env.VPS_APP_ROOT || "/var/www/ai-outfit-changer";

if (!password) {
  console.error("VPS_SSH_PASS env required");
  process.exit(1);
}

const script = `
set -e
cd ${appRoot}
echo "=== git pull ==="
git pull origin main
echo "=== npm install ==="
npm install
echo "=== build ==="
npm run build
echo "=== seed prompts (Mongo promptCommand only) ==="
npm run assets:seed-prompts
echo "=== pm2 reload ==="
pm2 reload ai-outfit-changer || pm2 startOrReload deploy/ecosystem.config.cjs --env production
echo "=== verify production prompts ==="
node scripts/verify-production-prompts.mjs https://appworkspro.com
echo "=== done ==="
`.trim();

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream
        .on("close", (code) => {
          if (code === 0) resolve(out);
          else reject(new Error(`exit ${code}\n${out}`));
        })
        .on("data", (d) => {
          const s = d.toString();
          out += s;
          process.stdout.write(s);
        })
        .stderr.on("data", (d) => process.stderr.write(d.toString()));
    });
  });
}

const conn = new Client();
conn
  .on("ready", async () => {
    try {
      console.log("SSH connected to", host);
      await exec(conn, script);
      conn.end();
      process.exit(0);
    } catch (e) {
      console.error(e.message || e);
      conn.end();
      process.exit(1);
    }
  })
  .on("error", (e) => {
    console.error("SSH error:", e.message);
    process.exit(1);
  })
  .connect({
    host,
    port: 22,
    username: user,
    password,
    readyTimeout: 30000,
  });
