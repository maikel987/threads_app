"use server";

import AWS from 'aws-sdk';

// Configurer AWS avec les identifiants et la région depuis les variables d'environnement
const aws_config = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
console.log(aws_config)
console.log(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL)
AWS.config.update(aws_config);
const image_bucket = process.env.IMAGE_BUCKET_NAME
// Créer une nouvelle instance du service S3
const s3 = new AWS.S3();

// Définir un type pour les options de l'URL signée
type SignedUrlOptions = {
  objectKey: string;
  expiresInSeconds: number;
};

// Fonction pour générer une URL signée
export async function getSignedUrl(options: SignedUrlOptions): Promise<string> {
  const { objectKey, expiresInSeconds } = options;

  const params = {
    Bucket: image_bucket,
    Key: objectKey,
    Expires: expiresInSeconds,
  };
  console.log('params',params)

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}

/*
// Utilisation de la fonction
async function generateAndLogSignedUrl() {
  try {
    const url = await getSignedUrl({
      bucketName: 'your-bucket-name',
      objectKey: 'path/to/your/object.jpg',
      expiresInSeconds: 60 * 5, // URL valide pour 5 minutes
    });

    console.log('Signed URL:', url);
  } catch (err) {
    console.error('Error generating signed URL:', err);
  }
}

generateAndLogSignedUrl();
*/