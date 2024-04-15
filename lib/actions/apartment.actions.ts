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

interface Params {
    userId: string;
    property_id: string;
    internal_name: string;
    checkin_process: string;
    address: string;
    urgent_number: string;
    path:string;
  }

  export async function updateProperty({
    userId,
    property_id,
    internal_name,
    checkin_process,
    address,
    urgent_number,
    path,
  }: Params): Promise<void> {
    try {
      await connectToDB();
  
      if (property_id) {
        // Mise à jour d'un appartement existant
        await Apartment.findOneAndUpdate(
          { _id: property_id },
          {
            owner : userId,
            internal_name : internal_name,
            checkin_process : checkin_process,
            address : address,
            urgent_number : urgent_number,
            updated_at: new Date(),
          }
        );
      } else {
        // Création d'un nouvel appartement
        const newApartment = new Apartment({
          owner : userId,
          internal_name : internal_name,
          checkin_process : checkin_process,
          address : address,
          urgent_number : urgent_number,
        });
        await newApartment.save();
      }
  
      if (path === `/property/edit/${property_id}`) {
        revalidatePath(path);
      }
    } catch (error: any) {
      throw new Error(`Failed to create/update apartment: ${error.message}`);
    }
  }
  
export async function addApartement({
    userId,
    property_id,
    internal_name,
    checkin_process,
    address,
    urgent_number,
  }: Params): Promise<void> {
    try {
      connectToDB();

      console.log("userId last",userId);

      const UserIdObject = await User.findOne(
        { internal_id: userId },
        { _id: 1 }
      );
      console.log("UserIdObject",UserIdObject);

      await Apartment.create({
        owner : userId,
        internal_name : internal_name,
        checkin_process : checkin_process,
        address : address,
        urgent_number : urgent_number,
      })
  
    } catch (error: any) {
      throw new Error(`Failed to create/update apartment: ${error.message}`);
    }
  }

export async function getApartment(userId: string) {
    try {
        connectToDB();

        const  userApartment = await Apartment.find({owner:userId}).populate({path: 'listings',model: Listing,select:'picture title'}).exec();

        return userApartment;
        } catch (error) {
        console.error("Error fetching replies: ", error);
        throw error;
        }
    }

    //fetchProperty
export async function fetchProperties({
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

        /*test
        let apt_query = Apartment.find({owner_id:userId})
        const apt = await apt_query.exec();
        return { apartments:apt, isNext:true };
        */

        // Calculate the number of users to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");
    
        // Create an initial query object to filter apartment.
        const query: FilterQuery<typeof Apartment> = {owner__id: userId};
    
        // If the search string is not empty, add the $or operator to match either internal name or adress fields.
        if (searchString.trim() !== "") {
          query.$or = [
            { internal_name: { $regex: regex } },
            { address: { $regex: regex } },
          ];
        }
    
        // Define the sort options for the fetched users based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };
    
        const apartmentsQuery = Apartment.find(query)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(pageSize);
    
        // Count the total number of users that match the search criteria (without pagination).
        const totalApartmentsCount = await Apartment.countDocuments(query);
    
        const apartments = await apartmentsQuery.populate({path: 'listings',model: Listing,select:'picture title'}).exec();

        // Check if there are more users beyond the current page.
        const isNext = totalApartmentsCount > skipAmount + apartments.length;

        return { apartments, isNext };
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }

export async function fetchProperty(apartmentId: string) {
      try {
        connectToDB();
        console.log('apartmentId : \t',apartmentId)

        let apt = await Apartment.findOne({ _id: apartmentId })
        .populate({path: 'listings',model: Listing})
        .populate({path: 'owner',model: User,select:'internal_id'})
        .exec();
        
        return apt;

      } catch (error: any) {
        throw new Error(`Failed to fetch apartment: ${error.message}`);
      }
    }
    export async function fetchPropertyByUser({
      userId,
      sortBy = "asc",
    }: {
      userId: string;
      sortBy?: SortOrder;
    }) {
      try {
        connectToDB();
        // Créez un objet de requête initial pour filtrer les PlatformAccount.
        // Incluez le filtre platform uniquement si platform n'est pas une chaîne vide.
        const query: FilterQuery<typeof Apartment> = { owner__id: userId };

        // Define the sort options for the fetched apartment based on createdAt field and provided sort order.
        const sortOptions = { internal_name: sortBy };
    
        // Create a query to fetch the apartment based on the search and sort criteria.
        const apartmentQuery = Apartment.find(query)
          .select('_id internal_name address listings') 
          .sort(sortOptions)
  
        // Count the total number of apartment that match the search criteria (without pagination).
    
        const apartment = await apartmentQuery.exec();
    
        // Check if there are more apartment beyond the current page.
    
        return apartment;
      } catch (error) {
        console.error("Error fetching apartment:", error);
        throw error;
      }
    }  