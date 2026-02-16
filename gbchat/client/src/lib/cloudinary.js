import axios from 'axios'

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

class CloudinaryService {
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`
  }

  async uploadFile(file, options = {}) {
    const {
      folder = 'gbchat',
      resourceType = 'auto',
      onProgress,
    } = options

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', this.uploadPreset)
    formData.append('folder', folder)

    try {
      const response = await axios.post(
        `${this.baseUrl}/${resourceType}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              onProgress(progress)
            }
          },
        }
      )

      return {
        success: true,
        data: {
          url: response.data.secure_url,
          publicId: response.data.public_id,
          format: response.data.format,
          size: response.data.bytes,
          width: response.data.width,
          height: response.data.height,
          thumbnail: this.getThumbnail(response.data.public_id, resourceType),
        },
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Upload failed',
      }
    }
  }

  getThumbnail(publicId, resourceType = 'image') {
    if (resourceType === 'video') {
      return `https://res.cloudinary.com/${this.cloudName}/video/upload/w_200,h_200,c_fill/${publicId}.jpg`
    }
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_200,h_200,c_fill/${publicId}`
  }

  async deleteFile(publicId, resourceType = 'image') {
    // Note: Deletion requires authentication, should be done from backend
    console.warn('File deletion should be handled by backend')
    return { success: false, error: 'Use backend API for deletion' }
  }

  getOptimizedUrl(publicId, options = {}) {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options

    let transformations = []
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push(`c_${crop}`)
    transformations.push(`q_${quality}`)
    transformations.push(`f_${format}`)

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations.join(',')}/${publicId}`
  }
}

export default new CloudinaryService()