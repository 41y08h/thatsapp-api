import path from "path";

const config = {
  paths: {
    localstore: path.join(__dirname, "../localstore"),
    temp: path.join(__dirname, "../temp"),
  },
};

export default config;
