import { PineConeManager } from '../models/pinecone.interface';
import { CreateIndexRequestMetricEnum } from '@pinecone-database/pinecone';
import { getEmbedding } from '../openai.services';
import { IListingFeatures } from '../models/listing_features.model';
import { IApartment } from '../models/apartment.model';
import { IListing } from '../models/listing.model';

if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not defined in the environment variables.');
  }
if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error('PINECONE_INDEX_NAME is not defined in the environment variables.');
  }

const pineConeManager = new PineConeManager(
    process.env.PINECONE_API_KEY,
    process.env.PINECONE_INDEX_NAME,
    1536,
    "cosine",
    { serverless: { cloud: 'aws', region: 'us-east-1' } }
);

interface DataLine {
    id: string;
    values: number[];
    metadata: Record<string, any>;
}



async function getDataLine(listingId: string, featureName: string, listingData: any, featureNumber = 0): Promise<DataLine> {
  const vector = await getEmbedding(listingData)
    return {
        id: `onboard#${listingId}#${featureName}#${featureNumber}`,
        values: vector,
        metadata: {
            text: listingData,
            listing: listingId,
            created: new Date()
        }
    };
}

export async function deleteVectors(propertyId: string, query: string) { 
  const vectorList = await pineConeManager.fetchAllVectors(query, propertyId);
  if (vectorList) {
      const idList = vectorList.map(v => v.id).filter(id => id !== undefined) as string[];
      if (idList.length > 0) {
          await pineConeManager.deleteMany(idList, propertyId);
      } else {
          console.log('No valid IDs found for deletion.');
      }
  } else {
      console.log('No vectors found to delete.');
  }
}

export async function convertListingDataToVectors(listingData: IListingFeatures, listingId: string, propertyId: string, update: boolean = false) { 
  //GOOD
  const vectorsToUpsert: DataLine[] = [];

  const promises: Promise<DataLine | void>[] = [];

  if (listingData.checkin) {
    promises.push(getDataLine(listingId, 'checkin', `check-in is at ${listingData.checkin}`));
  }
  if (listingData.checkout) {
    promises.push(getDataLine(listingId, 'checkout', `check-out is at ${listingData.checkout}`));
  }
  if (listingData.sleeping) {
    const sleepingArrangements = listingData.sleeping.map((bed, index) => `${bed}`).join(" and ");
    promises.push(getDataLine(listingId, 'sleeping', `The apartment features ${sleepingArrangements} for guests.`));
  }
  if (listingData.description) {
    if (update) promises.push(deleteVectors(propertyId, `onboard#${listingId}#description#`).then(() => undefined));
    for (let i = 0; i < listingData.description.length; i++) {
      promises.push(getDataLine(listingId, 'description', listingData.description[i], i));
    }
  }
  if (listingData.amenities) {
    const amenitiesDescriptions = listingData.amenities.map((amenity, index) => {
      const formattedAmenity = amenity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `${formattedAmenity} is available for guests to enhance their stay.`;
    });

    if (update) promises.push(deleteVectors(propertyId, `onboard#${listingId}#amenities#`).then(() => undefined));
    for (let i = 0; i < amenitiesDescriptions.length; i++) {
      promises.push(getDataLine(listingId, 'amenities', amenitiesDescriptions[i], i));
    }
  }
  if (listingData.rules) {
    const rulesDescriptions = listingData.rules.map((rule, index) => {
      const [ruleName, ruleValue] = rule.split(": ");
      const formattedRuleName = ruleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const isAllowed = ruleValue.trim() === 'true';

      if (isAllowed) {
        return `${formattedRuleName} are allowed.`;
      } else {
        return `${formattedRuleName} are not allowed.`;
      }
    });
    if (update) promises.push(deleteVectors(propertyId, `onboard#${listingId}#rules#`).then(() => undefined));
    for (let i = 0; i < rulesDescriptions.length; i++) {
      promises.push(getDataLine(listingId, 'rules', rulesDescriptions[i], i));
    }
  }
  if (listingData.bathroom) {
    const bathroomCount = listingData.bathroom;  
    const bathroomDescription = `The apartment has ${bathroomCount} bathroom${bathroomCount > 1 ? 's' : ''}.`;
    promises.push(getDataLine(listingId, 'bathroom', bathroomDescription));
  }
  if (listingData.bed) {
    const bedCount = listingData.bed;  // Supposons que cette variable contienne le nombre de lits
    const bedDescription = `The apartment has ${bedCount} bed${bedCount > 1 ? 's' : ''}, ensuring comfortable sleeping arrangements for guests.`;
    promises.push(getDataLine(listingId, 'bed', bedDescription));    
  }
  if (listingData.bedroom) {
    const bedroomCount = listingData.bedroom;  // Supposons que cette variable contienne le nombre de chambres à coucher
    let bedroomDescription;
    if (bedroomCount === 0) {
      bedroomDescription = "The apartment is a studio space, combining living, sleeping, and dining areas in a single open layout, ideal for maximizing space.";
    } else {
      bedroomDescription = `The apartment features ${bedroomCount} bedroom${bedroomCount > 1 ? 's' : ''}, providing privacy and comfort for guests.`;
    }
    promises.push(getDataLine(listingId, 'bedroom', bedroomDescription));
  }
  if (listingData.guest) {
    const guestDescription = `The apartment can comfortably accommodate up to ${listingData.guest} guests.`;
    promises.push(getDataLine(listingId, 'guest', guestDescription));
  }

  const results = await Promise.all(promises);
  vectorsToUpsert.push(...results.filter(result => result !== undefined) as DataLine[]);

  await pineConeManager.upsert(vectorsToUpsert.map(line => ({ id: line.id, values: line.values, metadata: line.metadata })), propertyId);
}

