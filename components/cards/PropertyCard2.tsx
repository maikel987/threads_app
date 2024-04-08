"use client";
import React from 'react';
import Image from "next/image";
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { useRouter } from "next/navigation";

interface ListingProps {
  id: string;
  internal_name: string;
  address: string;
  picture: string;
}


function PropertyCard2({
  id,
  internal_name,
  picture,
  address,
}: ListingProps) {
  const router = useRouter();

  const imageUrl = picture; // Assurez-vous que c'est le chemin correct vers votre image

  return (
    <article className='bg-dark-2 rounded-lg shadow-md overflow-hidden text-white'>
      <div className='relative h-48 w-full'>
        <Image
          src={imageUrl}
          alt={`Listing image for ${internal_name}`}
          layout='fill'
          objectFit='cover'
          className='object-cover' // S'assurer que la classe est nécessaire ici
        />
      </div>

  <div className='flex items-center gap-4 p-4'>
    <div className='flex-1'>
      <h5 className='text-lg font-bold'>{internal_name}</h5>
      <p className='text-gray-400'>{address}</p>
    </div>
    <Button
      className='user-card_btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'
      onClick={() => {
          router.push(`/property/${id}`);
      }}
    >
      View
    </Button>
  </div>


    </article>
  );
}

export default PropertyCard2;
