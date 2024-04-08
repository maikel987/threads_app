"use client";

import * as z from "zod";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";


import { IntegrationValidation } from "@/lib/validations/integration";
import { updateIntegration } from "@/lib/actions/integration.actions";

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
  };
}

const IntegrationForm = ({  btnTitle, userId, integration_info }: Props) => {

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
    },
  });

  // Ajout d'un état pour suivre la plateforme sélectionnée
  const [selectedPlatform, setSelectedPlatform] = useState(integration_info.platform);

  // Gestion de la sélection de la plateforme
  const handlePlatformChange = (value: string) => {
    form.setValue('platform', value); // Mettre à jour la valeur dans react-hook-form
    setSelectedPlatform(value); // Mettre à jour l'état local
  };

  const onSubmit = async (values: z.infer<typeof IntegrationValidation>) => {
    await updateIntegration({
        integrationId: integration_info.id,
        userId: userId,
        username: values.username,
        password: values.password ? values.password : '',
        platform: values.platform,
        platform_account_id: values.platform_account_id,
        account_url: values.account_url ? values.account_url : '',
        path:pathname,
      });

    if (pathname === `/integrationhub/edit/${integration_info.id}`) {
      router.back();
    } else {
      router.push("/integrationhub");
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

export default IntegrationForm;
