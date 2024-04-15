"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { ListingValidation } from "@/lib/validations/listing";
import { updateListing } from "@/lib/actions/listing.actions";
import { platformLogo } from "@/constants";
import { fetchPlatformAccountByPlatform } from "@/lib/actions/integration.actions";
import { fetchPropertyByUser } from "@/lib/actions/apartment.actions";
interface Props {

}

interface Props {
  listing: {
    link: string;
    status:string;
    platform: string;
    title: string;
    apartment: string;
    picture: string;
    platform_account: string;
    internal_id: string;
    id: string;
  };
  btnTitle: string;
  modifiable: boolean;
  userId:string;
}
interface Integration {
  username:string, 
  listings :string, 
  platform_account_id:string,  
  platform :string, 
  _id :string, 
}

interface Property{
  _id :string, 
  internal_name:string,  
  address :string, 
  listings:string, 
}


const CreateListing = ({ listing, btnTitle, modifiable,userId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startUpload } = useUploadThing("media");

  const [files, setFiles] = useState<File[]>([]);
    

  // Ajout d'un état pour suivre la plateforme sélectionnée
  const [selectedPlatform, setSelectedPlatform] = useState(listing.platform);
  const [selectedIntegration, setSelectedIntegration] = useState(listing.platform_account);
  const [integrationOptions, setIntegrationOptions] = useState<Integration[]>([]);
  const [selectedProperty, setSelectedProperty] = useState(listing.apartment);
  const [PropertyOptions, setPropertyOptions] = useState<Property[]>([]);

  // Gestion de la sélection de la plateforme
  const handlePlatformChange = (value: string) => {
    form.setValue('platform', value, { shouldValidate: true }); // Mettre à jour la valeur dans react-hook-form
    setSelectedPlatform(value); // Mettre à jour l'état local
  };

  const handleIntegrationChange = (value: string) => {
    form.setValue('platform_account', value, { shouldValidate: true });
    setSelectedIntegration(value);
  };
  
  const handlePropertyChange = (value: string) => {
    form.setValue('apartment', value, { shouldValidate: true });
    setSelectedProperty(value);
  };

  useEffect(() => {
    async function loadIntegrations() {
      let integrations;
      if (selectedPlatform) {
        integrations = await fetchPlatformAccountByPlatform({ userId, platform: selectedPlatform });
      } else {
        // Charge toutes les intégrations si aucune plateforme n'est sélectionnée
        integrations = await fetchPlatformAccountByPlatform({ userId });
      }
      const updatedIntegrations = integrations.map(integration => ({
        ...integration,
        listings: integration.listings.length,
        _id: integration._id.toString() // Assuming '_id' is present and is an ObjectId
      }));
      console.log(updatedIntegrations); // ##########################################
      setIntegrationOptions(updatedIntegrations);
  }
    loadIntegrations();
  }, [selectedPlatform, userId]);
  


// Cela devrait être dans votre second useEffect où vous gérez la déduction de la plateforme
useEffect(() => {
  if (selectedIntegration && !selectedPlatform) {
    // Utilisez ici `integrationOptions` qui est votre état contenant les intégrations chargées
    const inferredPlatform = derivePlatformFromIntegration(selectedIntegration, integrationOptions);
    handlePlatformChange(inferredPlatform);
  }
}, [selectedIntegration, selectedPlatform, integrationOptions]); // Ajoutez integrationOptions aux dépendances

//fetchPropertyByUser
useEffect(() => {
  async function loadProperties() {
    const properties = await fetchPropertyByUser({ userId });
    
    // Update each property object as needed
    const updatedProperties = properties.map(property => ({
      ...property,
      listings: property.listings.length, // Assuming 'listings' is an array
      _id: property._id.toString() // Convert ObjectId to string
    }));
    console.log(updatedProperties); // ##########################################
    setPropertyOptions(updatedProperties); // Set the updated properties to state
  }
  loadProperties();
}, [userId]);




// Votre fonction pour dériver la plateforme à partir de l'ID de l'intégration
const derivePlatformFromIntegration = (integrationId: string, integrations: Integration[]): string => {
  console.log('derivePlatformFromIntegration',integrationId, integrations)
  const integration = integrations.find(integ => integ._id === integrationId);
  console.log(integration?.platform)
  return integration ? integration.platform : 'unknown'; // Retourne 'unknown' si non trouvé
};

  


  const form = useForm<z.infer<typeof ListingValidation>>({
    resolver: zodResolver(ListingValidation),
    defaultValues: {
      listing_photo: listing.picture?listing.picture:"",
      title: listing.title?listing.title:"",
      link: listing.link?listing.link:"",
      platform: listing.platform ? listing.platform : "",
      platform_account: listing.platform_account?listing.platform_account:"",
      apartment: listing.apartment?listing.apartment:"",
    },
  });

  const onSubmit = async (values: z.infer<typeof ListingValidation>) => {
    console.log('Attempting to submit form', values);
      try{  
      console.log('submited')
      /*
      if(values.listing_photo){

        const blob = values.listing_photo;
        
        const hasImageChanged = isBase64Image(blob);
        if (hasImageChanged) {
          const imgRes = await startUpload(files);
          
          if (imgRes && imgRes[0].url) {
            values.listing_photo = imgRes[0].url;
          }
        }
      }
      */
      // Extraction de l'ID à partir de l'URL
      const internalId = listing.internal_id || extractInternalId(values.link);
      
      console.log({
        userId:userId ,
        link: values.link,
        platform: values.platform,
        title: values.title,
        apartment: values.apartment,
        picture: values.listing_photo ? values.listing_photo : '',
        platform_account: values.platform_account,
        path: pathname,
        internal_id: internalId,
      })

      await updateListing({
        userId:userId ,
        link: values.link,
        platform: values.platform,
        title: values.title,
        apartment: values.apartment,
        picture: values.listing_photo ? values.listing_photo : '',
        platform_account: values.platform_account,
        path: pathname,
        internal_id: internalId,
        status:listing.status,
      });
      
      if (pathname === "/listing/edit") {
        router.back();
      } else {
        router.push("/listing");
      }
    } catch (error) {
      console.error(error);
    }
    };
    
    function extractInternalId(link: string | undefined): string {
      if (!link) {
        return ''; // Retourne une chaîne vide si le lien est undefined
      }
      const urlParts = link.split('/');
      const lastSegment = urlParts.pop() || ''; // Gère le cas où pop() retourne undefined
      return lastSegment.split('?')[0];
    }
    
  
    const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-10'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='listing_photo'
          render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel className='account-form_image-label'>
                {field.value ? (
                  <Image
                    src={field.value}
                    alt='profile_icon'
                    width={96}
                    height={96}
                    priority
                    className='rounded-full object-contain'
                  />
                ) : (
                  <Image
                    src='/assets/profile.svg'
                    alt='profile_icon'
                    width={24}
                    height={24}
                    className='object-contain'
                  />
                )}
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-gray-200'>
                <Input
                  type='file'
                  accept='image/*'
                  placeholder='Add profile photo'
                  className='account-form_image-input'
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Title
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='link'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Url
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
{/* 
<FormField
  control={form.control}
  name='platform'
  render={({ field }) => (
    <FormItem className='flex w-full flex-col gap-3'>
      <FormLabel className='text-base-semibold text-light-2'>
        Platform
      </FormLabel>
      <FormControl>
        <Select 
          onValueChange={handlePlatformChange} 
          value = {selectedPlatform}
          disabled={!(modifiable || !listing.platform)}
        >
          <FormControl>
            <SelectTrigger className={
              (modifiable || !listing.platform)
                ? 'w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
                : 'w-full cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
            }>
              <SelectValue placeholder="Select a Platform" />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">
            {Object.keys(platformLogo).map((platformKey) => (
                <SelectItem key={platformKey} value={platformKey} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                  {platformKey.charAt(0).toUpperCase() + platformKey.slice(1)} 
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>*/}

<FormField
  control={form.control}
  name='platform'
  render={({ field }) => (
    <FormItem className='flex w-full flex-col gap-3'>
      <FormLabel className='text-base-semibold text-light-2'>
        Platform
      </FormLabel>
      <FormControl>
      <Select
        onValueChange={handlePlatformChange}
        value={selectedPlatform}  // Assurez-vous que la valeur actuelle est bien bindée
        disabled={!(modifiable || listing.platform)}  // Assurez-vous que la condition de désactivation est correcte
      >
        <SelectTrigger className={
          (modifiable || !listing.platform_account)
            ? 'w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
            : 'w-full cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
        }>
            <SelectValue placeholder="Select a Platform" />
          </SelectTrigger>
          <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">
          {Object.keys(platformLogo).map((platformKey) => (
                <SelectItem key={platformKey} value={platformKey} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                  {platformKey.charAt(0).toUpperCase() + platformKey.slice(1)} 
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name='platform_account'
  render={({ field }) => (
    <FormItem className='flex w-full flex-col gap-3'>
      <FormLabel className='text-base-semibold text-light-2'>
        Integration
      </FormLabel>
      <FormControl>
      <Select
        onValueChange={handleIntegrationChange}
        value={selectedIntegration}  // Assurez-vous que la valeur actuelle est bien bindée
        disabled={!(modifiable || listing.platform_account)}  // Assurez-vous que la condition de désactivation est correcte
      >
        <SelectTrigger className={
          (modifiable || !listing.platform_account)
            ? 'w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
            : 'w-full cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
        }>
            <SelectValue placeholder="Select an Integration" />
          </SelectTrigger>
          <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">
            {integrationOptions.map((integration) => (
              <SelectItem key={integration._id.toString()} value={integration._id.toString()} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                {integration.username?integration.username:integration.platform_account_id} - {integration.platform}  #{integration.listings}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name='apartment'
  render={({ field }) => (
    <FormItem className='flex w-full flex-col gap-3'>
      <FormLabel className='text-base-semibold text-light-2'>
        Property
      </FormLabel>
      <FormControl className="relative">
      <Select
        onValueChange={handlePropertyChange}
        value={selectedProperty}  // Assurez-vous que la valeur actuelle est bien bindée
        disabled={!(modifiable || listing.apartment)}  // Assurez-vous que la condition de désactivation est correcte
      >
        <SelectTrigger className={
          (modifiable || !listing.platform_account)
            ? 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
            : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
        }>
            <SelectValue placeholder="Select a Property" />
          </SelectTrigger>
          <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">

            {PropertyOptions.map((property) => (
              <SelectItem key={property._id.toString()} value={property._id.toString()} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                {property.internal_name?property.internal_name:property.address}  #{property.listings}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>



    <div className='flex justify-end gap-2'>
      <Button type='button' className='bg-secondary-500 w-full' onClick={() => router.back()}>
        Cancel
      </Button>
      <Button type='submit' className='bg-primary-500 w-full'>
        {btnTitle}
      </Button>

    </div>
      </form>
    </Form>
  );
};

export default CreateListing;
