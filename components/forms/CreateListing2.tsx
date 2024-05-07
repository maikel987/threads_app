"use client";
import axios from "axios";
import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";
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


import { ListingValidation } from "@/lib/validations/listing";
import { updateListing } from "@/lib/actions/listing.actions";
import { platformLogo } from "@/constants";
import { fetchPlatformAccountByPlatform, PlatformAccount } from "@/lib/actions/integration.actions";
import { PropertySmall } from "@/lib/actions/apartment.actions";



interface Props {
  listing: {
    link: string;
    status:string;
    platform: string;
    title: string;
    apartment_id: string;
    picture: string;
    platform_account_id: string;
    internal_id: string;
    id: string;
    signedURL?: string;
  };
  btnTitle: string;
  modifiable: boolean;
  userId:string;
  properties:PropertySmall[];
  platformAccounts : PlatformAccount[]
}

interface Integration {
  username:string, 
  listings :string, 
  platform_account_id:string,  
  platform :string, 
  _id :string, 
}




const CreateListing2 = ({ listing, btnTitle, modifiable,userId,properties,platformAccounts }: Props) => {
  console.log("Inside",listing);
  const router = useRouter();
  const pathname = usePathname();

  const [files, setFiles] = useState<File[]>([]);
  
  
  // Ajout d'un état pour suivre la plateforme sélectionnée
  const [selectedPlatform, setSelectedPlatform] = useState(listing.platform);
  const [selectedIntegration, setSelectedIntegration] = useState(listing.platform_account_id);
  const [selectedProperty, setSelectedProperty] = useState(listing.apartment_id);
  const [integrationOptions, setIntegrationOptions] = useState<PlatformAccount[]>(platformAccounts);
  const [PropertyOptions, setPropertyOptions] = useState<PropertySmall[]>(properties);

  const form = useForm<z.infer<typeof ListingValidation>>({
    resolver: zodResolver(ListingValidation),
    defaultValues: {
      listing_photo: listing.signedURL?listing.signedURL:"",
      title: listing.title?listing.title:"",
      link: listing.link?listing.link:"",
      platform: listing.platform ? listing.platform : "",
      platform_account: listing.platform_account_id?listing.platform_account_id:"",
      apartment: listing.apartment_id ? listing.apartment_id:"",
    },
  });
  
  // Gestion de la sélection de la plateforme
  const handlePlatformChange = useCallback((value: string) => {
    form.setValue('platform', value, { shouldValidate: true });
    setSelectedPlatform(value);
  }, [form, setSelectedPlatform]);
  
  const handleIntegrationChange = useCallback((value: string) => {
    form.setValue('platform_account', value, { shouldValidate: true });
    setSelectedIntegration(value);
  }, [form, setSelectedIntegration]);
  
  const handlePropertyChange = useCallback((value: string) => {
    form.setValue('apartment', value, { shouldValidate: true });
    setSelectedProperty(value);
  }, [form, setSelectedProperty]);
  

  useEffect(() => {
    console.log('selectedPlatform',selectedPlatform)
    if(selectedPlatform){
      const updatedIntegrations = platformAccounts.filter(pa=> pa.platform === selectedPlatform)
      console.log('updatedIntegrations',updatedIntegrations); // ##########################################
      setIntegrationOptions(updatedIntegrations);
  }else{
    setIntegrationOptions(platformAccounts);
  }

 }, [selectedPlatform]
 );

  // Cela devrait être dans votre second useEffect où vous gérez la déduction de la plateforme
  useEffect(() => {
    if (selectedIntegration && !selectedPlatform) {
      // Détermination directe de la plateforme à partir de l'intégration
      console.log('selectedIntegration', selectedIntegration);
      const integration = integrationOptions.find(integ => integ._id === selectedIntegration);
      console.log('integration?.platform', integration?.platform);
  
      const inferredPlatform = integration ? integration.platform : 'unknown';
      handlePlatformChange(inferredPlatform);
    }
  }, [selectedIntegration]);
  

  const onSubmit = async (values: z.infer<typeof ListingValidation>) => {
    console.log('Attempting to submit form', values);
    try {
      let pictureUrl = values.listing_photo;

      // Si un nouveau fichier a été sélectionné pour le téléchargement
      console.log("test",values.listing_photo,files.length)
      if (values.listing_photo && files.length > 0) {
        const formData = new FormData();
        // Utilisez le premier fichier du tableau `files` si `listing_photo` est un objet de base64 ou un chemin local.
        formData.append('file', files[0], files[0].name);
  
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        pictureUrl = response.data.fileKey;
        console.log(response);
        console.log(`File uploaded successfully! File key: ${pictureUrl}`);
      }

      const internalId = listing.internal_id || extractInternalId(values.link);

      // In case no picture added, it give back the original value of the picture, and not signedURL value
      if (listing.signedURL === pictureUrl) pictureUrl = listing.picture;
      await updateListing({
        userId:userId ,
        link: values.link,
        platform: values.platform,
        title: values.title,
        apartment: values.apartment,
        picture: pictureUrl ? pictureUrl : '', 
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
              <FormLabel className='listing-form_image-label'>
                {field.value ? (
                  <Image
                    src={field.value}
                    alt='profile_icon'
                    width={240}
                    height={240}
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
                  placeholder='Add listing photo'
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
                disabled={!(modifiable || !listing.platform)}  // Assurez-vous que la condition de désactivation est correcte
              >
                <SelectTrigger className={
                  (modifiable || !listing.platform)
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
                disabled={!(modifiable || !listing.platform_account_id)}  // Assurez-vous que la condition de désactivation est correcte
              >
                <SelectTrigger className={
                  (modifiable || !listing.platform_account_id)
                    ? 'w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
                    : 'w-full cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                }>
                    <SelectValue placeholder="Select an Integration" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">
                    {integrationOptions.map((integration) => (
                      <SelectItem key={integration._id} value={integration._id} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                        {integration.username?integration.username:integration.platform_account_id} - {integration.platform}  #{integration.listingsCount}
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
                defaultValue={field.value} 
                value={selectedProperty}  // Assurez-vous que la valeur actuelle est bien bindée
                disabled={!(modifiable || !listing.apartment_id)}  // Assurez-vous que la condition de désactivation est correcte
              >
                <SelectTrigger className={
                  (modifiable || !listing.apartment_id)
                  ? 'w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
                  : 'w-full cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
              }>
                    <SelectValue placeholder="Select a Property" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700">

                    {PropertyOptions.map((property) => (
                      <SelectItem key={property._id} value={property._id} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                        {property.internal_name?property.internal_name:property.address}  #{property.listingsCount}
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
      <Button type='button' className='bg-secondary-500 w-full' onClick={() => router.push("/listing")}>
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

export default CreateListing2;
