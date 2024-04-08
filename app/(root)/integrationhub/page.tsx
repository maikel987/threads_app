import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";

import { fetchUser } from "@/lib/actions/user.actions";

import { fetchPlatformAccount } from "@/lib/actions/integration.actions";
import IntegrationCard from "@/components/cards/IntegrationCard";
import { getSignedImageUrl } from "@/lib/aws";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPlatformAccount({
    userId: userInfo._id,
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  interface Listing {
    _id: string;
    internal_id?: string;
    link?: string;
    platform?: string;
    status?: string;
    apartment?: string; // Utilisez string ici pour simplifier, ajustez selon vos besoins
    conversation_ID_archives?: string[];
    picture?: string;
    platform_account?: string;
    title?: string;
    created_at?: Date;
    updated_at?: Date;
    signedURL?:string;
  }
  
  const updateIntegrationsTasks = result.platformAccount.map(async (integration) => {
    const updateListingsTasks = integration.listings.map(async (listing:Listing) => {
      if (listing.picture) {
        try {
          // Tente de récupérer l'URL signée pour l'image de chaque listing
          const signedUrl = await getSignedImageUrl(listing.picture);
          listing.signedURL = signedUrl; // Mise à jour de l'image du listing avec l'URL signée
        } catch (error) {
          console.error("Error fetching signed URL for listing", error);
          listing.signedURL = '/assets/missingApt.webp'; // Utiliser une image par défaut en cas d'erreur
        }
      } else {
        listing.signedURL = '/assets/missingApt.webp'; // Image par défaut si aucune image n'est présente
      }
      return listing; // Renvoie le listing mis à jour
    });

    // Attend que toutes les tâches de mise à jour des listings soient terminées pour l'intégration actuelle
    integration.listings = await Promise.all(updateListingsTasks);
    return integration; // Renvoie l'intégration mise à jour
  });

  // Attend que toutes les tâches de mise à jour des intégrations soient terminées
  const updatedIntegrations = await Promise.all(updateIntegrationsTasks);


  return (
    <>
      <div className='flex w-full flex-col justify-start'>
        <div className='flex items-center justify-between'>
          <h1 className='head-text'>Integration Hub</h1>
          <Link href='/integrationhub/create'>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='add_property'
                width={16}
                height={16}
              />

              <p className='text-light-2 max-sm:hidden'>Add</p>
            </div>
          </Link>
        </div>
      </div>
      <div className='mt-5'>
        <Searchbar routeType='integrationhub' searchElement="Integration"/>
      </div>

      <section className='mt-9 flex flex-wrap gap-4'>
        {result.platformAccount.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {updatedIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                id={integration.id}
                platform={integration.platform}
                username= {integration.username}
                platform_account_id= {integration.platform_account_id}
                updated_at= {integration.updated_at}
                listings= {integration.listings}
                status={integration.status}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='integrationhub'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Page;
