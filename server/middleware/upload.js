const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Profile image storage (avatar + cover)
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'nexora/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Post image storage
const postStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'nexora/posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }]
    }
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});

const postUpload = multer({
    storage: postStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: imageFilter,
});

module.exports = upload;
module.exports.postUpload = postUpload;