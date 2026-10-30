import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import { badRequest } from "../response/error.response.js";


export const validationMagicNumbers = (allowedTypes = []) => {
  const allowed = allowedTypes.map((type) => type === "image/jpg" ? "image/jpeg" : type);

  return async (req, res, next) => {
    const files = req.file ? [req.file] : req.files || [];

    try {
      for (const file of files) {
        const buffer = await fs.promises.readFile(file.path);
        const type = await fileTypeFromBuffer(buffer);

        if (!type || !allowed.includes(type.mime)) {
          throw badRequest(`Invalid file content: ${file.originalname}`);
        }
      }
      next();
    } catch (error) {
      await Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => {})));
      
      next(error.statusCode ? error : badRequest(error.message));
    }
  };
};
   

export const allowedMimeTypes ={
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    document: ['application/pdf', 'application/msword', 'application/vnd.ms-excel'],
};

export const localFileUpload = ({custmoPath = "general", validTypes = []}) => {
    const basePath = `uploads/${custmoPath}`;

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let userPath = basePath;
            if (req.user?._id) {
                userPath += `/${req.user._id}`;
            }
            const fullPath = path.resolve(`./${userPath}`);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
          const ext = path.extname(file.originalname);
          const baseName = path.basename(file.originalname, ext);

          const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
          const dateStr = Date.now();
          const uniqueSuffix = `${baseName}-${dateStr}-${randomFourDigits}${ext}`;

          file.finalPath = `${basePath}/${req.user._id}/${uniqueSuffix}`;
          cb(null, uniqueSuffix);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (!validTypes.includes(file.mimetype)) {
            return cb(badRequest('Invalid file type. Only image files are allowed.'), false);
        }
        cb(null, true);
    };

    return multer({ storage, fileFilter });
}
