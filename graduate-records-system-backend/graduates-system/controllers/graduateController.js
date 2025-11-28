// controllers/graduateController.js
const asyncHandler = require("express-async-handler");
const { Graduate, User } = require("../models");
const XLSX = require("xlsx");
const sequelize = require("../config/database");

/**
 * POST /graduates-system/api/graduates
 * Handle both JSON data and file uploads (Excel, JSON, CSV)
 */
const addGraduates = asyncHandler(async (req, res) => {
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

  // 🔴 DEBUG: بداية تحليل الوقت
  console.log("=== DEBUG TIME ANALYSIS ===");
  const now = new Date();
  console.log("1. now (UTC):", now.toISOString());
  console.log("1. now toString:", now.toString());
  console.log("1. now getHours():", now.getHours());
  console.log("1. now getUTCHours():", now.getUTCHours());
  console.log("1. Timezone Offset:", now.getTimezoneOffset(), "minutes");

  // تحديد الوقت المحلي الصحيح
  let localTime;
  const timezoneOffset = now.getTimezoneOffset();

  if (timezoneOffset === -120) {
    // الخادم في توقيت مصر (UTC+2)
    console.log("🟢 Server is in Egypt time (UTC+2) - using current time");
    localTime = now;
  } else {
    // الخادم في UTC أو توقيت آخر
    console.log("🟡 Server is NOT in Egypt time - adding 2 hours");
    localTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }

  console.log("2. Final localTime:", localTime.toString());
  console.log("2. localTime getHours():", localTime.getHours());

  // استخراج المكونات
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");

  console.log("3. Extracted components:");
  console.log("   - Year:", year);
  console.log("   - Month:", month);
  console.log("   - Day:", day);
  console.log("   - Hours:", hours);
  console.log("   - Minutes:", minutes);
  console.log("   - Seconds:", seconds);

  const localTimestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
  const batchId = `batch_${localTimestamp}_${Math.random()
    .toString(36)
    .substr(2, 6)}`;

  console.log("4. Final batchId:", batchId);
  console.log(
    "5. Current Egypt time should be:",
    `${hours}:${minutes}:${seconds}`
  );
  console.log("=== END DEBUG ===");

  try {
    // تحديد مصدر البيانات
    if (req.files && req.files.length > 0) {
      // ملف مرفوع
      graduatesArray = await processUploadedFile(req.files[0]);
    } else if (req.body && req.body.graduates) {
      // JSON data مع مفتاح graduates
      graduatesArray = Array.isArray(req.body.graduates)
        ? req.body.graduates
        : [req.body.graduates];
    } else if (isManualEntryData(req.body)) {
      // Manual Entry - بيانات مباشرة
      graduatesArray = [req.body];
    } else if (Array.isArray(req.body)) {
      // مصفوفة مباشرة
      graduatesArray = req.body;
    } else {
      return res.status(400).json({
        message: "No data provided. Please upload a file or send JSON data.",
      });
    }

    if (graduatesArray.length === 0) {
      return res.status(400).json({
        message: "No valid data found in the provided source.",
      });
    }

    const currentUser = await User.findByPk(currentUserId);

    for (const graduateData of graduatesArray) {
      try {
        // تنظيف وتوحيد تنسيق البيانات
        const normalizedData = normalizeGraduateData(graduateData);

        const validationResult = validateGraduateStructure(normalizedData);
        if (!validationResult.isValid) {
          results.invalidStructure++;
          results.errors.push({
            data: normalizedData,
            error: `Invalid structure: ${validationResult.message}`,
          });
          continue;
        }

        const existingGraduate = await Graduate.findOne({
          where: { national_id: normalizedData.nationalId },
        });

        if (existingGraduate) {
          results.duplicates++;
          results.errors.push({
            nationalId: normalizedData.nationalId,
            error: "Duplicate national ID",
          });
          continue;
        }

        // ✅ التصحيح هنا: تمرير created_at يدوياً بالتوقيت المحلي
        const newGraduate = await Graduate.create({
          full_name: normalizedData.fullName,
          national_id: normalizedData.nationalId,
          faculty: normalizedData.faculty,
          department: normalizedData.department,
          graduation_year: normalizedData.graduationYear,
          created_by: currentUserId,
          batch_id: batchId,
          created_at: localTime, // ✅ تمرير الوقت المحلي يدوياً
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
          fullName: graduateData.fullName || graduateData.full_name,
          nationalId: graduateData.nationalId || graduateData.national_id,
          error: error.message,
        });
      }
    }

    const response = {
      message: `Processed ${graduatesArray.length} graduates`,
      metadata: {
        batchId: batchId,
        createdBy: currentUser.email,
        createdByName: currentUser.full_name,
        createdAt: localTime.toISOString(), // ✅ استخدام localTime بدل now
        localCreatedAt: `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`,
        serverTime: now.toLocaleString("en-US", { timeZone: "UTC" }),
        egyptTime: localTime.toLocaleString("en-US", {
          timeZone: "Africa/Cairo",
        }),
        timezoneOffset: timezoneOffset,
        serverLocation: timezoneOffset === -120 ? "Egypt (UTC+2)" : "Other",
      },
      results: results,
      addedGraduates: addedGraduates,
    };

    if (req.files && req.files.length > 0) {
      response.fileInfo = {
        filename: req.files[0].originalname,
        mimetype: req.files[0].mimetype,
        size: req.files[0].size,
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error processing data",
      error: error.message,
    });
  }
});

