import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { format } from 'date-fns';

import { integrationHubTabs, platformLogo } from "@/constants";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchPlatformAccountDetails, refreshIntegration } from "@/lib/actions/integration.actions";
import IntegrationHeader from "@/components/shared/IntegrationHeader";
import { getSignedImageUrl } from "@/lib/aws";
import ListingCard3 from "@/components/cards/ListingCard3";
import { redirect} from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page({ params,searchParams }: { params: { id: string },  searchParams: { [key: string]: string | undefined }}) {
  
  if(searchParams?.refresh === "true"){
    await refreshIntegration({integrationId: params.id});
    redirect(`/integrationhub/${params.id}`);
  }

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const platformAccountDetails = await fetchPlatformAccountDetails(params.id);

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
  interface platformAccount{
    listings:[ListingInfo]
  }

  async function enhanceplatformAccountWithSignedUrls(platformAccount:platformAccount) {
    if (platformAccount.listings?.length > 0) {
      const signedUrlPromises = platformAccount.listings.map(listing =>
        getSignedImageUrl(listing.picture).catch(() => '/assets/missingApt.webp') // Retourne une image par défaut en cas d'erreur
      );
  
      try {
        const signedUrls = await Promise.all(signedUrlPromises);
  
        // Attribuer chaque URL signée (ou l'image par défaut en cas d'erreur) à son listing correspondant
        platformAccount.listings.forEach((listing, index) => {
          listing.signedUrl = signedUrls[index];
        });
  
        // Trouver la première URL signée valide pour platformAccount
        
      } catch (error) {
        console.error("Error fetching signed URLs for listings", error);
      }
    }
  }
  
  await enhanceplatformAccountWithSignedUrls(platformAccountDetails);

  return (
    <section>
      <IntegrationHeader
        integrationId={platformAccountDetails.id}
        userId={userInfo.id}
        platform={platformAccountDetails.platform}
        username={platformAccountDetails.username ? platformAccountDetails.username : platformAccountDetails.platform_account_id}
        imgUrl={platformAccountDetails.platform in platformLogo ? platformLogo[platformAccountDetails.platform as keyof typeof platformLogo] : '/assets/missingConnection.webp'}
        updatedDate={platformAccountDetails.updated_at ? `Last update : ${format(new Date(platformAccountDetails.updated_at), 'dd/MM/yyyy')}` : ''}
        status= {platformAccountDetails.status}
      />

      <div className='mt-9'>
        <Tabs defaultValue='listings' className='w-full'>
          <TabsList className='tab'>
            {integrationHubTabs.map((tab) => (
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
                    {platformAccountDetails.listings.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='listings' className='w-full text-light-1'>
          <section className='mt-9 flex flex-col gap-10'>
                <>
              {platformAccountDetails.listings.map((listing:ListingInfo)=>(
                <ListingCard3
                dbId={listing._id.toString()}
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

          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {/*platformAccountDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))*/}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;
