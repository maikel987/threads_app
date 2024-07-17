"use client";

import Link from "next/link";
import Image from "next/image";
import { IntegrationStatus, IntegrationStatusColorClasses } from "@/lib/models/integrationStatus";
import { refreshIntegration } from "@/lib/actions/integration.actions";
import { toast } from "../ui/use-toast";
import { refreshHospitable } from "@/lib/actions/hospitable.actions";
import { useState } from "react";


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
  const [isRefreshing, setIsRefreshing] = useState(false); // État pour gérer le bouton de rafraîchissement
  const [integrationStatus, setIntegrationStatus] = useState(status); // État pour gérer le statut d'intégration


  const handleRefreshClick = async () => {
    setIsRefreshing(true); // Désactive le bouton de rafraîchissement
    setIntegrationStatus("refreshing"); // Change le statut à "refreshing"
    try {
      // Appel de la fonction refreshIntegration et attente de sa complétion
      if (platform === 'hospitable'){
        await refreshHospitable(integrationId, userId)
        .then(() => {
          toast({
            title: "Synchronization Completed",
            description: "All data has been successfully synchronized.",
            variant: "default",  
          });
          setIntegrationStatus("connected"); // Met à jour le statut à "connected" en cas de succès
        })
        .catch(error => {
          console.error('Erreur lors du traitement:', error);
          toast({
            title: "Synchronization Failed",
            description: "An error occurred during data synchronization. Please try again.",
            variant: "destructive",
          });
          setIntegrationStatus("failed"); // Met à jour le statut à "failed" en cas d'erreur
        });
      }

    } catch (error) {
      console.error("Error refreshing integration", error);
      setIntegrationStatus("failed"); // Met à jour le statut à "failed" en cas d'erreur
    } finally {
      setIsRefreshing(false); // Réactive le bouton de rafraîchissement
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
            <button onClick={handleRefreshClick} disabled={isRefreshing}>
            <div className={`flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Image
                src='/assets/edit.svg'
                alt='refresh'
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
        <p className={`mt-6 max-w-lg text-base-regular ${IntegrationStatusColorClasses[integrationStatus as IntegrationStatus]}`}>{
        integrationStatus
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        }</p>
        <p className='mt-6 max-w-lg text-base-regular text-light-2'>{updatedDate}</p>
      </div>

      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default IntegrationHeader;
