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

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const propertyInfo = await fetchProperty(params.id);
  console.log("propertyInfo",propertyInfo)
  console.log("Comparatif des user info :\t",propertyInfo.owner.id,user.id,userInfo.id,userInfo._id );
  if(!propertyInfo.owner.id === userInfo.id) return null
  

  if (propertyInfo.listings?.length > 0 && propertyInfo.listings[0]?.picture) {
    try {
      const signedUrl = await getSignedImageUrl(propertyInfo.listings[0].picture);
      propertyInfo.picture = signedUrl; // Mise à jour du listing avec l'URL signée
    } catch (error) {
      console.error("Error fetching signed URL for listing", error);
      propertyInfo.picture = '/assets/missingApt.webp'; // Utiliser une image par défaut en cas d'erreur
    }
    } else {
      propertyInfo.picture = '/assets/missingApt.webp'; // Image par défaut si aucune image n'est présente
  }
  

  return (
    <section>
      <PropertyHeader
        internal_name = {propertyInfo.internal_name ? propertyInfo.internal_name : 'Internal Name missing'}
        address = {propertyInfo.address ? propertyInfo.address : 'Adress missing'}
        picture = {propertyInfo.picture ? propertyInfo.picture : '/assets/missingApt.webp'}
        id = {propertyInfo.id}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
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
          {propertyTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className='w-full text-light-1'
            >
                
              {/* @ts-ignore */}

              {/*<ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType='User'
          />*/}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;
