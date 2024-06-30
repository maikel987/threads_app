import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  type: string
): Promise<{ url: string, fileKey: string }> {
  const fileKey = `${Date.now()}-${fileName}`;

  const params = {
    Bucket: process.env.IMAGE_BUCKET_NAME as string,
    Key: fileKey,
    Body: file,
    ContentType: type,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  const getCommand = new GetObjectCommand({ ...params });
  const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

  return { url, fileKey };
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');
    const contentType = res.headers['content-type'];
    const fileExtension = contentType.split("/")[1];
    const fileName = uuid() + "." + fileExtension;

    const { url: uploadedUrl, fileKey } = await uploadImageToS3(
      buffer,
      fileName,
      contentType
    );

    return NextResponse.json({ success: true, url: uploadedUrl, fileKey });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Error uploading image", status: 500 });
  }
}