// باقي الدوال تبقى كما هي...
// دالة للتحقق من بيانات Manual Entry
function isManualEntryData(data) {
  return (
    data &&
    (data.fullName ||
      data.nationalId ||
      data.faculty ||
      data.department ||
      data.graduationYear)
  );
}

// دالة لتوحيد تنسيق البيانات
function normalizeGraduateData(data) {
  // دعم تنسيقات المفاتيح المختلفة
  const normalized = {
    fullName:
      data.fullName ||
      data.full_name ||
      data["Full Name"] ||
      data["full name"] ||
      data["الاسم بالكامل"] ||
      data["اسم الطالب"] ||
      data["Name"] ||
      data["name"],
    nationalId:
      data.nationalId ||
      data.national_id ||
      data["National ID"] ||
      data["national id"] ||
      data["رقم قومي"] ||
      data["ID"] ||
      data["id"],
    faculty:
      data.faculty ||
      data["Faculty"] ||
      data["faculty"] ||
      data["كلية"] ||
      data["الكليه"],
    department:
      data.department ||
      data["Department"] ||
      data["department"] ||
      data["قسم"] ||
      data["القسم"],
    graduationYear:
      data.graduationYear ||
      data.graduation_year ||
      data["Graduation Year"] ||
      data["graduation year"] ||
      data["سنة التخرج"] ||
      data["Year"] ||
      data["year"],
  };

  // تحويل graduationYear إلى رقم إذا كان نصاً
  if (
    normalized.graduationYear &&
    typeof normalized.graduationYear === "string"
  ) {
    const year = parseInt(normalized.graduationYear);
    if (!isNaN(year)) {
      normalized.graduationYear = year;
    }
  }

  return normalized;
}

// دالة التحقق من الهيكل (محدثة)
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

  // التحقق من أن graduationYear رقم صالح
  const year = parseInt(data.graduationYear);
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
    return {
      isValid: false,
      message: "graduationYear must be a valid year",
    };
  }

  return { isValid: true };
}

// باقي الدوال تبقى كما هي بدون تغيير
async function processUploadedFile(file) {
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

    if (jsonData.length === 0) {
      const alternativeData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      if (alternativeData.length > 1) {
        const headers = alternativeData[0];
        return alternativeData.slice(1).map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
      }
    }

    return jsonData
      .map((row) => normalizeGraduateData(row))
      .filter(
        (item) => item && item.nationalId && item.nationalId.trim() !== ""
      );
  } catch (error) {
    throw new Error(`Error processing Excel file: ${error.message}`);
  }
}

function processCSVFile(file) {
  return processExcelFile(file);
}

/**
 * GET /graduates-system/api/graduates/batch/:batchId
 * Get all graduates for a specific batch
 */
const getGraduatesByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  try {
    const graduates = await Graduate.findAll({
      where: { batch_id: batchId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email", "full_name"],
        },
      ],
      order: [["full_name", "ASC"]],
    });

    if (graduates.length === 0) {
      return res.status(404).json({
        message: "No graduates found for this batch",
      });
    }

    res.json({
      batchId: batchId,
      totalGraduates: graduates.length,
      graduates: graduates.map((grad) => ({
        fullName: grad.full_name,
        nationalId: grad.national_id,
        faculty: grad.faculty,
        department: grad.department,
        graduationYear: grad.graduation_year,
        createdBy: grad.creator?.email,
        createdByName: grad.creator?.full_name,
        createdAt: grad.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching batch graduates",
      error: error.message,
    });
  }
});

