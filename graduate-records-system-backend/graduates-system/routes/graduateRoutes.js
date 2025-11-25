const express = require("express");
const router = express.Router();
const { addGraduates } = require("../controllers/graduateController");
const { protect } = require("../middleware/authMiddleware");

// middleware بسيط لمعالجة الملفات
const handleFileUpload = (req, res, next) => {
  console.log("🔵 [FILE UPLOAD] Starting file processing...");

  if (!req.headers["content-type"]?.includes("multipart/form-data")) {
    // لو مش ملف، كمل عادي
    return next();
  }

  let body = "";
  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
    body += chunk.toString();
  });

  req.on("end", () => {
    console.log("🔵 [FILE UPLOAD] File processing completed");

    // معالجة بسيطة للبيانات
    try {
      // هنا تقدر تعمل parsing للـ multipart data
      // لكن علشان الاختبار، كمل مباشرة
      req.body = {}; // بيانات مؤقتة
      req.file = {
        originalname: "test.xlsx",
        buffer: Buffer.concat(chunks),
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: Buffer.concat(chunks).length,
      };

      console.log("🟢 [FILE UPLOAD] File processed");
      next();
    } catch (error) {
      console.log("🔴 [FILE UPLOAD ERROR]:", error);
      next();
    }
  });
};

router.post("/graduates", protect, handleFileUpload, addGraduates);

module.exports = router;
