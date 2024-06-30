"use server";
// This could be in an API route or server-side module in Next.js
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { fetchPropertyHopitableApi, mapHospitableToGeneral } from './hospitable.actions';
import { getIntegration } from './integration.actions';
import { fetchListingAndPlatformAccount, updateListingData } from './listing.actions';
import { convertListingDataToVectors, deleteVectors } from './pinecone.actions';



export const refreshListingDetails = async (platform:string, listing_id:string) => {
    console.log("process: 1");

    const listing = await fetchListingAndPlatformAccount(listing_id);
    console.log("process: 2");

  if (listing.platform === 'hospitable') {

    const apiKey = listing.platform_account.apiKey;
    console.log("process: 3");

    const property = await fetchPropertyHopitableApi(apiKey,listing.internal_id);
    console.log("process: 4");

    // Map the property to your general format
    const mappedProperty = await mapHospitableToGeneral(property.data);
    console.log("process: 5");

    const success = await updateListingData(mappedProperty,listing._id,)
    console.log("process: 6",success);
    if (success) {
      //await deleteVectors(success.listingFeatures,success.listingId,success.apartmentId,'6670a3a9881d59d4bc409833')
      await convertListingDataToVectors(success.listingFeatures,success.listingId,success.apartmentId);
    }

    return mappedProperty;

    }
};
