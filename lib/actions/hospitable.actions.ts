"use server";
import axios from 'axios';
import {GeneralProperty, isListingPresent} from "./integration.actions"
import { uploadImageFromUrl } from '../uploadImage';
interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  country_name: string;
  coordinates: Coordinates;
  display: string;
}

interface Capacity {
  max?: number
  bedrooms?: number;
  beds?: number ; // Already updated to indicate beds can be null
  bathrooms?: number;
}

interface RoomDetails {
  beds: {
    type: string;
    quantity: number;
  }[];
}

interface HouseRules {
  pets_allowed?: boolean | null; // Updated to handle cases where pets_allowed can be null
  smoking_allowed?: boolean | null; // Updated to handle cases where smoking_allowed can be null
  events_allowed?: boolean | null; // Updated to handle cases where events_allowed can be null
}

interface Property {
  id: string;
  name: string;
  picture: string;
  address: Address;
  timezone: string;
  listed: boolean;
  currency: string;
  summary?: string | null; // Indicates that summary can be absent or null
  description?: string | null; // Indicates that description can be absent or null
  checkin: string;
  amenities?: string[] | null; // Indicates that amenities can be absent or null
  capacity: Capacity;
  room_details?: RoomDetails[];
  tags: string[];
  house_rules?: HouseRules;
}

interface ApiResponseProperties {
  data: Property[];
  links: {
    first: string;
    last: string;
    prev?: string | null; // Indicates that prev can be absent or null
    next?: string | null; // Indicates that next can be absent or null
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url?: string | null; // Indicates that url can be absent or null
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
interface ApiResponseProperty {
  data: Property;
  
}


const fetchProperties = async (authKey: string, page: number, perPage: number): Promise<ApiResponseProperties> => {
  const options = {
    method: 'GET',
    url: `https://public.api.hospitable.com/v2/properties?page=${page}&per_page=${perPage}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${authKey}`,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchPropertyHopitableApi = async (authKey: string, propertyId:string): Promise<ApiResponseProperty> => {
  const options = {
    method: 'GET',
    url: `https://public.api.hospitable.com/v2/properties/${propertyId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${authKey}`,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const mapHospitableToGeneral = async (property: Property):Promise<GeneralProperty> => {
  // Check if property already exists in the database
  const exists = await isListingPresent(property.id);
  let fileKey = '';
  if (exists) {
    console.log(`Property with ID ${property.id} already exists.`);
  }else{
    if(property.picture){
      const pictureUrl = property.picture.split('?')[0];  // Split the URL by '?' and use the first part
      fileKey = await uploadImageFromUrl(pictureUrl);
    }
  }
  
  // house Rules
  const houseRulesArray = property.house_rules ? Object.entries(property.house_rules).map(([key, value]) => {
    // Utilise 'false' si la valeur est 'null', sinon utilise la valeur existante
    const ruleValue = value === null ? false : value;
    return `${key}: ${ruleValue}`;
  }) : [];

  //beds
  const bedsArray = property.room_details ? property.room_details.flatMap(room => 
    room.beds.map(bed => `${bed.quantity} x ${bed.type.replace('_', ' ')}`)
  ):[];
  

  return {
    id: property.id,
    name: property.name,
    picture: fileKey,  // Store the fileKey instead of the original URL
    address: property.address?`${property.address.street}, ${property.address.postcode}, ${property.address.city}, ${property.address.country}`:'',
    coordinates: property.address.coordinates,
    summary: property.summary?property.summary:'',
    description: property.description ? property.description.split('\n\n') : [],
    amenities: property.amenities?property.amenities:[],
    guest:property.capacity.max,
    bedroom:property.capacity.bedrooms,
    bed:property.capacity.beds,
    bathroom:property.capacity.bathrooms,
    rules:houseRulesArray,
    safety:[],
    sleeping:bedsArray,
    checkin:property.checkin,
    checkout:'',
    exist:exists
  };
};


export const fetchAllPropertiesHospitable = async (authKey: string) => {
  let allProperties: any[] = [];
  let page = 1;
  const perPage = 10;

  try {
    let response = await fetchProperties(authKey, page, perPage);
    let properties = await Promise.all(response.data.map(mapHospitableToGeneral));
    allProperties = allProperties.concat(properties);

    const totalPages = response.meta.last_page;
    if (totalPages > 1) {
      const fetchPromises = [];
      for (let i = 2; i <= totalPages; i++) {
        fetchPromises.push(fetchProperties(authKey, i, perPage));
      }

      const responses = await Promise.all(fetchPromises);
      for (const res of responses) {
        let mappedProperties = await Promise.all(res.data.map(mapHospitableToGeneral));
        allProperties = allProperties.concat(mappedProperties);
      }
    }

    // Filter out null values just once before returning
    allProperties = allProperties.filter(({ exist }) => !exist);

    console.log('All properties successfully fetched and mapped, excluding duplicates');
    return allProperties;
  } catch (err) {
    console.error('Error fetching all properties:', err);
    throw err;
  }
};

/* 

async function uploadImageFromUrl(imageUrl: string) {
  
  const response = await fetch('/api/uploadFromUrl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('Image uploaded successfully:', data.url);
    return data.fileKey;  // Return the fileKey instead of the full data
  } else {
    console.error('Error uploading image:', data.error);
    throw new Error('Error uploading image');
  }
}
  */


interface UserBillingInfo {
  id: string;
  email: string;
  name: string;
  business: boolean;
  company: string;
  vat: string | null;
  tax_id: string;
  street_line1: string;
  street_line2: string | null;
  postal_code: string;
  city: string;
  region: string;
  country: string;
}

interface ApiResponseUser {
  data: UserBillingInfo;
}

// Fonction pour récupérer les informations de l'utilisateur et de facturation
export async function fetchUserAndBilling(apiKey: string): Promise<UserBillingInfo | null> {
  try {
    const response = await axios.get<ApiResponseUser>('https://api.hospitable.com/user_and_billing', {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    console.log('User and Billing Data:', response.data.data);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching user and billing data:', err);
    return null;
  }
}

 
