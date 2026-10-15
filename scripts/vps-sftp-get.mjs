import { createWriteStream } from "fs";
import { Client } from "ssh2";

const host = process.env.VPS_SSH_HOST || "13.140.131.209";
const user = process.env.VPS_SSH_USER || "root";
const password = process.env.VPS_SSH_PASSWORD;
const [remote, local] = process.argv.slice(2);
if (!password || !remote || !local) process.exit(1);

const conn = new Client();
conn
  .on("ready", () => {
    conn.sftp((err, sftp) => {
      if (err) throw err;
      sftp.fastGet(remote, local, (e) => {
        conn.end();
        if (e) {
          console.error(e.message);
          process.exit(1);
        }
        console.log("saved", local);
      });
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  })
  .connect({ host, port: 22, username: user, password, readyTimeout: 60000 });
