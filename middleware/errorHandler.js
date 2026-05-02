// ============================================
// MIDDLEWARE ERROR HANDLER TERPUSAT
// ============================================
// Menangani semua error yang terjadi di aplikasi
// Memberikan response JSON yang konsisten

/**
 * Custom error class untuk error aplikasi
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware untuk menangani error multer (upload file)
 */
function multerErrorHandler(err, req, res, next) {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal 2MB.'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Jumlah file melebihi batas maksimal.'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Field file tidak sesuai yang diharapkan.'
        });
    }

    if (err.message && err.message.includes('Format file tidak didukung')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next(err);
}

/**
 * Middleware untuk menangani error validasi
 */
function validationErrorHandler(err, req, res, next) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Data tidak valid',
            errors: err.errors || [err.message]
        });
    }

    next(err);
}

/**
 * Middleware untuk menangani error database MySQL
 */
function databaseErrorHandler(err, req, res, next) {
    if (err.code && (err.code.startsWith('ER_') || err.code === 'PROTOCOL_CONNECTION_LOST')) {
        console.error('Database Error:', err);

        // Error code spesifik MySQL
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Data sudah ada. Duplikat tidak diizinkan.'
            });
        }

        if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Data referensi tidak ditemukan.'
            });
        }

        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'Data tidak dapat dihapus karena masih digunakan oleh data lain.'
            });
        }

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            return res.status(503).json({
                success: false,
                message: 'Koneksi database terputus. Silakan coba lagi.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada database.'
        });
    }

    next(err);
}

/**
 * Middleware untuk menangani error JWT
 */
function jwtErrorHandler(err, req, res, next) {
    if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
            success: false,
            message: 'Token sudah kedaluwarsa. Silakan login kembali.'
        });
    }

    next(err);
}

/**
 * Middleware catch-all untuk error yang tidak tertangani
 */
function globalErrorHandler(err, req, res, next) {
    // Default status code 500
    const statusCode = err.statusCode || err.status || 500;

    // Log error untuk debugging
    console.error(`[ERROR ${statusCode}]`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Response JSON yang konsisten
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = {
    AppError,
    multerErrorHandler,
    validationErrorHandler,
    databaseErrorHandler,
    jwtErrorHandler,
    globalErrorHandler
};
