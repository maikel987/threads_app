"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { platformLogo } from '@/constants';
import { ConnectionDialogue } from '../dialog/ConnectionDialog';
import { ListingStatus, colorListingStatus } from '@/lib/models/listingstatus';
import { PayoutConfigurationDialog } from '../dialog/PayoutConfigurationDialog';




interface ListingProps {
  internal_id: string;
  link: string;
  picture: string;
  platform: string;
  status: string;
  title: string;
  updated_at: Date;
}

function ListingCard3({ internal_id, title, status, picture,platform,updated_at }: ListingProps) {

  const router = useRouter();
  

  const colorClass = colorListingStatus[status as ListingStatus];

    
  const formattedStatus = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let imageUrl = picture;

  return (
    <article className='user-card'>
      <div key={internal_id} className='user-card_avatar'>
      {imageUrl && <div className='relative h-20 w-20'>
          <Image
            src={imageUrl}
            alt='property_image'
            fill
            className='rounded-full object-cover'
            onLoad={() => console.log("Chargement terminé")}
            onError={(e) => console.error("Erreur de chargement de l'image", e)}
          />
        </div>}
      {platform && <div className='relative h-8 w-8' style={{ marginLeft: '-35px',marginTop: '40px'  }}>
          <Image
            src={platform in platformLogo ? platformLogo[platform as keyof typeof platformLogo] : '/assets/missingConnection.webp'}
            alt='platform_image'
            fill
            className='rounded-full object-cover'
            onLoad={() => console.log("Chargement terminé")}
            onError={(e) => console.error("Erreur de chargement de l'image", e)}
          />
        </div>}


        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{title}</h4>
          <p className={`text-small-medium ${colorClass}`}>{formattedStatus}</p>
        </div>
      </div>
            {status===ListingStatus.HOUSING_NOT_CONNECTED
      && <ConnectionDialogue internal_id={internal_id}/>}
            {status===ListingStatus.PAYOUT_SETUP_REQUIRED
      && <PayoutConfigurationDialog internal_id={internal_id}/>}

      <Button
        className='user-card_btn'
        onClick={() => {
            router.push(`/property/${internal_id}`);
        }}
        >
        View
      </Button>
    </article>
  );
}

export default ListingCard3;
