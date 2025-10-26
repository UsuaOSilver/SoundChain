import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: Upload files to IPFS via Pinata
 *
 * This route handles IPFS uploads server-side to keep the Pinata JWT secure.
 * Supports both file uploads and JSON metadata uploads.
 */

export async function POST(request: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT

    if (!jwt) {
      console.warn('Pinata JWT not configured')
      return NextResponse.json(
        { error: 'Pinata JWT not configured' },
        { status: 500 }
      )
    }

    const contentType = request.headers.get('content-type') || ''

    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Create new FormData for Pinata
      const pinataFormData = new FormData()
      pinataFormData.append('file', file)

      // Add metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: formData.get('type') || 'music',
          uploadedAt: new Date().toISOString(),
        },
      })
      pinataFormData.append('pinataMetadata', metadata)

      // Upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: pinataFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Pinata file upload failed:', errorText)
        return NextResponse.json(
          { error: `Pinata upload failed: ${response.statusText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const ipfsHash = data.IpfsHash

      return NextResponse.json({
        success: true,
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      })
    }

    // Handle JSON upload
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { data: jsonData, name } = body

      if (!jsonData) {
        return NextResponse.json(
          { error: 'No data provided' },
          { status: 400 }
        )
      }

      // Upload JSON to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata: {
            name: name || 'metadata.json',
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Pinata JSON upload failed:', errorText)
        return NextResponse.json(
          { error: `Pinata JSON upload failed: ${response.statusText}` },
          { status: response.status }
        )
      }

      const result = await response.json()
      const ipfsHash = result.IpfsHash

      return NextResponse.json({
        success: true,
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      })
    }

    return NextResponse.json(
      { error: 'Invalid content type. Use multipart/form-data or application/json' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Upload IPFS API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload to IPFS' },
      { status: 500 }
    )
  }
}
