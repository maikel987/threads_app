"use client";

import Link from "next/link";
import Image from "next/image";
import { platformLogo } from "@/constants";
import { ConnectionDialogue } from "../dialog/ConnectionDialog";
import { PayoutConfigurationDialog } from "../dialog/PayoutConfigurationDialog";
import { ListingStatus, colorListingStatus } from "@/lib/models/listingstatus";
import { Button } from "../ui/button";
import { format } from "date-fns";

interface Props {
  colorClass: string;
  status: string;
  link: string;
  formattedStatus: string;
  platform: string;
  internal_id: string;
}

function ListingConnectionCard({
  colorClass,
  status,
  link,
  formattedStatus,
  platform,
  internal_id,

}: Props) {
  
  return (
    <article className='bg-dark-2 rounded-lg shadow-md overflow-hidden text-white w-full'>

    <div className='flex items-center justify-between gap-4 p-4'>
            {platform && <div className='relative h-16 w-16 mr-3'>
          <Image
            src={platform in platformLogo ? platformLogo[platform as keyof typeof platformLogo] : '/assets/missingConnection.webp'}
            alt='platform_image'
            fill
            className='rounded-full object-cover'
            onLoad={() => console.log("Chargement terminé")}
            onError={(e) => console.error("Erreur de chargement de l'image", e)}
          />
        </div>}
    <div className='flex-1'>
      <h2 className='text-left text-heading3-bold text-light-1'> Connection</h2>
      <p className={`text-base-medium ${colorClass} pt-2`}>{formattedStatus}</p>
      </div>
      {link && <Button
    className='user-card_btn'
    type="button" 
    variant="secondary"
    onClick={() => {
      const url = link;
      window.open(url, "_blank");
      }}>
    Listing
  </Button>}
  <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
    {status===ListingStatus.HOUSING_NOT_CONNECTED
      && <ConnectionDialogue internal_id={internal_id}/>}
    {status===ListingStatus.PAYOUT_SETUP_REQUIRED
      && <PayoutConfigurationDialog internal_id={internal_id}/>}
  </div>
  
   </div>
  </article>
  );
}

export default ListingConnectionCard;
