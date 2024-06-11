import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import GHaaS from "../../services/GHaaS";

const uploadMedia: RequestHandler = async (req, res) => {
  const file = req.files && (req.files.media as UploadedFile);

  if (!file)
    return res.status(400).json({
      error: {
        code: 400,
        message: "No file was uploaded",
      },
    });

  const extension = file.mimetype.split("/")[1];
  const filename = `${req.user.username}-${new Date().getTime()}.${extension}`;

  const url = await GHaaS.uploadFile(file.data.toString("base64"), filename);

  res.json({
    url,
  });
};

export default uploadMedia;
