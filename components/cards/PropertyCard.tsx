"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";


interface Props {
  id: string;
  internal_name: string;
  address: string;
  picture: string;
}

function PropertyCard({ id, internal_name, address, picture }: Props) {

  const router = useRouter();

  let imageUrl = picture;
  return (
    <article className='user-card'>
      <div key={id} className='user-card_avatar'>
        {imageUrl && <div className='relative h-12 w-12'>
          <Image
            src={imageUrl}
            alt='property_image'
            fill
            className='rounded-full object-cover'
            onLoad={() => console.log("Chargement terminé")}
            onError={(e) => console.error("Erreur de chargement de l'image", e)}
          />
        </div>}

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{internal_name}</h4>
          <p className='text-small-medium text-gray-1'>{address}</p>
        </div>
      </div>

      <Button
        className='user-card_btn'
        onClick={() => {
            router.push(`/property/${id}`);
        }}
      >
        View
      </Button>
    </article>
  );
}

export default PropertyCard;
