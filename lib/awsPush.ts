import AWS from 'aws-sdk';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

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

// Configurer multer pour stocker les fichiers en mémoire
const upload = multer({ storage: multer.memoryStorage() });

// Définir un type pour le fichier image
type ImageFile = Express.Multer.File;

// Fonction pour sauvegarder une image dans AWS S3 et récupérer son nom de fichier
export const saveImageToS3 = async (file: ImageFile): Promise<string> => {
  const { originalname, mimetype, buffer } = file;
  const filename = `${uuidv4()}-${originalname}`;
  const params = {
    Bucket: image_bucket,
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'private',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(filename);
      }
    });
  });
};

// Définir la route API pour sauvegarder une image
export const config = {
  api: {
    bodyParser: false,
  },
};

// Définir la fonction API pour sauvegarder une image
export default upload.single('image')(async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      throw new Error('No image uploaded');
    }
    const filename = await saveImageToS3(file);
    res.status(200).json({ filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save image' });
  }
});
