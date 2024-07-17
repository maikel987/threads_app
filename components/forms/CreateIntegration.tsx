"use client";

import * as z from "zod";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { platformLogo } from "@/constants";

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
import { useToast } from "@/components/ui/use-toast"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { IntegrationValidation } from "@/lib/validations/integration";
import { updateIntegration } from "@/lib/actions/integration.actions";
import { fetchAuthenticationSetupBeds24 } from "@/lib/actions/beds24.actions";
import { fetchUserAndBilling, fetchAllPropertiesHospitable, fetchReservations, IHospitableMessage, fetchMessages, onboardHospitable } from "@/lib/actions/hospitable.actions";


interface Props {
  btnTitle: string;
  userId:string;
  integration_info:{
    id:string;
    username: string;
    password: string;
    platform: string;
    platform_account_id: string;
    account_url: string;
    modifiable: boolean;
    apiKey:string;
  };
}

const IntegrationForm = ({  btnTitle, userId, integration_info }: Props) => {
  const { toast } = useToast()
  const router = useRouter();
  const pathname = usePathname();
  
  //const { startUpload } = useUploadThing("media");

  //const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof IntegrationValidation>>({
    resolver: zodResolver(IntegrationValidation),
    defaultValues: {
        username: integration_info.username ? integration_info.username : "",
        password: integration_info.password ? integration_info.password : "",
        platform: integration_info.platform ? integration_info.platform : "",
        platform_account_id: integration_info.platform_account_id ? integration_info.platform_account_id : "",
        account_url: integration_info.account_url ? integration_info.account_url : "",
        apiKey:integration_info.apiKey?integration_info.apiKey:'',
    },
  });

  // Ajout d'un état pour suivre la plateforme sélectionnée
  const [selectedPlatform, setSelectedPlatform] = useState(integration_info.platform);
  const [isAirbnbClicked, setIsAirbnbClicked] = useState(false);

  // Gestion de la sélection de la plateforme
  const handlePlatformChange = (value: string) => {
    form.setValue('platform', value); // Mettre à jour la valeur dans react-hook-form
    setSelectedPlatform(value); // Mettre à jour l'état local
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  function getUserIdFromUrl(url: string): string | null {
    const regex = /\/users\/show\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }



  const onSubmit = async (values: z.infer<typeof IntegrationValidation>) => {
    console.log("let toast");
    /*toast({
      title: "Synchronization Starting",
      description: `${values.platform} - Synchronization of listings, reservations, and messages is underway. This process may take some time. Please be patient.`,
    });
    */
    if (values.account_url && !values.platform_account_id) {
      const platform_id = getUserIdFromUrl(values.account_url);
      values.platform_account_id = platform_id ? platform_id : '';
    }
    let external_data;
    let username;
    if (values.platform === 'beds24' && values.apiKey){

        try {
          external_data = await fetchAuthenticationSetupBeds24(values.apiKey, "aimyguest");
          console.log('API Response:', external_data);
      
          if (external_data.success === false) {
            console.error('Error:', external_data.error);
          } else {
            console.log('Token 1:', external_data.token_1);
            console.log('Expires In 1:', external_data.expiresIn_1);
            console.log('Refresh Token:', external_data.refreshToken);
            console.log('Token 2:', external_data.token_2);
            console.log('Expires In 2:', external_data.expiresIn_2);
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        }
        

    }else if (values.platform === 'hospitable' && values.apiKey){
      external_data = await fetchUserAndBilling(values.apiKey);
      username = values.username ? values.username : external_data?.name
      
    }else{
      username = values.username ? values.username : ''
    }
    const platform_account = await updateIntegration({
      integrationId: integration_info.id,
      userId: userId,
      username: username ? username : '',
      password: values.password ? values.password : '',
      platform: values.platform,
      platform_account_id: values.platform_account_id ? values.platform_account_id : "",
      account_url: values.account_url ? values.account_url : '',
      apiKey: values.apiKey ? values.apiKey : '',
      path: pathname,
    });

    if (values.platform === 'hospitable' && values.apiKey){
      onboardHospitable(values.apiKey, platform_account._id, userId)
      .then(() => {
        toast({
          title: "Synchronization Completed",
          description: "All data has been successfully synchronized.",
          variant: "default",  // Vert si votre bibliothèque supporte 'success' comme indicateur de vert
        });
      })
      .catch(error => {
        console.error('Erreur lors du traitement:', error);
        toast({
          title: "Synchronization Failed",
          description: "An error occurred during data synchronization. Please try again.",
          variant: "destructive",
        });
      });
    }
  
    if (pathname === `/integrationhub/edit/${integration_info.id}`) {
      router.back();
    } else {
      router.push("/integrationhub");
    }
  };

  const handleAirbnbClick = () => {
    // Ouvre le lien dans un nouvel onglet
    window.open(
      "https://www.airbnb.fr/oauth2/auth?client_id=6gsna623mfeic93fod1fcqlr&redirect_uri=https%3A%2F%2Fapi.beds24.com%2Fairbnb.com%2Fpush.php&scope=property_management%2Creservations_web_hooks%2Cmessages_read%2Cmessages_write&state=s%3A%2F%2Fbeds24.com%2Fcontrol3.php%3Fpagetype%3Dsyncroniserairbnbaccount",
      "_blank"
    );
  
    setIsAirbnbClicked(true); // Marque le bouton comme cliqué
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche la soumission par défaut du formulaire
    if (isAirbnbClicked) {
      // Si le bouton Airbnb a été cliqué, ouvrir le lien et soumettre le formulaire manuellement
      setIsAirbnbClicked(false); // Réinitialise l'état
      await onSubmit(form.getValues()); // Soumet les valeurs du formulaire
    } else {
      // Pour les autres cas, soumet directement les valeurs du formulaire
      await onSubmit(form.getValues());
    }
  };


  return (
    <Form {...form}>
      <form
        ref={formRef}
        method="post"
        className="flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}  // Modification ici
        >

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
                defaultValue={field.value} 
                disabled={!(integration_info.modifiable || !integration_info.platform)}
              >
                <FormControl>
                  <SelectTrigger className={
                    (integration_info.modifiable || !integration_info.platform)
                      ? 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }>
                    <SelectValue placeholder="Select a Platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                  {Object.keys(platformLogo).map((platformKey) => (
                    <div key={platformKey} className="hover:bg-gray-500 dark:hover:bg-gray-600">
                      <SelectItem key={platformKey} value={platformKey} className="text-sm text-gray-700 dark:text-gray-200 px-10 py-2 hover:bg-gray-100 dark:hover:text-white">
                        {platformKey.charAt(0).toUpperCase() + platformKey.slice(1)} 
                      </SelectItem>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    {((selectedPlatform === 'vrbo')||(selectedPlatform === 'booking')||(selectedPlatform === 'hospitable')||(selectedPlatform === 'beds24')) && (        
      <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Username
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className={
                    (integration_info.modifiable || !integration_info.username)
                      ? 'account-form_input no-focus' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }
                  readOnly={!(integration_info.modifiable || !integration_info.username)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {((selectedPlatform === 'vrbo')||(selectedPlatform === 'booking')) && (        
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Password
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className={
                    (integration_info.modifiable || !integration_info.password)
                      ? 'account-form_input no-focus' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }
                  readOnly={!(integration_info.modifiable || !integration_info.password)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}


      {((selectedPlatform === 'vrbo')||(selectedPlatform === 'booking')) && (        
        <FormField
          control={form.control}
          name='platform_account_id'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Platform account id
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className={
                    (integration_info.modifiable || !integration_info.platform_account_id)
                      ? 'account-form_input no-focus' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }
                  readOnly={!(integration_info.modifiable || !integration_info.platform_account_id)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
        

      {selectedPlatform === 'airbnb' && (        
        <FormField
          control={form.control}
          name='account_url'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Account Url
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className={
                    (integration_info.modifiable || !integration_info.account_url)
                      ? 'account-form_input no-focus' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }
                  readOnly={!(integration_info.modifiable || !integration_info.account_url  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {((selectedPlatform === 'hospitable')||(selectedPlatform === 'beds24')) && (        
        <FormField
          control={form.control}
          name='apiKey'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Api Key
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className={
                    (integration_info.modifiable || !integration_info.apiKey)
                      ? 'account-form_input no-focus' 
                      : 'cursor-not-allowed bg-gray-700 text-gray-300 border-gray-600'
                  }
                  readOnly={!(integration_info.modifiable || !integration_info.apiKey  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <div className='flex justify-end gap-20'>
  <Button type='button' className='bg-secondary-500 px-5' onClick={() => router.back()}>
    Cancel
  </Button>

  {selectedPlatform !== 'airbnb' ? (
      <Button type='submit' className='bg-primary-500 w-full'>
        {btnTitle}
      </Button>
    ) : (
        <button
          type="submit"
          className="btn-primary connect-button w-full"
          onClick={handleAirbnbClick}
        >
          <svg className="logo" viewBox="0 0 1000 1000">
            <path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-27 45-40 80-40s62 13 80 40c17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43c-7 47-39 86-83 105-85 37-169.1-22-241.1-102 119.1-149.1 141.1-265.1 90-340.2-30-43-73-64-128.1-64-111 0-172.1 94-148.1 203.1 14 59 51 126.1 110 201.1-37 41-72 70-103 88-24 13-47 21-69 23-101 15-180.1-83-144.1-184.1 5-13 15-37 32-74l1-2c55-120.1 122.1-256.1 199.1-407.2l2-5 22-42c17-31 24-45 51-62 13-8 29-12 47-12 36 0 64 21 76 38 6 9 13 21 22 36l21 41 3 6c77 151.1 144.1 287.1 199.1 407.2l1 1 20 46 12 29c9.2 23.1 11.2 46.1 8.2 70.1zm46-90.1c-7-22-19-48-34-79v-1c-71-151.1-137.1-287.1-200.1-409.2l-4-6c-45-92-77-147.1-170.1-147.1-92 0-131.1 64-171.1 147.1l-3 6c-63 122.1-129.1 258.1-200.1 409.2v2l-21 46c-8 19-12 29-13 32-51 140.1 54 263.1 181.1 263.1 1 0 5 0 10-1h14c66-8 134.1-50 203.1-125.1 69 75 137.1 117.1 203.1 125.1h14c5 1 9 1 10 1 127.1.1 232.1-123 181.1-263.1z"></path>
          </svg>
          Connexion avec Airbnb
        </button>
        )}
      </div>

      </form>
    </Form>
  );
};

export default IntegrationForm;
