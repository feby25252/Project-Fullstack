// ============================================
// MIDDLEWARE VALIDASI REQUEST
// ============================================
// Middleware untuk memvalidasi request body
// Memastikan field wajib ada dan tipe data sesuai

/**
 * Validasi field wajib ada dalam request body
 * @param {string[]} requiredFields - Array nama field yang wajib diisi
 */
function validateRequired(requiredFields) {
    return (req, res, next) => {
        const missingFields = [];

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Field wajib tidak lengkap: ${missingFields.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Validasi tipe data field
 * @param {Object} fieldTypes - Object dengan key nama field dan value tipe data (string, number, email, array)
 */
function validateTypes(fieldTypes) {
    return (req, res, next) => {
        const invalidFields = [];

        for (const [field, type] of Object.entries(fieldTypes)) {
            const value = req.body[field];

            // Lewati jika field tidak ada atau kosong
            if (value === undefined || value === null || value === '') {
                continue;
            }

            switch (type) {
                case 'string':
                    if (typeof value !== 'string') {
                        invalidFields.push(`${field} harus berupa string`);
                    }
                    break;
                case 'number':
                    if (isNaN(Number(value))) {
                        invalidFields.push(`${field} harus berupa angka`);
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        invalidFields.push(`${field} format email tidak valid`);
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        invalidFields.push(`${field} harus berupa array`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean' && value !== 0 && value !== 1 && value !== '0' && value !== '1') {
                        invalidFields.push(`${field} harus berupa boolean`);
                    }
                    break;
                default:
                    break;
            }
        }

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Data tidak valid',
                errors: invalidFields
            });
        }

        next();
    };
}

/**
 * Validasi panjang minimal dan maksimal string
 * @param {Object} fieldLengths - Object dengan key nama field dan value { min, max }
 */
function validateLength(fieldLengths) {
    return (req, res, next) => {
        const invalidFields = [];

        for (const [field, limits] of Object.entries(fieldLengths)) {
            const value = req.body[field];

            if (typeof value !== 'string') {
                continue;
            }

            if (limits.min !== undefined && value.length < limits.min) {
                invalidFields.push(`${field} minimal ${limits.min} karakter`);
            }

            if (limits.max !== undefined && value.length > limits.max) {
                invalidFields.push(`${field} maksimal ${limits.max} karakter`);
            }
        }

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Data tidak valid',
                errors: invalidFields
            });
        }

        next();
    };
}

/**
 * Validasi nilai numerik dalam rentang tertentu
 * @param {Object} fieldRanges - Object dengan key nama field dan value { min, max }
 */
function validateRange(fieldRanges) {
    return (req, res, next) => {
        const invalidFields = [];

        for (const [field, range] of Object.entries(fieldRanges)) {
            const value = Number(req.body[field]);

            if (isNaN(value)) {
                continue;
            }

            if (range.min !== undefined && value < range.min) {
                invalidFields.push(`${field} minimal ${range.min}`);
            }

            if (range.max !== undefined && value > range.max) {
                invalidFields.push(`${field} maksimal ${range.max}`);
            }
        }

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Data tidak valid',
                errors: invalidFields
            });
        }

        next();
    };
}

/**
 * Validasi khusus untuk upload file
 * Memastikan file ada dan valid
 */
function validateFileUpload(fieldName) {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return res.status(400).json({
                success: false,
                message: `File ${fieldName} wajib diupload`
            });
        }
        next();
    };
}

/**
 * Kombinasi beberapa validator
 * @param {...Function} validators - Middleware validator yang akan dijalankan berurutan
 */
function combine(...validators) {
    return (req, res, next) => {
        let index = 0;

        function runNext() {
            if (index >= validators.length) {
                return next();
            }
            const validator = validators[index++];
            validator(req, res, (err) => {
                if (err) return next(err);
                runNext();
            });
        }

        runNext();
    };
}

module.exports = {
    validateRequired,
    validateTypes,
    validateLength,
    validateRange,
    validateFileUpload,
    combine
};
