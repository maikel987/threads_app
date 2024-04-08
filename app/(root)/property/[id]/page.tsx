import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs, propertyTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";
import PropertyHeader from "@/components/shared/PropertyHeader";
import { fetchProperty } from "@/lib/actions/apartment.actions";
import { getSignedImageUrl } from "@/lib/aws";
import ListingCard3 from "@/components/cards/ListingCard3";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const propertyInfo = await fetchProperty(params.id);
  console.log("propertyInfo",propertyInfo)
  console.log("Comparatif des user info :\t",propertyInfo.owner.id,user.id,userInfo.id,userInfo._id );
  if(!propertyInfo.owner.id === userInfo.id) return null
  
  interface ListingInfo
  {  
    _id: string,
    apartment: string,
    conversation_ID_archives: [],
    created_at: Date,
    internal_id: string,
    link: string,
    listing_features?: string,
    picture: string,
    platform: string,
    platform_account: string,
    status: string,
    title: string,
    updated_at: Date,
    signedUrl:string, 
  }

  interface PropertyInfo {
    id:string,
    address?:string,
    checkin_process?:string,
    created_at: Date,
    internal_name: string,
    updated_at: Date,
    urgent_number?: string,
    signedUrl?:string,
    listings: [ListingInfo],
    owner: {
      _id: string,
      internal_id: string,
    },
  }

  async function enhancePropertyInfoWithSignedUrls(propertyInfo:PropertyInfo) {
    if (propertyInfo.listings?.length > 0) {
      const signedUrlPromises = propertyInfo.listings.map(listing =>
        getSignedImageUrl(listing.picture).catch(() => '/assets/missingApt.webp') // Retourne une image par défaut en cas d'erreur
      );
  
      try {
        const signedUrls = await Promise.all(signedUrlPromises);
  
        // Attribuer chaque URL signée (ou l'image par défaut en cas d'erreur) à son listing correspondant
        propertyInfo.listings.forEach((listing, index) => {
          listing.signedUrl = signedUrls[index];
        });
  
        // Trouver la première URL signée valide pour propertyInfo
        console.log('signedUrls',signedUrls)
        const validSignedUrl = signedUrls.find(url => url !== '/assets/missingApt.webp');
        console.log('validSignedUrl',validSignedUrl)
        propertyInfo.signedUrl = validSignedUrl || '/assets/missingApt.webp';
        console.log('propertyInfo.signedUrl',propertyInfo.signedUrl)

      } catch (error) {
        console.error("Error fetching signed URLs for listings", error);
        // Si une erreur générale se produit, attribuer l'image par défaut à propertyInfo
        propertyInfo.signedUrl = '/assets/missingApt.webp';
      }
    } else {
      // Aucun listing présent, attribuer l'image par défaut à propertyInfo
      propertyInfo.signedUrl = '/assets/missingApt.webp';
    }
  }
  
  // Assurez-vous que la fonction getSignedImageUrl et l'objet propertyInfo sont correctement définis
  await enhancePropertyInfoWithSignedUrls(propertyInfo);



  return (
    <section>
      <PropertyHeader
        internal_name = {propertyInfo.internal_name ? propertyInfo.internal_name : 'Internal Name missing'}
        address = {propertyInfo.address ? propertyInfo.address : 'Adress missing'}
        picture = {propertyInfo.signedUrl ? propertyInfo.signedUrl : '/assets/missingApt.webp'}
        id = {propertyInfo.id}
      />

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
    </section>
  );
}
export default Page;
