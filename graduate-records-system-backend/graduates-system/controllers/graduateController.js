// controllers/graduateController.js
const asyncHandler = require("express-async-handler");
const { Graduate } = require("../models");
const XLSX = require("xlsx");

/**
 * POST /graduates-system/api/graduates
 * Handle both JSON data and file uploads (Excel, JSON, CSV)
 */
const addGraduates = asyncHandler(async (req, res) => {
  console.log("🎯 [CONTROLLER] Reached addGraduates controller");
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const currentUserId = req.user.id;
  const results = {
    added: 0,
    duplicates: 0,
    errors: [],
    invalidStructure: 0,
  };

  const addedGraduates = [];
  let graduatesArray = [];

  console.log("🔵 [PROCESSOR] Starting data processing...");

  try {
    // 🔥 تحديد مصدر البيانات
    if (req.file) {
      // ملف مرفوع
      console.log(
        "🔵 [PROCESSOR] Processing uploaded file:",
        req.file.originalname
      );
      graduatesArray = await processUploadedFile(req.file);
    } else if (req.body && req.body.graduates) {
      // JSON مباشر من الـbody
      console.log("🔵 [PROCESSOR] Processing JSON data from body");
      graduatesArray = Array.isArray(req.body.graduates)
        ? req.body.graduates
        : [req.body.graduates];
    } else {
      return res.status(400).json({
        message: "No data provided. Please upload a file or send JSON data.",
      });
    }

    console.log("🔵 [PROCESSOR] Extracted data:", graduatesArray);

    if (graduatesArray.length === 0) {
      return res.status(400).json({
        message: "No valid data found in the provided source.",
      });
    }

    // معالجة كل خريج
    for (const graduateData of graduatesArray) {
      try {
        // التحقق من الهيكل
        const validationResult = validateGraduateStructure(graduateData);
        if (!validationResult.isValid) {
          results.invalidStructure++;
          results.errors.push({
            data: graduateData,
            error: `Invalid structure: ${validationResult.message}`,
          });
          continue;
        }

        // التحقق من التكرار
        const existingGraduate = await Graduate.findOne({
          where: { national_id: graduateData.nationalId },
        });

        if (existingGraduate) {
          results.duplicates++;
          results.errors.push({
            nationalId: graduateData.nationalId,
            error: "Duplicate national ID",
          });
          continue;
        }

        // إنشاء الخريج
        // إنشاء الخريج
        const newGraduate = await Graduate.create({
          full_name: graduateData.fullName,
          national_id: graduateData.nationalId,
          faculty: graduateData.faculty,
          department: graduateData.department,
          graduation_year: graduateData.graduationYear,
          created_by: currentUserId,
        });

        results.added++;

        addedGraduates.push({
          fullName: newGraduate.full_name,
          nationalId: newGraduate.national_id,
          faculty: newGraduate.faculty,
          department: newGraduate.department,
          graduationYear: newGraduate.graduation_year,
        });
      } catch (error) {
        results.errors.push({
          fullName: graduateData.fullName,
          nationalId: graduateData.nationalId,
          error: error.message,
        });
      }
    }

    // إعداد الـresponse
    const response = {
      message: `Processed ${graduatesArray.length} graduates`,
      results: results,
      addedGraduates: addedGraduates,
    };

    // إضافة معلومات الملف لو كان ملف مرفوع
    if (req.file) {
      response.fileInfo = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extractedData: graduatesArray,
      };
    }

    res.json(response);
  } catch (error) {
    console.log("🔴 [PROCESSOR] General error:", error);
    res.status(500).json({
      message: "Error processing data",
      error: error.message,
    });
  }
});

// 🔥 دوال معالجة الملفات
async function processUploadedFile(file) {
  console.log("🔵 [FILE PROCESSOR] Processing file type:", file.mimetype);

  switch (file.mimetype) {
    case "application/json":
      return processJSONFile(file);

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
      return processExcelFile(file);

    case "text/csv":
      return processCSVFile(file);

    default:
      throw new Error(`Unsupported file type: ${file.mimetype}`);
  }
}

function processJSONFile(file) {
  try {
    const fileContent = file.buffer.toString("utf8");
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
}

function processExcelFile(file) {
  try {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return jsonData
      .map((row) => {
        // دعم أسماء أعمدة مختلفة للحقول الجديدة
        const fullName =
          row.fullName ||
          row["الاسم بالكامل"] ||
          row["Full Name"] ||
          row["full_name"] ||
          row["اسم الطالب"]; // دعم أسماء عربية

        const nationalId =
          row.nationalId ||
          row["رقم قومي"] ||
          row["National ID"] ||
          row["national_id"];

        const faculty = row.faculty || row["كلية"] || row["Faculty"];

        const department =
          row.department || row["قسم"] || row["Department"] || row["القسم"];

        const graduationYear =
          row["graduationYear"] ||
          row["سنة التخرج"] ||
          row["Graduation Year"] ||
          row["graduation_year"];

        return {
          fullName: fullName?.toString(),
          nationalId: nationalId?.toString(),
          faculty: faculty?.toString(),
          department: department?.toString(),
          graduationYear: parseInt(graduationYear) || graduationYear,
        };
      })
      .filter((item) => item.nationalId && item.nationalId.trim() !== "");
  } catch (error) {
    throw new Error(`Error processing Excel file: ${error.message}`);
  }
}

function processCSVFile(file) {
  // CSV بيكون نفس Excel في المعالجة
  return processExcelFile(file);
}

function validateGraduateStructure(data) {
  const requiredFields = [
    "fullName",
    "nationalId",
    "faculty",
    "department",
    "graduationYear",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        isValid: false,
        message: `Missing required field: ${field}`,
      };
    }
  }

  if (typeof data["graduationYear"] !== "number") {
    return {
      isValid: false,
      message: "graduationYear must be a number",
    };
  }

  return { isValid: true };
}

exports.addGraduates = addGraduates;
