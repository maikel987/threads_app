import Image from "next/image";
import Link from "next/link";

import { format } from 'date-fns';
import { Button } from "../ui/button";
import { platformLogo } from "@/constants";

interface Props {
  id: string;
  platform:string;
  username: string;
  platform_account_id: string;
  updated_at: Date;
  listings: {
    picture:string;
    title:string;
    signedURL: string;
  }[];
}
function IntegrationCard({ id,platform,username,platform_account_id,updated_at,listings}: Props) {
  return (
    <article className='community-card'>
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
          <p className='text-small-medium text-gray-1'>@{username ? username : platform_account_id}</p>
        </div>
      </div>

      <p className='mt-4 text-subtle-medium text-gray-1'>{updated_at ? format(new Date(updated_at), 'dd/MM/yyyy') : ''}</p>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <Link href={`/integrationhub/${id}`}>
          <Button size='sm' className='community-card_btn'>
            View
          </Button>
        </Link>
        {listings.length > 0 && (
          <div className='flex items-center'>
            {listings.slice(0, 5).map((member, index) => (
              <Image
                key={index}
                src={member.signedURL}
                alt={`listing_${index}`}
                width={40}
                height={40}
                className={`${index !== 0 ? "-ml-2" : ""} rounded-full object-cover`}
              />
            ))}
            {listings.length > 5 && (
              <p className='ml-1 text-subtle-medium text-gray-1'>
                +{listings.length - 5} more
              </p>
            )}
          </div>
        )}

      </div>
    </article>
  );
}

export default IntegrationCard;
