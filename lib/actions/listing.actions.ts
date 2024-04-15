"use server";
import { connectToDB } from "../mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import Apartment from "../models/apartment.model";
import Listing from "../models/listing.model";
import ListingFeatures from "../models/listing_features.model";

import { revalidatePath } from "next/cache";

import { FilterQuery, SortOrder } from "mongoose";
import mongoose from "mongoose";
import { ListingStatus } from "../models/listingstatus";
import PlatformAccount from "../models/platform_account.model";

export async function fetchListings({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
    status='',
  }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
    status?:string
  }) {
    try {
      connectToDB();

      /*test
      let apt_query = Apartment.find({owner_id:userId})
      const apt = await apt_query.exec();
      return { listings:apt, isNext:true };
      */

      // Calculate the number of users to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;

      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");
  
      // Create an initial query object to filter apartment.
      const query: FilterQuery<typeof Listing> = {platform_account__owner__id: userId};
  
      // If the search string is not empty, add the $or operator to match either internal name or adress fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { internal_id: { $regex: regex } },
          { platform: { $regex: regex } },
          { title: { $regex: regex } },
        ];
      }
      if (status && status!=='all') {
        query.$and = [
          { status: status },
        ];
      }
  
      // Define the sort options for the fetched users based on createdAt field and provided sort order.
      const sortOptions = { createdAt: sortBy };
  
      const listingsQuery = Listing.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);
  
      // Count the total number of users that match the search criteria (without pagination).
      const totalListingsCount = await Listing.countDocuments(query);
  
      const listings = await listingsQuery.exec();

      // Check if there are more users beyond the current page.
      const isNext = totalListingsCount > skipAmount + listings.length;

      return { listings, isNext };
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  }

export async function listingStatusEvolution({internal_id}:{internal_id:string}){
  try {
    connectToDB();

    const listing = await Listing.findOne({internal_id:internal_id}).exec();
    if (!listing) {
      console.error("Listing not found");
      return; // Sortie anticipée si l'objet n'est pas trouvé
    }

    if(listing.status === ListingStatus.HOUSING_NOT_CONNECTED){
      listing.status = ListingStatus.CONNECTION_REQUESTED;
    }else if (listing.status === ListingStatus.PAYOUT_SETUP_REQUIRED){
      listing.status = ListingStatus.AWAITING_FINAL_APPROVAL;
    }

    await listing.save();


  } catch (error) {
      console.error("Error updating listing status:\t", error);
  throw error;
  }
}

export async function fetchListing(listingId: string) {
  try {
    connectToDB();
    console.log('apartmentId : \t',listingId)

    let apt = await Listing.findOne({ _id: listingId })
    .populate({path: 'listing_features',model: ListingFeatures})
    .populate({path: 'apartment',model: Apartment})
    .populate({path: 'platform_account',model: PlatformAccount})
    .exec();
    
    return apt;

  } catch (error: any) {
    throw new Error(`Failed to fetch apartment: ${error.message}`);
  }
}
interface Params {
  link: string;
  platform: string;
  title: string;
  apartment: string;
  picture: string;
  platform_account: string;
  path: string;
  internal_id: string;
  userId:string;
  status:string;
}

export async function updateListing({
  link,
  userId,
  status,
  platform,
  title,
  apartment,
  picture,
  platform_account,
  path,
  internal_id,
}: Params): Promise<void> {
  try {
    console.log('coucou from db')
    connectToDB();

    await Listing.findOneAndUpdate(
      { internal_id: internal_id },
      {
        link:link,
        platform:platform,
        title:title,
        picture:picture,
        apartment:apartment,
        platform_account:platform_account,
        listing_feature: null,
        status: status?status:ListingStatus.HOUSING_NOT_CONNECTED,
      },
      { upsert: true ,new: true}
    );

    if (path === "/listing/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update listing: ${error.message}`);
  }
}
