const multer = require("multer");

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, JPEG, PNG and WEBP images are allowed"),
      false
    );
  }

  cb(null, true);
};

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(
      new Error("Only PDF files are allowed for verification documents"),
      false
    );
  }

  cb(null, true);
};

const uploadVehicleImages = multer({
  storage,
  limits: {
    files: 8,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
}).array("images", 8);

const uploadVerificationDocuments = multer({
  storage,
  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: pdfFileFilter,
}).fields([
  {
    name: "registrationDocument",
    maxCount: 1,
  },
  {
    name: "insuranceDocument",
    maxCount: 1,
  },
]);

module.exports = {
  uploadVehicleImages,
  uploadVerificationDocuments,
};