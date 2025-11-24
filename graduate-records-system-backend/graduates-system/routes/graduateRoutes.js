// routes/graduateRoutes.js
const express = require("express");
const router = express.Router();
const { addGraduates } = require("../controllers/graduateController");
const { protect } = require("../middleware/authMiddleware");
const { formidable } = require("formidable"); // 🔥 التصحيح هنا

router.post(
  "/graduates",
  protect,
  (req, res, next) => {
    console.log("🔵 [FORMIDABLE] Starting file upload...");

    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log("🔴 [FORMIDABLE ERROR]:", err.message);
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
      }

      console.log("🔵 [FORMIDABLE] Fields:", Object.keys(fields));
      console.log("🔵 [FORMIDABLE] Files:", Object.keys(files));

      // خلي الملف يبقى متاح في req.file
      if (files && Object.keys(files).length > 0) {
        const firstFileKey = Object.keys(files)[0];
        const file = files[firstFileKey][0];

        req.file = {
          originalname: file.originalFilename,
          buffer: require("fs").readFileSync(file.filepath),
          mimetype: file.mimetype,
          size: file.size,
        };

        console.log("🟢 [FORMIDABLE] File processed:", req.file.originalname);
      } else {
        console.log("🔴 [FORMIDABLE] No files found");
      }

      next();
    });
  },
  addGraduates
);

module.exports = router;
