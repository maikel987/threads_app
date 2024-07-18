"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import PlatformAccount, { IPlatformAccount } from "../models/platform_account.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import Listing, { IListing } from "../models/listing.model";
import { revalidatePath } from "next/cache";
import { IntegrationStatus } from "../models/integrationStatus";
import Apartment from "../models/apartment.model";
import ListingFeatures, { IListingFeatures } from "../models/listing_features.model";
import { platform } from "os";
import { convertListingDataToVectors } from "./pinecone.actions";

async function createPlatformAccount(userId:string) {
    try {
      const newAccount = new PlatformAccount({
        _id: new mongoose.Types.ObjectId(),
        owner: userId, // Remplacer par l'ID d'un User existant dans votre DB
        username: "nom_utilisateur_unique 2",
        password: "motdepasse 2",
        platform: "nom_de_la_plateforme 2",
        platform_account_id: "identifiant_unique_de_compte_plateforme 2",
        // Pas besoin de fournir created_at et updated_at, ils sont automatiquement gérés par le schéma
      });
  
      const savedAccount = await newAccount.save();
      console.log('Nouveau compte de plateforme créé avec succès :', savedAccount);
    } catch (error) {
      console.error('Erreur lors de la création du compte de plateforme :', error);
    }
  }
  
export async function fetchPlatformAccount({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
  }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
  }) {
    try {
      connectToDB();
      //console.log("fetchplatformAccount - userId",userId)
      //createPlatformAccount(userId);

      // Calculate the number of platformAccount to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;
  
      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");
  
      // Create an initial query object to filter platformAccount.
      const query: FilterQuery<typeof PlatformAccount> = {owner__id: userId};
  
      // If the search string is not empty, add the $or operator to match either username or name fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { platform: { $regex: regex } },
          { platform_account_id: { $regex: regex } },
          { username: { $regex: regex } },
        ];
      }
  
      // Define the sort options for the fetched platformAccount based on createdAt field and provided sort order.
      const sortOptions = { updated_at: sortBy };
  
      // Create a query to fetch the platformAccount based on the search and sort criteria.
      const platformAccountQuery = PlatformAccount.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: 'listings',model: Listing,select:'picture title'})  

      // Count the total number of platformAccount that match the search criteria (without pagination).
      const totalPlatformAccountCount = await PlatformAccount.countDocuments(query);
  
      const platformAccount = await platformAccountQuery.exec();
  
      // Check if there are more platformAccount beyond the current page.
      const isNext = totalPlatformAccountCount > skipAmount + platformAccount.length;
  
      return { platformAccount, isNext };
    } catch (error) {
      console.error("Error fetching platformAccount:", error);
      throw error;
    }
  }
  
export async function fetchPlatformAccountDetails(id: string) {
try {
    connectToDB();

    const platformAccountDetails = await PlatformAccount.findOne({ _id:id }).populate("listings");

    return platformAccountDetails;
} catch (error) {
    // Handle any errors
    console.error("Error fetching platform account details:", error);
    throw error;
}
}

export async function refreshIntegration({
    integrationId
  }: {integrationId: string}): Promise<IPlatformAccount> {
    try {
      await connectToDB();
  
        // Mise à jour d'un appartement existant
        const platformAccount = await PlatformAccount.findOneAndUpdate(
          { _id: integrationId },
          {
            status:IntegrationStatus.REFRESHING,
            updated_at: new Date(),
          }
        );
      revalidatePath(`/integrationhub/${integrationId}`);
      return platformAccount;
    } catch (error: any) {
      throw new Error(`Failed to create/update integration: ${error.message}`);
    }
  }

  export async function integrationConnected({
    integrationId
  }: {integrationId: string}): Promise<void> {
    try {
      await connectToDB();
  
        // Mise à jour d'un appartement existant
        await PlatformAccount.findOneAndUpdate(
          { _id: integrationId },
          {
            status:IntegrationStatus.CONNECTED,
            updated_at: new Date(),
          }
        );
      revalidatePath(`/integrationhub/${integrationId}`);
    } catch (error: any) {
      throw new Error(`Failed to create/update integration: ${error.message}`);
    }
  }

interface Params {
    integrationId: string;
    userId: string;
    username: string;
    password: string;
    platform: string;
    platform_account_id: string;
    account_url: string;
    path:string;
    apiKey:string;
  }

interface PlatformAccountType {
    _id: string;
  }
  

export async function updateIntegration({
    integrationId,
    userId,
    username,
    password,
    platform,
    platform_account_id,
    account_url,
    path,
    apiKey,
  }: Params): Promise<PlatformAccountType> {

    console.log("updateIntegration - arrived");
    try {
      await connectToDB();

      const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId)});
      if (!user) {
        throw new Error("User not found with ID: " + userId);
      }

      let integration;

      if (integrationId) {
        integration = await PlatformAccount.findOneAndUpdate(
          { _id: integrationId },
          {
            owner: userId,
            username,
            password,
            platform,
            platform_account_id,
            account_url,
            status: IntegrationStatus.REFRESHING,
            updated_at: new Date(),
            apiKey
          },
          { new: true }  // Return the updated document
        );
      } else {
        const newIntegration = new PlatformAccount({
          owner: userId,
          username,
          password,
          platform,
          platform_account_id,
          status: IntegrationStatus.INITIATING,
          account_url,
          apiKey
        });

        integration = await newIntegration.save();
        user.platform_account.push(integration._id);
        await user.save();
      }

      if (!integration) {
        throw new Error(`Integration failed to update/create for user ${userId}`);
      }

      if (path === `/integrationhub/edit/${integrationId}`) {
        await revalidatePath(path);
      }

      return {_id:integration._id};
    } catch (error: any) {
      console.error(`Failed to create/update integration: ${error.message}`);
      throw new Error(`Failed to create/update integration: ${error.message}`);
    }
  }


