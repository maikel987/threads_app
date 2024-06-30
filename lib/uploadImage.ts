import AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

/**
 * Downloads an image from the given URL.
 * @param {string} imageUrl - The URL of the image to download.
 * @returns {Promise<Buffer>} - A promise that resolves to the image buffer.
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await axios({
    method: 'GET',
    url: imageUrl,
    responseType: 'arraybuffer',
  });

  return response.data;
}

/**
 * Uploads a buffer to AWS S3.
 * @param {Buffer} buffer - The buffer to upload.
 * @param {string} fileName - The name of the file to upload.
 * @returns {Promise<string>} - A promise that resolves to the file key.
 */
async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const params = {
    Bucket: process.env.IMAGE_BUCKET_NAME as string,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/jpeg',
  };

  const data = await s3.upload(params).promise();
  return data.Key;
}

/**
 * Receives an external image URL, downloads the image, and uploads it to AWS S3.
 * @param {string} imageUrl - The URL of the image to download and upload.
 * @returns {Promise<string>} - A promise that resolves to the file key.
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  try {
    const imageBuffer = await downloadImage(imageUrl);
    const fileName = `${uuidv4()}${path.extname(imageUrl)}`;
    const fileKey = await uploadToS3(imageBuffer, fileName);

    console.log('Image uploaded successfully:', fileKey);
    return fileKey;
  } catch (error) {
    console.error('Error uploading image:', (error as Error).message);
    throw new Error('Error uploading image');
  }
}
