const cloudinary = require('cloudinary').v2

// Validate Cloudinary config at load time to give clear startup errors
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing! Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env')
} else if (cloudName === 'Root' || cloudName === 'your_cloud_name_here') {
  console.error('❌ CLOUDINARY_CLOUD_NAME is set to a placeholder value ("' + cloudName + '"). Please set the real cloud name from https://cloudinary.com/console')
} else {
  console.log('✅ Cloudinary configured with cloud:', cloudName)
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

module.exports = cloudinary