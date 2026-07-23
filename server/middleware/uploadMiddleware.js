import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename(req, file, callback) {
    const originalExtension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueFileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${originalExtension}`;

    callback(null, uniqueFileName);
  },
});

const cvFileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    "application/pdf",
  ];

  const fileExtension = path
    .extname(file.originalname)
    .toLowerCase();

  const isPDFExtension = fileExtension === ".pdf";
  const isPDFMimeType = allowedMimeTypes.includes(
    file.mimetype
  );

  if (isPDFExtension && isPDFMimeType) {
    callback(null, true);
  } else {
    callback(
      new Error("Only PDF CV files are allowed."),
      false
    );
  }
};

const imageFileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

export const uploadCV = multer({
  storage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