export async function convertFAQToVectors(faq: string[], propertyId: string, listingId: string, conversationId: string, indexStart = 0): Promise<number> {
  const vectorsToUpsert: DataLine[] = [];
  let i = indexStart;
  const embeddingLimitScore = parseFloat(process.env.EMBEDDING_LIMIT_SCORE || '0'); // Default value if undefined

  for (const elt of faq) {
      const embedding = await getEmbedding(elt);
      const pineResult = await pineConeManager.query(embedding,propertyId, {}, 1, true );
      if(pineResult.matches[0].score){
        if (pineResult.matches.length > 0 && pineResult.matches[0].score >= embeddingLimitScore) {
          await pineConeManager.deleteMany([pineResult.matches[0].id], propertyId);
        }
      }

      vectorsToUpsert.push({
          id: `faq#${listingId}#${conversationId}#${i}`,
          values: embedding,
          metadata: {
              text: elt,
              listing: listingId,
              conversation: conversationId,
              created: new Date()
          }
      });
      i++;
  }

  await pineConeManager.upsert(vectorsToUpsert.map(line => ({ id: line.id, vector: line.values, metadata: line.metadata })), propertyId);
  return i;
}


// Function to fetch context-related data from Pinecone
export async function getContextFromPinecone(text: string | null, apartmentId: string, topK: number = 5): Promise<string[]> {
  try {
      const embedding = text ? await getEmbedding(text) : new Array(1536).fill(0);
      const result = await pineConeManager.query(embedding, apartmentId, {}, topK, true);
      return result.matches.map((match: any) => match.metadata.text);
  } catch (error) {
      console.error('Error fetching context from Pinecone:', error);
      return [];
  }
}

// Function to get an answer from Pinecone based on provided text
export async function getAnswerFromPinecone(text: string | null, apartmentId: string, topK: number = 5): Promise<any> {
  try {
      const embedding = text ? await getEmbedding(text) : new Array(1536).fill(0);
      return await pineConeManager.query(embedding, apartmentId, {}, topK, true);
  } catch (error) {
      console.error('Error getting answer from Pinecone:', error);
      return null;
  }
}

