"use server";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {GeneralProperty, insertAllProperties, integrationConnected, isListingPresent, refreshIntegration} from "./integration.actions"
import { uploadImageFromUrl } from '../uploadImage';
import { integrateReservationData } from './reservation.actions';
import { IListing } from '../models/listing.model';


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


export const fetchAllPropertiesHospitable = async (authKey: string): Promise<GeneralProperty[]> => {
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
    const response = await axios.get<ApiResponseUser>('https://public.api.hospitable.com/v2/user', {
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

//Reservation 
interface IHospitableGuest {
  email: string | null;
  phone_numbers: string[];
  first_name: string;
  last_name: string;
}

interface IHospitableReservationStatus {
  current: {
    category: string;
    sub_category: string | null;
  };
  history: any[];
}

interface IHospitableGuests {
  total: number;
  adult_count: number;
  child_count: number;
  infant_count: number;
  pet_count: number;
}

interface IHospitableListing {
  platform: string;
  platform_id: string;
}

export interface IHospitableReservation {
  id: string;
  code: string;
  platform: string;
  platform_id: string;
  booking_date: string;
  arrival_date: string;
  departure_date: string;
  check_in: string;
  check_out: string;
  reservation_status: IHospitableReservationStatus;
  guests: IHospitableGuests;
  listings: IHospitableListing[];
  guest: IHospitableGuest;
  status: string;
  status_history: any[];
  conversation_id: string;
}

interface IHospitableReservationsResponse {
  data: IHospitableReservation[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

//Message
interface IHospitableSender {
  first_name: string;
  full_name: string;
  locale: string;
  picture_url: string;
  thumbnail_url: string;
  location: string;
}

export interface IHospitableMessage {
  platform: string;
  platform_id: string;
  content_type: string;
  body: string;
  attachments: any[];
  sender_type: string;
  sender_role: string | null;
  sender: IHospitableSender;
  created_at: string;
}

interface IHospitableMessagesResponse {
  data: IHospitableMessage[];
}

function getDynamicDates() {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  startDate.setMonth(now.getMonth() - 6);
  endDate.setMonth(now.getMonth() + 6);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate)
  };
}

export async function fetchReservations(apiKey: string, propertyId: string): Promise<IHospitableReservation[]> {
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${apiKey}`
  };
  const { start_date, end_date } = getDynamicDates();
  let currentPage = 1;
  let results: IHospitableReservation[] = [];
  let lastPage = Number.MAX_SAFE_INTEGER; // Initialiser à une grande valeur

  while (currentPage <= lastPage) {
    const url = `https://public.api.hospitable.com/v2/reservations?page=${currentPage}&per_page=10&properties[]=${propertyId}&start_date=${start_date}&end_date=${end_date}&include=guest%2Clistings&date_query=checkin`;
    try {
      const response: AxiosResponse<any> = await axios.get(url, { headers });
      results = results.concat(response.data.data);
      currentPage++;
      lastPage = response.data.meta.last_page; // Mettre à jour lastPage selon la réponse
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching reservations:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      break; // Sortir de la boucle en cas d'erreur
    }
  }

  return results;
}


export async function fetchMessages(apiKey: string, reservationId: string): Promise<IHospitableMessage[]> {
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${apiKey}`
  };
  const url = `https://public.api.hospitable.com/v2/reservations/${reservationId}/messages`;

  try {
    const response: AxiosResponse<any> = await axios.get(url, { headers });
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching messages:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    return [];
  }
}

export async function refreshHospitable(platform_account_id:string,userId:string){
  const integrationObject = await refreshIntegration({ integrationId:platform_account_id });
  const apiKey = integrationObject.apiKey;
  if(apiKey){
    await onboardHospitable(apiKey,platform_account_id,userId);
  }
}

export async function onboardHospitable(apiKey: string, platform_account_id: string, userId: string) {
  try {
    // Récupérer toutes les propriétés de l'API Hospitable
    console.log('Fetching all properties from Hospitable API...'); // # Log avant de récupérer les propriétés
    const properties = await fetchAllPropertiesHospitable(apiKey);
    console.log('Propriétés récupérées et transformées:', properties.length); // # Log après récupération et transformation des propriétés

    if (properties.length === 0) {
      await integrationConnected({ integrationId: platform_account_id });
      return;
    }

    // Insérer les propriétés dans la base de données
    console.log('Inserting all properties into the database...'); // # Log avant d'insérer les propriétés
    console.log('platform_account_id', platform_account_id);
    console.log('userId', userId);
    const listings = await insertAllProperties(properties, platform_account_id, userId);
    console.log('Toutes les propriétés ont été insérées avec succès dans la base de données.'); // # Log après insertion réussie des propriétés
    console.log("properties : \t", 'properties');
    console.log("properties.length : \t", listings.length);

    // Utiliser Promise.all pour paralléliser les appels à processReservation
    const reservationPromises = listings.map(listing => processReservation(apiKey, listing));
    await Promise.all(reservationPromises);

    console.log('Data synchronization completed successfully.'); // # Log après la synchronisation complète des données
    await integrationConnected({ integrationId: platform_account_id });
  } catch (error) {
    console.error('Error during property insertion:', error);
    throw error; // Pour propager l'erreur et mieux comprendre où elle se produit
  }
}


export async function processReservation(apiKey: string, listing: IListing) {
  console.log(`Fetching reservations for property: ${listing.internal_id}`);

  const internalId = listing.internal_id;

  if (internalId) {
    try {
      const reservations = await fetchReservations(apiKey, internalId);
      console.log(`Réservations récupérées pour la propriété ${internalId}:`, reservations);

      const messagesMap = new Map<string, IHospitableMessage[]>();

      const messagePromises = reservations.map(async (reservation) => {
        console.log(`Fetching messages for reservation: ${reservation.id}`);
        const messages = await fetchMessages(apiKey, reservation.id);
        console.log(`Messages récupérés pour la réservation ${reservation.id}:`, messages);

        messagesMap.set(reservation.id, messages);
      });

      await Promise.all(messagePromises);

      console.log('Integrating data for reservations and messages...');
      await integrateReservationData(reservations, messagesMap, listing);
      console.log(`Données intégrées pour les réservations et messages de la propriété ${listing.id}.`);
    } catch (error) {
      console.error(`Error processing reservation for property ${internalId}:`, error);
    }
  }
}