/**
 * DELETE /graduates-system/api/graduates/batch/:batchId
 * Delete all graduates in a specific batch
 */
const deleteGraduatesByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  try {
    const batchGraduates = await Graduate.findAll({
      where: { batch_id: batchId },
      attributes: ["national_id", "full_name"],
    });

    if (batchGraduates.length === 0) {
      return res.status(404).json({
        message: "No graduates found for this batch",
      });
    }

    const deletedCount = await Graduate.destroy({
      where: { batch_id: batchId },
    });

    res.json({
      message: `Successfully deleted batch ${batchId}`,
      deletedCount: deletedCount,
      batchInfo: {
        batchId: batchId,
        totalDeleted: deletedCount,
        sampleGraduates: batchGraduates.slice(0, 5).map((g) => ({
          fullName: g.full_name,
          nationalId: g.national_id,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting batch graduates",
      error: error.message,
    });
  }
});

/**
 * GET /graduates-system/api/batches
 * Get all batches with summary info
 */
const getAllBatches = asyncHandler(async (req, res) => {
  try {
    const allGraduates = await Graduate.findAll({
      attributes: ["batch_id", "created_at"],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["email", "full_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const batchMap = new Map();

    allGraduates.forEach((graduate) => {
      const batchId = graduate.batch_id;
      const createdAt = graduate.created_at;

      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batchId,
          graduateCount: 0,
          createdAt: createdAt,
          createdBy: graduate.creator?.email,
          createdByName: graduate.creator?.full_name,
        });
      }

      const batch = batchMap.get(batchId);
      batch.graduateCount++;
    });

    const batches = Array.from(batchMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // ✅ تصحيح الوقت في الريسبونس
    const correctedBatches = batches.map((batch) => {
      let correctedTime = batch.createdAt;

      // إذا كان الخادم في توقيت مصر والوقت مسجل بـ UTC، أضف ساعتين
      const timezoneOffset = new Date().getTimezoneOffset();
      if (timezoneOffset === -120) {
        // تحقق إذا الوقت مسجل بـ UTC (يظهر بساعتين أقل)
        const createdAt = new Date(batch.createdAt);
        const now = new Date();
        if (createdAt.getHours() === now.getUTCHours()) {
          // الوقت مسجل بـ UTC، أضف ساعتين
          correctedTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
        }
      }

      return {
        batchId: batch.batchId,
        graduateCount: batch.graduateCount,
        createdAt: correctedTime,
        createdBy: batch.createdBy,
        createdByName: batch.createdByName,
      };
    });

    res.json({
      totalBatches: correctedBatches.length,
      batches: correctedBatches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching batches",
      error: error.message,
    });
  }
});

/**
 * GET /graduates-system/api/all-graduates
 * Get ALL graduates from ALL batches (organized by batch)
 */
/**
 * GET /graduates-system/api/all-graduates
 * Get ALL graduates from ALL batches in one flat array
 */
const getAllGraduates = asyncHandler(async (req, res) => {
  try {
    // جلب جميع الخريجين من جميع الباتشات
    const allGraduates = await Graduate.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email", "full_name"],
        },
      ],
      order: [
        ["created_at", "DESC"],
        ["full_name", "ASC"],
      ],
    });

    if (allGraduates.length === 0) {
      return res.status(404).json({
        message: "No graduates found in the database",
      });
    }

    // تحويل البيانات إلى array واحدة مسطحة
    const allGraduatesFlat = allGraduates.map((graduate) => ({
      fullName: graduate.full_name,
      nationalId: graduate.national_id,
      faculty: graduate.faculty,
      department: graduate.department,
      graduationYear: graduate.graduation_year,
    }));

    // الريسبونس النهائي
    const response = {
      success: true,
      totalGraduates: allGraduatesFlat.length,
      graduates: allGraduatesFlat,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all graduates",
      error: error.message,
    });
  }
});

module.exports = {
  addGraduates,
  getGraduatesByBatch,
  deleteGraduatesByBatch,
  getAllBatches,
  getAllGraduates,
};
