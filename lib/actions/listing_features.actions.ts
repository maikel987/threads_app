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



export async function fetchListingFeature(listingId: string) {
  try {
    connectToDB();
    console.log('ListingId : \t',listingId)

    let listing_feature = await ListingFeatures.findOne({ listing: listingId }).exec();
    
    return listing_feature;

  } catch (error: any) {
    throw new Error(`Failed to fetch apartment: ${error.message}`);
  }
}
