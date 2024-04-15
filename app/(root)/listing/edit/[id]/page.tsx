import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { fetchProperty, getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import { fetchListing } from "@/lib/actions/listing.actions";
import CreateListing from "@/components/forms/CreateListing";


async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");


    let listing_info = await fetchListing(params.id);
    console.log(listing_info);
    if(listing_info.platform_account.owner._id.toString() !== userInfo.id.toString()) return null

    let listing_data = {
        link: listing_info.link ? listing_info.link : '',
        platform: listing_info.platform ? listing_info.platform : '',
        title: listing_info.title ? listing_info.title : '',
        apartment: listing_info.apartment ? listing_info.apartment : '',
        picture: listing_info.picture ? listing_info.picture : '',
        platform_account: listing_info.platform_account ? listing_info.platform_account : '',
        internal_id: listing_info.internal_id ? listing_info.internal_id : '',
        id: listing_info.id ? listing_info.id : '',
        status: listing_info.status ? listing_info.status : '',
      }

    return (
        <>
        <div className='flex w-full flex-col justify-start'>
            <div className='flex items-center justify-between'>
                <h1 className='head-text'>Edit Listings</h1>
            </div>
        </div>
        <section className='mt-10 flex flex-col gap-5'>
            <section className='mt-9 bg-dark-2 p-10'>
                <CreateListing userId={userInfo._id.toString()} btnTitle='Continue' modifiable={false} listing={listing_data} />

            </section>
        </section>
        </>
    );
}

export default Page;
