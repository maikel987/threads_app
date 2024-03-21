import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { format } from 'date-fns';

import { integrationHubTabs, platformLogo } from "@/constants";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchPlatformAccountDetails } from "@/lib/actions/integration.actions";
import IntegrationHeader from "@/components/shared/IntegrationHeader";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const platformAccountDetails = await fetchPlatformAccountDetails(params.id);
  
  return (
    <section>
      <IntegrationHeader
        integrationId={platformAccountDetails.id}
        userId={user.id}
        platform={platformAccountDetails.platform}
        username={platformAccountDetails.username ? platformAccountDetails.username : platformAccountDetails.platform_account_id}
        imgUrl={platformAccountDetails.platform in platformLogo ? platformLogo[platformAccountDetails.platform as keyof typeof platformLogo] : '/assets/missingConnection.webp'}
        updatedDate={platformAccountDetails.updated_at ? `Last update : ${format(new Date(platformAccountDetails.updated_at), 'dd/MM/yyyy')}` : ''}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
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

          <TabsContent value='threads' className='w-full text-light-1'>
            {/* @ts-ignore */}
            {/*<ThreadsTab
              currentUserId={user.id}
              accountId={platformAccountDetails._id}
              accountType='Community'
                />*/}
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
