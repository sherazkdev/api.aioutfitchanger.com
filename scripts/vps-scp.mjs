/**
 * Upload a local file via SFTP. Password via VPS_SSH_PASSWORD env only.
 * Usage: node scripts/vps-scp.mjs <localPath> <remotePath>
 */
import { createReadStream, statSync } from "fs";
import { Client } from "ssh2";

const host = process.env.VPS_SSH_HOST || "13.140.131.209";
const user = process.env.VPS_SSH_USER || "root";
const password = process.env.VPS_SSH_PASSWORD;
const [localPath, remotePath] = process.argv.slice(2);

if (!password || !localPath || !remotePath) {
  console.error("Usage: VPS_SSH_PASSWORD=... node scripts/vps-scp.mjs <local> <remote>");
  process.exit(1);
}

const size = statSync(localPath).size;
const conn = new Client();
conn
  .on("ready", () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(err.message);
        conn.end();
        process.exit(1);
      }
      const rs = createReadStream(localPath);
      const ws = sftp.createWriteStream(remotePath);
      ws.on("close", () => {
        console.log("uploaded", remotePath, "bytes", size);
        conn.end();
      });
      ws.on("error", (e) => {
        console.error(e.message);
        conn.end();
        process.exit(1);
      });
      rs.pipe(ws);
    });
  })
  .on("error", (e) => {
    console.error("SSH error:", e.message);
    process.exit(1);
  })
  .connect({ host, port: 22, username: user, password, readyTimeout: 120000 });
