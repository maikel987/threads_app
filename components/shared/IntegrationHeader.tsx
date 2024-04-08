"use client";

import Link from "next/link";
import Image from "next/image";
import { IntegrationStatus, IntegrationStatusColorClasses } from "@/lib/models/integrationStatus";
import { refreshIntegration } from "@/lib/actions/integration.actions";


interface Props {
  integrationId: string;
  userId: string;
  platform: string;
  username: string;
  imgUrl: string;
  status: string;
  updatedDate: string;
}

function IntegrationHeader({
  integrationId,
  userId,
  platform,
  username,
  imgUrl,
  updatedDate,
  status
}: Props) {

  const colorClass = IntegrationStatusColorClasses[status as IntegrationStatus];
  const formattedStatus = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    const handleRefreshClick = async () => {
      try {
        // Appel de la fonction refreshIntegration et attente de sa complétion
        await refreshIntegration({ integrationId });
      } catch (error) {
        console.error("Error refreshing integration", error);
      }
    };
  

  return (
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative h-20 w-20 object-cover'>
            <Image
              src={imgUrl}
              alt='logo'
              fill
              className='rounded-full object-cover shadow-2xl'
            />
          </div>

          <div className='flex-1'>
            <h2 className='text-left text-heading3-bold text-light-1'>
              {platform}
            </h2>
            <p className='text-base-medium text-gray-1'>@{username}</p>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          
          <Link href={`/integrationhub/edit/${integrationId}`}>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
                />

              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>
          {(status==='connected'||status==='failed') &&(
            <button onClick={handleRefreshClick}>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
                />

              <p className='text-light-2 max-sm:hidden'>Refresh</p>
            </div>
          </button>
              )}
        </div>

      </div>
      <div className="flex flex-row gap-5">
        <p className={`mt-6 max-w-lg text-base-regular ${colorClass}`}>{formattedStatus}</p>
        <p className='mt-6 max-w-lg text-base-regular text-light-2'>{updatedDate}</p>
      </div>

      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default IntegrationHeader;
