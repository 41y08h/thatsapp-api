import axios from "axios";
import fs from "fs";
import path from "path";
import config from "../config";

async function uploadFile(base64: string, filename: string) {
  if (process.env.NODE_ENV === "development") {
    const url = `http://localhost:5000/localstore/${filename}`;
    fs.writeFileSync(path.join(config.paths.localstore, filename), base64, {
      encoding: "base64",
    });

    return url;
  }

  const repo = `https://api.github.com/repos/41y08h/GHaaS/contents/${filename}`;
  const url = `https://github.com/41y08h/GHaaS/raw/main/${filename}`;

  await axios({
    method: "PUT",
    url: repo,
    data: {
      message: `Add file ${filename}`,
      content: base64,
    },
    headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
    maxBodyLength: 5e8,
  });

  return url;
}

const GHaaS = {
  uploadFile,
};

export default GHaaS;
