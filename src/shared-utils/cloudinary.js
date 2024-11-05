const cloudinary = require('cloudinary').v2

class CloudinaryService {
  constructor() {
    if (!CloudinaryService.instance) {
      this.configureCloudinary()
    }
    return CloudinaryService.instance
  }

  configureCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    })
  }


  async uploadBase64(base64Data) {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: 'shabab_news',
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      })
      return result.secure_url
    } catch (error) {
      console.error('Error uploading base64 image to Cloudinary: ', error)
      throw error
    }
  }

  async uploadVideo(base64Video) {
    try {
      const result = await cloudinary.uploader.upload(base64Video, {
        resource_type: 'video',
        folder: 'shabab_news',
        format: 'mp4',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);      
      throw error;
    }
  }

  async processFile(file) {
    const b64 = Buffer.from(file.buffer).toString('base64')
    const dataUrl = `data:${file.mimetype};base64,${b64}`
    return this.uploadBase64(dataUrl)
  }

  async toBase64(file) {
    const b64 = Buffer.from(file.buffer).toString('base64')
    return `data:${file.mimetype};base64,${b64}`
  }
}

module.exports = CloudinaryService