export async function fetchIntegration(integration_id: string) {
    try {
      connectToDB();

      let integration = await PlatformAccount.findOne({ _id: integration_id })
      .populate({path: 'listings',model: Listing,select:'title'})
      .exec();
      
      return integration;

    } catch (error: any) {
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }
  }

export async function getIntegration(integration_id: string) {
    try {
      connectToDB();

      let integration = await PlatformAccount.findOne({ _id: integration_id })
      .exec();
      
      return integration;

    } catch (error: any) {
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }
  }

export interface PlatformAccount{
    listingsCount:number; 
    username:string; 
    platform_account_id:string; 
    platform:string; 
    _id:string; 

  };

export async function fetchPlatformAccountByPlatform({
    userId,
    platform,
    sortBy = "asc",
  }: {
    userId: string;
    platform?: string;
    sortBy?: SortOrder;
  }):Promise<PlatformAccount[]> {
    try {
      connectToDB();
      
      const query: FilterQuery<typeof PlatformAccount> = { owner__id: userId };
      if (platform) {
        query.platform = platform;
      }

      const sortOptions = { updated_at: sortBy };
  
      const platformAccountQuery = PlatformAccount.find(query)
        .select('username listings platform_account_id platform _id') 
        .sort(sortOptions)

  
      const platformAccount = await platformAccountQuery.exec();
  
      const returnplatformAccount = platformAccount.map(pa => ({
        username: pa.username,
        listingsCount: pa.listings.length,
        platform_account_id: pa.platform_account_id,
        platform: pa.platform,
        _id: pa._id.toString()
      }));
  
      return returnplatformAccount;
    } catch (error) {
      console.error("Error fetching platformAccount:", error);
      throw error;
    }
  }

  
export interface GeneralProperty {
    id: string;
    name: string;
    picture: string;
    address: any;
    summary: string;
    description: string[];
    amenities: string[];
    guest?: number;        
    bedroom?: number;      
    bed?: number;          
    bathroom?: number; 
    rules: string[];
    safety:string[];
    sleeping:string[];
    checkin: string;
    checkout: string;
    exist:boolean;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  }
  
const insertPropertyData = async (property: GeneralProperty, platformAccountId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {

    const platformAccount = await PlatformAccount.findOne({ _id: platformAccountId });
    console.log('platformAccount',platformAccount);

    // Insérer dans la collection apartment
    const apartment = await Apartment.create({
      internal_name: property.name,
      address: property.address,
      owner: userId,
      coordinates: property.coordinates,
      created_at: new Date(),
      updated_at: new Date(),
      urgent_number:"0000", //ICI a rajouter de puis l'import du compte
    });
    console.log('apartment inserted...',);
  
    // Mettre à jour l'utilisateur pour inclure la référence à l'appartement
    await User.findByIdAndUpdate(userId, {
      $push: { apartments: apartment._id },
    });
    console.log('user founded...',);
  
    // Insérer dans la collection listing
    const listing = await Listing.create({
      apartment: apartment._id,
      internal_id: property.id,
      platform_account: platformAccountId,
      platform:platformAccount.platform,
      picture: property.picture,
      title: property.name,
      status: 'housing_not_connected', //ICI a corriger
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('listing inserted...',);

  
    // Mettre à jour l'appartement pour inclure la référence au listing
    await Apartment.findByIdAndUpdate(apartment._id, {
      $push: { listings: listing._id },
    });
    console.log('apartment found and inserted...',);

    platformAccount.listings.push(listing._id);
    await platformAccount.save();

    console.log('platform acccount updated...',);
  
    // Insérer dans la collection listingfeatures
    const listingFeatures = await ListingFeatures.create({
      listing: listing._id,
      guest:property.guest,
      bedroom:property.bedroom,
      bed:property.bed,
      bathroom:property.bathroom,
      amenities: property.amenities,
      description: property.description,
      created_at: new Date(),
      updated_at: new Date(),
      rules: property.rules,
      safety: property.safety,
      sleeping: property.sleeping,
      checkin: property.checkin,
      checkout: property.checkout,
    });
    console.log('listingFeatures inserted...',);

    // Mettre à jour le listing pour inclure la référence aux features
    await Listing.findByIdAndUpdate(listing._id, {
      $set: { listing_features: listingFeatures._id },
    });
    console.log('listing updated...',);

    await convertListingDataToVectors(listingFeatures, listing._id.toString(), apartment._id.toString());
    console.log('convertListingDataToVectors done...',);

    return listing
  };
  
export const insertAllProperties = async (properties: GeneralProperty[], platformAccount_id: string, user_id:string):Promise<IListing[]> => {
    const platformAccountId = new mongoose.Types.ObjectId(platformAccount_id); 
    const userId = new mongoose.Types.ObjectId(user_id); 
    console.log(platformAccountId,userId);
    let insertedListingIds = [];  // Tableau pour stocker les IDs des listings insérés

    for (const property of properties) {
      const listingId = await insertPropertyData(property, platformAccountId, userId);
      insertedListingIds.push(listingId);  // Ajouter l'ID du listing au tableau
    }
  
    console.log('All properties successfully inserted');
    return insertedListingIds;  // Retourner les IDs des listings insérés
  };

  // Function to check if the property ID already exists in the database
export const isListingPresent = async (listingId: string): Promise<boolean> => {
    try {
      const existingProperty = await Listing.findOne({ internal_id: listingId });
      return !!existingProperty;  // returns true if the property exists, otherwise false
    } catch (error) {
      console.error('Error checking property presence:', error);
      throw error;
    }
  };

