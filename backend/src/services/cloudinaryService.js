const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

class CloudinaryService {
    // Upload profile picture from buffer
    static async uploadProfilePicture(buffer, filename) {
        try {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'hostelmate/profiles',
                        width: 400,
                        height: 400,
                        crop: 'fill',
                        gravity: 'face',
                        public_id: filename,
                        format: 'jpg'
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({
                                public_id: result.public_id,
                                secure_url: result.secure_url
                            });
                        }
                    }
                ).end(buffer);
            });
        } catch (error) {
            throw new Error('Error uploading image: ' + error.message);
        }
    }

    // Delete profile picture
    static async deleteProfilePicture(publicId) {
        try {
            if (publicId) {
                const result = await cloudinary.uploader.destroy(publicId);
                return result;
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            // Don't throw error for deletion failures
        }
    }

    // Get upload middleware
    static getUploadMiddleware() {
        return upload.single('profilePicture');
    }

    // Generate a unique filename
    static generateFilename(studentId) {
        return `student_${studentId}_${Date.now()}`;
    }
}

module.exports = CloudinaryService;
