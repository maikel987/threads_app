import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs, propertyTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";


import { getSignedImageUrl } from "@/lib/aws";
import ListingCard3 from "@/components/cards/ListingCard3";
import { fetchListing } from "@/lib/actions/listing.actions";
import ListingHeader from "@/components/shared/ListingHeader";
import { fetchListingFeature } from "@/lib/actions/listing_features.actions";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const listingInfo = await fetchListing(params.id);
  console.log("ListingInfo",listingInfo);
  console.log("ListingInfo listing_features",listingInfo.listing_features);
  console.log("Comparatif des user info :\t",listingInfo.platform_account.owner._id,"##",user.id,"##",userInfo.id,"##",userInfo._id );
  const listing_feature = await fetchListingFeature(params.id)
  console.log("listing_feature",listing_feature);


  if(listingInfo.platform_account.owner._id.toString() !== userInfo.id.toString()) return null
  
  interface ObjectId {
    _id: string;
  }
  
  interface ApartmentInfo {
    _id: ObjectId;
    address: null | string;
    checkin_process: null | string;
    created_at: Date;
    internal_name: string;
    listings: ObjectId[];
    owner: ObjectId;
    updated_at: Date;
    urgent_number: null | string;
  }
  
  interface PlatformAccountInfo {
    _id: ObjectId;
    created_at: Date;
    listings: ObjectId[];
    owner: ObjectId;
    password: string;
    platform: string;
    platform_account_id: string;
    updated_at: Date;
    username: string;
    account_url: string;
    status: string; // Vous pouvez remplacer ce type par un enum si vous avez une liste prédéfinie de statuts possibles.
  }
  
  interface ListingFeatures {
    features: string;
    sleeping: string[];
    description: string[];
    amenities: string[];
    rules: string[];
    safety: string[];
    listing: ObjectId;
    created_at: Date;
    updated_at: Date;
  }

  interface ListingInfo {
    _id: ObjectId;
    apartment: ApartmentInfo;
    conversation_ID_archives: ObjectId[];
    created_at: Date;
    internal_id: string;
    link: string;
    listing_features: ListingFeatures; // Remplacez ce type par une interface dédiée si vous décidez de la définir plus tard.
    picture: string;
    platform: string;
    platform_account: PlatformAccountInfo;
    status: string; // Même note que pour status dans PlatformAccountInfo.
    title: string;
    updated_at: Date;
  }

  if (listingInfo.picture) {
    try {
      // Tente de récupérer l'URL signée pour l'image
      const signedUrl = await getSignedImageUrl(listingInfo.picture);
      listingInfo.signedUrl = signedUrl;
    } catch (error) {
      console.error("Error fetching signed URL", error);
      listingInfo.signedUrl = '/assets/missingListingPict.webp'; // Utiliser une image par défaut en cas d'erreur
    }
  } else {
    listingInfo.signedUrl = '/assets/missingListingPict.webp'; // Image par défaut si aucune image n'est présente
  }


  return (
    <section>
      <ListingHeader
        title={listingInfo.title}
        status={listingInfo.status}
        link={listingInfo.link}
        imageUrl={listingInfo.signedUrl}
        platform={listingInfo.platform}
        internal_id={listingInfo.internal_id}
        id={listingInfo.id}
        conversation_number={listingInfo.conversation_ID_archives.length}
        updated_at={listingInfo.updated_at}
      />
{/*
      <div className='mt-9'>
        <Tabs defaultValue='listings' className='w-full'>
          <TabsList className='tab'>
            {propertyTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Listings" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {propertyInfo.listings.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
            <TabsContent
              key='listings'
              value='listings'
              className='w-full text-light-1'
            >
              <section className='mt-9 flex flex-col gap-10'>
                <>
              {propertyInfo.listings.map((listing:ListingInfo)=>(
                <ListingCard3
                dbId={listing._id}
                key={listing.internal_id}
                internal_id = {listing.internal_id}
                link = {listing.link}
                picture = {listing.signedUrl}
                platform = {listing.platform}
                status = {listing.status}
                title = {listing.title}
                updated_at = {listing.updated_at}
                />
                ))}
                </>
              </section>
            </TabsContent>
            <TabsContent
              key='two'
              value='property'
              className='w-full text-light-1'
            >
                <div>two</div>
  
            </TabsContent>
          
        </Tabs>
      </div>
              */}
      </section>
  );
}
export default Page;
