"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import PlatformAccount from "../models/platform_account.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import Listing from "../models/listing.model";
import { revalidatePath } from "next/cache";
import { IntegrationStatus } from "../models/integrationStatus";

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

interface Params {
    integrationId: string;
    userId: string;
    username: string;
    password: string;
    platform: string;
    platform_account_id: string;
    account_url: string;
    path:string;
  }

  export async function refreshIntegration({
    integrationId
  }: {integrationId: string}): Promise<void> {
    try {
      await connectToDB();
  
        // Mise à jour d'un appartement existant
        await PlatformAccount.findOneAndUpdate(
          { _id: integrationId },
          {
            status:IntegrationStatus.REFRESHING,
            updated_at: new Date(),
          }
        );
      revalidatePath(`/integrationhub/${integrationId}`);
    } catch (error: any) {
      throw new Error(`Failed to create/update integration: ${error.message}`);
    }
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
  }: Params): Promise<void> {
    try {
      await connectToDB();
  
      if (integrationId) {
        // Mise à jour d'un appartement existant
        await PlatformAccount.findOneAndUpdate(
          { _id: integrationId },
          {
            owner : userId,
            username:username,
            password:password,
            platform:platform,
            platform_account_id:platform_account_id,
            account_url:account_url,
            status:IntegrationStatus.REFRESHING,
            updated_at: new Date(),
          }
        );
      } else {
        // Création d'un nouvel appartement
        const newIntegration = new PlatformAccount({
            owner : userId,
            username:username,
            password:password,
            platform:platform,
            platform_account_id:platform_account_id,
            status:IntegrationStatus.INITIATING,
            account_url:account_url,
        });
        await newIntegration.save();
      }
  
      if (path === `/integrationhub/edit/${integrationId}`) {
        revalidatePath(path);
      }
    } catch (error: any) {
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
  