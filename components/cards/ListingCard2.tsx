"use client";
import React from 'react';
import Image from "next/image";
import { format } from 'date-fns';

interface ListingProps {
  internal_id: string;
  link: string;
  picture: string;
  platform: string;
  status: string;
  title: string;
  updated_at: Date;
}

function ListingCard2({
  internal_id,
  link,
  picture,
  platform,
  status,
  title,
  updated_at
}: ListingProps) {
  
  const imageUrl = picture; // Assurez-vous que c'est le chemin correct vers votre image

  return (
    <article className='bg-dark-2 rounded-lg shadow-md overflow-hidden text-white'>
      <div className='relative h-48 w-full'>
        <Image
          src={imageUrl}
          alt={`Listing image for ${title}`}
          layout='fill'
          objectFit='cover'
          className='object-cover' // S'assurer que la classe est nécessaire ici
        />
      </div>
      <div className='p-4'>
        <h5 className='text-lg font-bold'>{title}</h5>
        <p className='text-gray-400'>Platform: {platform}</p> {/* Texte un peu plus clair pour la lisibilité */}
        <p className='text-gray-400'>Status: {status}</p> {/* Idem */}

        <p className='mt-4 text-subtle-medium'>{updated_at ? format(updated_at, 'dd/MM/yyyy') : ''}</p>

        <div className='mt-4'>
          <a href={link} target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:text-blue-300 hover:underline'>View Listing</a> {/* Texte en bleu pour le contraste */}
        </div>
      </div>
    </article>
  );
}

export default ListingCard2;
