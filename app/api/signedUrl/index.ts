// pages/api/signedUrl.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSignedUrl } from '../../../lib/aws'; // Assurez-vous que le chemin d'importation est correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Query received:", req.query); // Ajoutez cette ligne pour le débogage
  const { objectKey } = req.query;
  console.log("objectKey received:", objectKey); // Ajoutez cette ligne pour le débogage

  if (typeof objectKey !== 'string') {
    return res.status(400).json({ error: 'objectKey is required as a query parameter.' });
  }

  try {
    const url = await getSignedUrl({
      objectKey: objectKey,
      expiresInSeconds: 60 * 5, // URL valide pour 5 minutes
    });
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}
