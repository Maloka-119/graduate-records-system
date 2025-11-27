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

  const batchId = `batch_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    if (req.files && req.files.length > 0) {
      graduatesArray = await processUploadedFile(req.files[0]);
    } else if (req.body && req.body.graduates) {
      graduatesArray = Array.isArray(req.body.graduates)
        ? req.body.graduates
        : [req.body.graduates];
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
        const validationResult = validateGraduateStructure(graduateData);
        if (!validationResult.isValid) {
          results.invalidStructure++;
          results.errors.push({
            data: graduateData,
            error: `Invalid structure: ${validationResult.message}`,
          });
          continue;
        }

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

        const newGraduate = await Graduate.create({
          full_name: graduateData.fullName,
          national_id: graduateData.nationalId,
          faculty: graduateData.faculty,
          department: graduateData.department,
          graduation_year: graduateData.graduationYear,
          created_by: currentUserId,
          batch_id: batchId,
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

    const response = {
      message: `Processed ${graduatesArray.length} graduates`,
      metadata: {
        batchId: batchId,
        createdBy: currentUser.email,
        createdByName: currentUser.full_name,
        createdAt: new Date().toISOString(),
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
      .map((row) => {
        const fullName =
          row.fullName ||
          row.full_name ||
          row["full_name"] ||
          row["fullName"] ||
          row["الاسم بالكامل"] ||
          row["Full Name"] ||
          row["اسم الطالب"] ||
          row["Name"] ||
          row["name"] ||
          row[0];

        const nationalId =
          row.nationalId ||
          row.national_id ||
          row["national_id"] ||
          row["nationalId"] ||
          row["رقم قومي"] ||
          row["National ID"] ||
          row["ID"] ||
          row["id"] ||
          row[1];

        if (!nationalId || !fullName) {
          return null;
        }

        const faculty =
          row.faculty ||
          row["faculty"] ||
          row["كلية"] ||
          row["Faculty"] ||
          row[2];

        const department =
          row.department ||
          row["department"] ||
          row["قسم"] ||
          row["Department"] ||
          row["القسم"] ||
          row[3];

        const graduationYear =
          row.graduationYear ||
          row.graduation_year ||
          row["graduation_year"] ||
          row["graduationYear"] ||
          row["سنة التخرج"] ||
          row["Graduation Year"] ||
          row["Year"] ||
          row[4];

        return {
          fullName: fullName?.toString(),
          nationalId: nationalId?.toString(),
          faculty: faculty?.toString(),
          department: department?.toString(),
          graduationYear: parseInt(graduationYear) || graduationYear,
        };
      })
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

    res.json({
      totalBatches: batches.length,
      batches: batches.map((batch) => ({
        batchId: batch.batchId,
        graduateCount: batch.graduateCount,
        createdAt: batch.createdAt,
        createdBy: batch.createdBy,
        createdByName: batch.createdByName,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching batches",
      error: error.message,
    });
  }
});

module.exports = {
  addGraduates,
  getGraduatesByBatch,
  deleteGraduatesByBatch,
  getAllBatches,
};
