import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { fetchProperty, getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";


async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");


    let apartment_info = await fetchProperty(params.id);
    console.log(apartment_info);
    
    let apt_info = {
        id:apartment_info.id?apartment_info.id:'',
        address:apartment_info.address?apartment_info.address:'',
        checkin_process:apartment_info.checkin_process?apartment_info.checkin_process:'',
        internal_name:apartment_info.internal_name?apartment_info.internal_name:'',
        urgent_number:apartment_info.urgent_number?apartment_info.urgent_number:'',
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
                <ApartmentForm userId={userInfo._id} btnTitle='Continue' apartment_info={apt_info} />
            </section>
        </section>
        </>
    );
}

export default Page;
