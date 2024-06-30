import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { fetchProperties, getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import Searchbar from "@/components/shared/Searchbar";
import PropertyCard from "@/components/cards/PropertyCard";
import Pagination from "@/components/shared/Pagination3";
import { getSignedImageUrl } from '@/lib/aws';
import PropertyCard2 from "@/components/cards/PropertyCard2";


async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const apartment = await getApartment(userInfo._id);
  //console.log("activity",apartment);

  const result = await fetchProperties({
    userId: userInfo._id,
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });


  const updateTasks = result.apartments.map(async (property) => {
    if (property.listings?.length > 0 && property.listings[0]?.picture) {
      try {
        // Tente de récupérer l'URL signée pour l'image
        const signedUrl = await getSignedImageUrl(property.listings[0].picture);
        property.picture = signedUrl;
      } catch (error) {
        console.error("Error fetching signed URL", error);
        property.picture = '/assets/missingApt.webp'; // Utiliser une image par défaut en cas d'erreur
      }
    } else {
      property.picture = '/assets/missingApt.webp'; // Image par défaut si aucune image n'est présente
    }
    return property; // Renvoie la propriété mise à jour
  });
  const updatedProperties = await Promise.all(updateTasks);


    
  return (
    <section>
      <div className='flex w-full flex-col justify-start'>
        <div className='flex items-center justify-between'>
          <h1 className='head-text mb-10'>Properties</h1>
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

      <Searchbar routeType='property' searchElement="Property"/>

      <div className='mt-14 flex flex-col gap-9'>
        {result.apartments.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {updatedProperties.map((property) => (
              <PropertyCard2 
              id={property.id}
              key={property.id}
              internal_name={property.internal_name ? property.internal_name : 'Internal Name missing'}
              address={property.address != null ? property.address : 'Adress missing'}
              picture={property.picture}
              />
            ))}
          </>
        )}
      </div>

      <Pagination
        path='property'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
        pageMax={result.pageMax}
      />
    </section>
  );
}

export default Page;
