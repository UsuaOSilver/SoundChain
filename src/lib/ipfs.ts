/**
 * IPFS Upload using Pinata API
 * Get your JWT token at: https://app.pinata.cloud/
 */

export interface IPFSUploadResult {
  ipfsHash: string
  ipfsUrl: string
  gatewayUrl: string
}

/**
 * Upload a file to IPFS via Pinata (using server-side API route)
 */
export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'music')

    // Call our server-side API route to keep Pinata JWT secure
    const response = await fetch('/api/upload-ipfs', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()

    return {
      ipfsHash: data.ipfsHash,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl,
    }
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

/**
 * Upload JSON metadata to IPFS (using server-side API route)
 */
export async function uploadJSONToIPFS(data: any, name?: string): Promise<IPFSUploadResult> {
  try {
    // Call our server-side API route to keep Pinata JWT secure
    const response = await fetch('/api/upload-ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        name: name || 'track-metadata.json',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'JSON upload failed')
    }

    const result = await response.json()

    return {
      ipfsHash: result.ipfsHash,
      ipfsUrl: result.ipfsUrl,
      gatewayUrl: result.gatewayUrl,
    }
  } catch (error) {
    console.error('IPFS JSON upload error:', error)
    throw new Error('Failed to upload JSON to IPFS')
  }
}

/**
 * Validate file before upload
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Use MP3, WAV, FLAC, or OGG' }
  }

  return { valid: true }
}

/**
 * Validate image file for cover art
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size exceeds 5MB limit' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Image type not supported. Use JPG, PNG, or WEBP' }
  }

  return { valid: true }
}
