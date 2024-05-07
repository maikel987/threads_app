import Image from "next/image";
import Link from "next/link";

import { format } from 'date-fns';
import { Button } from "../ui/button";
import { platformLogo } from "@/constants";
import { IntegrationStatus, IntegrationStatusColorClasses } from "@/lib/models/integrationStatus";

interface Props {
  id: string;
  platform:string;
  username: string;
  platform_account_id: string;
  updated_at: Date;
  status:string
  listings: {
    picture:string;
    title:string;
    signedURL: string;
  }[];
}
function IntegrationCardSmall({ id,platform,username,platform_account_id,updated_at,listings,status}: Props) {

  const colorClass = IntegrationStatusColorClasses[status as IntegrationStatus];
  const formattedStatus = status
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

  return (
    <article className='community-card w-full'>
      <div className='flex flex-wrap justify-between'>
        <div className='flex flex-wrap gap-3 flex-grow flex-col'> 

          <div className='flex flex-wrap items-center gap-3'>
            <Link href={`/integrationhub/${id}`} className='relative h-12 w-12'>
              <Image
                src={platform in platformLogo ? platformLogo[platform as keyof typeof platformLogo] : '/assets/missingConnection.webp'}
                alt='platform_logo'
                fill
                className='rounded-full object-cover'
              />
            </Link>

            <div>
              <Link href={`/integrationhub/${id}`}>
                <h4 className='text-base-semibold text-light-1'>  {platform? platform.charAt(0).toUpperCase() + platform.slice(1) : ''}</h4>
              </Link>
              <p className='text-small-medium text-gray-1 mt-1/2'>@{username ? username : platform_account_id}</p>
              <p className='mt-1/2 text-subtle-medium text-gray-1'>{listings.length+' Listing'+(listings.length>1 ? 's' : '')}</p>
            </div>
          </div>

        <div className="flex flex-row gap-2">
        <p className={`mt-4 text-subtle-medium ${colorClass}`}>{formattedStatus}</p>
        <p className='mt-4 text-subtle-medium text-gray-1'>{updated_at ? format(new Date(updated_at), 'dd/MM/yyyy') : ''}</p>
        </div>
      </div>
      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <Link href={`/integrationhub/${id}`}>
          <Button size='sm' className='community-card_btn'>
            View
          </Button>
        </Link>
  
      </div>
      </div>
    </article>
  );
}

export default IntegrationCardSmall;
