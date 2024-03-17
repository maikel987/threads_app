import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { fetchProperties, getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import Searchbar from "@/components/shared/Searchbar";
import PropertyCard from "@/components/cards/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import { getSignedUrl } from '@/lib/aws';


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

      // Modification directe de result.apartments pour inclure les URLs signées
  for (let property of result.apartments) {
    if (property.listings?.length > 0 && property.listings[0]?.picture) {
      try {
        const signedUrl = await getSignedUrl({
          objectKey: property.listings[0].picture,
          expiresInSeconds: 60 * 5, // Exemple : 5 minutes
        });
        // Mise à jour directe de la propriété picture de l'objet
        property.picture = signedUrl;
      } catch (error) {
        console.error("Error fetching signed URL", error);
        // Ici, vous pouvez laisser la propriété picture telle quelle ou la mettre à jour avec une valeur par défaut
        property.picture = '/assets/missingApt.webp';
      }
    } else {
      // Définition d'une image par défaut si aucune image n'est présente
      property.picture = '/assets/missingApt.webp';
    }
  }
    
  return (
    <section>
      <div className='flex w-full flex-col justify-start'>
        <div className='flex items-center justify-between'>
          <h1 className='head-text mb-10'>Search</h1>
          <Link href='/property/create'>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
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
            {result.apartments.map((property) => (
              <PropertyCard
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
      />
    </section>
  );
}

export default Page;
