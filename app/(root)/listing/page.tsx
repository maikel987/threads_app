import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import Searchbar from "@/components/shared/Searchbar";
import PropertyCard from "@/components/cards/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import { getSignedImageUrl } from '@/lib/aws';
import { fetchListings } from "@/lib/actions/listing.actions";
import ListingCard from "@/components/cards/ListingCard";
import ListingCard2 from "@/components/cards/ListingCard2";


async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchListings({
    userId: userInfo._id,
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  const updateTasks = result.listings.map(async (listing) => {
    if (listing.picture) {
      try {
        // Tente de récupérer l'URL signée pour l'image
        const signedUrl = await getSignedImageUrl(listing.picture);
        listing.signedUrl = signedUrl;
      } catch (error) {
        console.error("Error fetching signed URL", error);
        listing.signedUrl = '/assets/missingListingPict.webp'; // Utiliser une image par défaut en cas d'erreur
      }
    } else {
        listing.signedUrl = '/assets/missingListingPict.webp'; // Image par défaut si aucune image n'est présente
    }
    return listing; // Renvoie la propriété mise à jour
  });
  const updatedListings = await Promise.all(updateTasks);


    
  return (
    <section>
      <div className='flex w-full flex-col justify-start'>
        <div className='flex items-center justify-between'>
          <h1 className='head-text mb-10'>Listings</h1>
          <Link href='/property/create'>
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

      <Searchbar routeType='listing' searchElement="Listing"/>

      <div className='mt-14 flex flex-col gap-9'>
        {result.listings.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {updatedListings.map((listing) => (
              <ListingCard2
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
        )}
      </div>

      <Pagination
        path='property'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  );
}

export default Page;
