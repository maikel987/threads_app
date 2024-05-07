"use server";

import AWS from 'aws-sdk';


// Configurer AWS avec les identifiants et la région depuis les variables d'environnement
const aws_config = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }

AWS.config.update(aws_config);
const image_bucket = process.env.IMAGE_BUCKET_NAME
// Créer une nouvelle instance du service S3
const s3 = new AWS.S3();  

// Définir un type pour les options de l'URL signée
type SignedUrlOptions = {
  objectKey: string;
  expiresInSeconds: number;
};
// Fonction pour générer une URL signée pour une seule image
export async function getSignedImageUrl2(objectKey: string): Promise<string> {
  const options: SignedUrlOptions = {
    objectKey: objectKey,
    expiresInSeconds: 60 * 5, // Exemple : 5 minutes
  };

  const params = {
    Bucket: image_bucket,
    Key: options.objectKey,
    Expires: options.expiresInSeconds,
  };

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
export async function getSignedImageUrl(objectKey: string): Promise<string> {
  const bucketName = process.env.IMAGE_BUCKET_NAME;
  const region = process.env.AWS_REGION; // Adaptez selon votre configuration AWS S3

  // Construit l'URL en fonction du bucket, de la région, du clé de l'objet et de l'extension
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

  // Retourne l'URL construite
  return url;
}

//https://msklbucket.s3.eu-west-3.amazonaws.com/044ed4_742530313597511760.jpeg

