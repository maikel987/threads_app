"use client";

import React from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
  internal_id: string;
  link: string;
  picture: string;
  platform: string;
  status: string;
  title: string;
  updated_at: string;
}

function ListingCard({ internal_id, link, picture, platform, status, title, updated_at }: Props) {
  const router = useRouter();

  let imageUrl = picture;

  return (
    <article className='listing-card'>
      <div key={internal_id} className='listing-card_avatar'>
        {imageUrl && <div className='relative h-24 w-36'>
          <Image
            src={imageUrl}
            alt='listing_image'
            fill
            className='rounded object-cover'
            onLoad={() => console.log("Chargement terminé")}
            onError={(e) => console.error("Erreur de chargement de l'image", e)}
          />
        </div>}

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{title}</h4>
          <p className='text-small-medium text-gray-1'>{platform}</p>
          <p className='text-small-medium text-gray-1'>{status}</p>
        </div>
      </div>

      <Button
        className='listing-card_btn'
        onClick={() => {
          router.push(`/listing/${internal_id}`);
        }}
      >
        View
      </Button>
    </article>
  );
}

export default ListingCard;
