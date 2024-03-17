"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,  
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { UserValidation } from "@/lib/validations/user";
import { addApartement, fetchProperty, updateProperty } from "@/lib/actions/apartment.actions";
import { ApartmentValidation } from "@/lib/validations/apartment";

interface Props {
  btnTitle: string;
  userId:string;
  apartment_info:{
    id:string;
    address: string;
    checkin_process: string;
    internal_name: string;
    urgent_number: string;
  };
}

const ApartmentForm = ({  btnTitle, userId, apartment_info }: Props) => {

  const router = useRouter();
  const pathname = usePathname();
  //const { startUpload } = useUploadThing("media");

  //const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof ApartmentValidation>>({
    resolver: zodResolver(ApartmentValidation),
    defaultValues: {
        internal_name: apartment_info.internal_name ? apartment_info.internal_name : "",
        checkin_process: apartment_info.checkin_process ? apartment_info.checkin_process : "",
        address: apartment_info.address ? apartment_info.address : "",
        urgent_number: apartment_info.urgent_number ? apartment_info.urgent_number : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ApartmentValidation>) => {

    await updateProperty({
        userId:userId,
        property_id:apartment_info.id,
        internal_name:values.internal_name,
        checkin_process:values.checkin_process,
        address:values.address,
        urgent_number:values.urgent_number,
        path:pathname,
    });

    if (pathname === "/property/edit") {
      router.back();
    } else {
      router.push("/property");
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
          name='internal_name'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Internal Name
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
          name='address'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Address
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
          name='urgent_number'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Urgent Number
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
          name='checkin_process'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
              Checkin Process
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'>
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default ApartmentForm;
