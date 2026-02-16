/**
 * End-to-End Encryption utilities using Web Crypto API
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM'
    this.keyLength = 256
  }

  /**
   * Generate encryption key pair
   */
  async generateKeyPair() {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )

      return keyPair
    } catch (error) {
      console.error('Key generation failed:', error)
      throw new Error('Failed to generate encryption keys')
    }
  }

  /**
   * Generate symmetric key for message encryption
   */
  async generateSymmetricKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Export key to base64 string
   */
  async exportKey(key, format = 'raw') {
    const exported = await window.crypto.subtle.exportKey(format, key)
    return this.arrayBufferToBase64(exported)
  }

  /**
   * Import key from base64 string
   */
  async importKey(keyData, format = 'raw', algorithm = this.algorithm) {
    const keyBuffer = this.base64ToArrayBuffer(keyData)
    return await window.crypto.subtle.importKey(
      format,
      keyBuffer,
      algorithm,
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt message
   */
  async encryptMessage(message, key) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(message)
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        data
      )

      return {
        ciphertext: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt message')
    }
  }

  /**
   * Decrypt message
   */
  async decryptMessage(encryptedData, key, iv) {
    try {
      const ciphertext = this.base64ToArrayBuffer(encryptedData)
      const ivBuffer = this.base64ToArrayBuffer(iv)

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivBuffer,
        },
        key,
        ciphertext
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt message')
    }
  }

  /**
   * Generate message fingerprint
   */
  async generateFingerprint(message) {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    return this.arrayBufferToBase64(hashBuffer)
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

export default new EncryptionService()