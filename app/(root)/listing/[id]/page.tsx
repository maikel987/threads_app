
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { listingTabs } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser } from "@/lib/actions/user.actions";

import { getSignedImageUrl } from "@/lib/aws";
import { fetchListing } from "@/lib/actions/listing.actions";
import ListingHeader from "@/components/shared/ListingHeader";
import { fetchListingFeature } from "@/lib/actions/listing_features.actions";
import { ListingStatus, colorListingStatus } from "@/lib/models/listingstatus";
import ListingConnectionCard from "@/components/cards/ListingConnectionCard";
import IntegrationCard from "@/components/cards/IntegrationCard";
import PropertyCardSmall from "@/components/cards/PropertyCardSmall";
import IntegrationCardSmall from "@/components/cards/IntegrationCardSmall";
import ListingFeatureCard from "@/components/cards/ListingFeatureCard";

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
    listings: ListingInfo[];
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

  const colorClass = colorListingStatus[listingInfo.status as ListingStatus];
  const formattedStatus = (listingInfo.status as string)
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');



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
        conversation_number={listingInfo.reservation?listingInfo.reservation.length:0}
        updated_at={listingInfo.updated_at}
      />

      <div className='mt-9'>
        <Tabs defaultValue='connectivity' className='w-full'>
          <TabsList className='tab'>
            {listingTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
              key='details'
              value='details'
              className='w-full text-light-1'
            >
                <div>
                  <ListingFeatureCard listing_feature= {listing_feature}/>
                </div>
  
            </TabsContent>
            <TabsContent
              key='connectivity'
              value='connectivity'
              className='w-full text-light-1'
            >
              <section className='mt-9 flex flex-col gap-10'>
                <>
                <ListingConnectionCard
                  colorClass={colorClass}
                  status={listingInfo.status}
                  link={listingInfo.link}
                  formattedStatus={formattedStatus}
                  platform={listingInfo.platform}
                  internal_id={listingInfo.internal_id}
                />
                </>
                <div className="flex items-center justify-center gap-10">
                  <h2 className='text-left text-heading3-bold text-light-1'> Property</h2>
                  <>
                    <PropertyCardSmall 
                    id={listingInfo.apartment.id}
                    key={listingInfo.apartment.id}
                    internal_name={listingInfo.apartment.internal_name ? listingInfo.apartment.internal_name : 'Internal Name missing'}
                    address={listingInfo.apartment.address != null ? listingInfo.apartment.address : 'Adress missing'}
                    />
                  </>
                </div>

              <div className="flex items-center justify-center gap-10">
                <h2 className='text-left text-heading3-bold text-light-1'> Integration</h2>
                <>
                <IntegrationCardSmall
                  key={listingInfo.platform_account.id}
                  id={listingInfo.platform_account.id}
                  platform={listingInfo.platform_account.platform}
                  username= {listingInfo.platform_account.username}
                  platform_account_id= {listingInfo.platform_account.platform_account_id}
                  updated_at= {listingInfo.platform_account.updated_at}
                  listings= {listingInfo.platform_account.listings}
                  status={listingInfo.platform_account.status}
                />
                </>
              </div>
              </section>

            </TabsContent>

          
        </Tabs>
      </div>
              
      </section>
  );
}
export default Page;
