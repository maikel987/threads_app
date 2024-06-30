import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ObjectId } from 'mongodb'; // Assuming you're using MongoDB for ObjectId parsing
import React from 'react';

// Utilisez ces informations pour compléter les zones de texte et la date si nécessaire
// Ajustez les noms de propriété en fonction de votre modèle de données réel
interface Props {
    _id: ObjectId;
    amenities: string[];
    created_at: Date;
    description: string[];
    features: string;
    listing: ObjectId;
    rules: string[];
    safety: string[];
    sleeping: string[];
    updated_at: Date;
  };

const ListingFeatureCard = ({ listing_feature }:{listing_feature:Props}) => {
  console.log('listing_feature',listing_feature)
    // Convert ObjectId to string if necessary
  const id = listing_feature._id.toString();

  // Format date using date-fns or similar library
  const updatedAt = format(new Date(listing_feature.updated_at), 'dd/MM/yyyy');

  const formattedAmenities = listing_feature.amenities?listing_feature.amenities.map((item) =>
  item.split('\n').map((line, index, arr) => (
    <React.Fragment key={index}>
      {line}
      {index !== arr.length - 1 && <br />} {/* Ajouter un saut de ligne sauf après la dernière ligne */}
    </React.Fragment>
  ))
):[];

  return (
    <section>
       <div className='flex items-center gap-4 p-4'>
      <div className='flex-1'>
        <h5 className='text-lg font-bold'>Amenities</h5>
        <p className='text-white'>
          {listing_feature.amenities?.length > 0 ? formattedAmenities : 'Missing'}
        </p>
      </div>
    </div>




    <div className='bg-dark-2 rounded-lg shadow-md overflow-hidden text-white w-full'>
    
      <div className='flex items-center gap-4 p-4'>
        <div className='flex-1'>
          <h5 className='text-lg font-bold'>Amenities</h5>
          <p className='text-white'>{listing_feature.amenities?listing_feature.amenities:'Missing'}</p>
        </div>
      </div>
    
    
    
    </div>
      
      
      
      
      
      <div className='flex flex-col justify-between'>
        <h3 className='text-lg font-semibold'>{listing_feature.description[0]}</h3>
        <p className='text-sm'>{listing_feature.features}</p>
        <p className='text-sm opacity-70'>{updatedAt}</p>
      </div>
      <Link href={`/listing/${id}`}>
        <div className='bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-600 transition duration-300'>
          View
        </div>
      </Link>

      </section>
  );
};

export default ListingFeatureCard;
