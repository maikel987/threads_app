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
  title: string;
  status: string;
  link: string;
  imageUrl: string;
  platform: string;
  internal_id: string;
  id: string;
  conversation_number: string;
  updated_at: Date;
}

function ListingHeader({
  title,
  status,
  link,
  imageUrl,
  platform,
  internal_id,
  id,
  conversation_number,
  updated_at,
}: Props) {

  const colorClass = colorListingStatus[status as ListingStatus];
  const formattedStatus = status
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');



  return (
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3 pr-10'>
          
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


          <div className='flex-1'>
            <h2 className='text-left text-heading3-bold text-light-1'>
              {title}
            </h2>
            <p className='text-base-medium text-gray-1 pt-4'>{`Last update : ${format(new Date(updated_at), 'dd/MM/yyyy')}`}</p>
          </div>

        </div>
        <Link href={`/listing/edit/${id}`}>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 pl-4 pr-8 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />
              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>

     
      </div>



      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default ListingHeader;
