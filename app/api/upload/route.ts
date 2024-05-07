import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';



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
  ): Promise<{ url: string, fileKey: string }> {  // Retourne un objet avec l'URL et le fileKey
  
    const fileKey = `${Date.now()}-${fileName}`;  // Créez un fileKey unique pour le fichier
  
    const params = {
      Bucket: process.env.IMAGE_BUCKET_NAME as string,
      Key: fileKey,
      Body: file,
      ContentType: type,
    };
  
    const command = new PutObjectCommand(params);
    await s3Client.send(command);  // Exécutez la commande pour envoyer le fichier
  
    const getCommand = new GetObjectCommand({ ...params });
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });  // Générer l'URL signée
  
    return { url, fileKey };  // Retourne l'URL et le fileKey
  }
  
  export async function POST(request: NextRequest, response: NextResponse) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as Blob | null;
      if (!file) {
        return NextResponse.json(
          { error: "File blob is required." },
          { status: 400 }
        );
      }
  
      const mimeType = file.type;
      const fileExtension = mimeType.split("/")[1];
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = uuid() + "." + fileExtension;  // Génère un nom de fichier unique
  
      const { url, fileKey } = await uploadImageToS3(
        buffer,
        fileName,
        mimeType
      );
  
      return NextResponse.json({ success: true, url, fileKey });
    } catch (error) {
      console.error("Error uploading image:", error);
      return NextResponse.json({ error: "Error uploading image", status: 500 });
    }
  }
  