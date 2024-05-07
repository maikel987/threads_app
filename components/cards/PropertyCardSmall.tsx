"use client";
import React from 'react';
import Image from "next/image";
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { useRouter } from "next/navigation";

interface ListingProps {
  id: string;
  internal_name: string;
  address: string;
}


function PropertyCardSmall({
  id,
  internal_name,
  address,
}: ListingProps) {
  const router = useRouter();


  return (
    <article className='bg-dark-2 rounded-lg shadow-md overflow-hidden text-white w-full'>
      <div className='flex items-center gap-4 p-4'>
        <div className='flex-1'>
          <h5 className='text-lg font-bold'>{internal_name}</h5>
          <p className='text-gray-400'>{address?address:'Adress missing'}</p>
        </div>
        <Button
          className='user-card_btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'
          onClick={() => {
              router.push(`/property/${id}`);
          }}
        >
          View
        </Button>
      </div>
    </article>
  );
}

export default PropertyCardSmall;
