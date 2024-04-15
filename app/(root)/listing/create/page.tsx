import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import CreateListing from "@/components/forms/CreateListing";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  let userInfo = await fetchUser(user.id);
  
  if (!userInfo?.onboarded) redirect("/onboarding");

  let listing_info = {
    link: '',
    platform: '',
    title: '',
    apartment: '',
    picture: '',
    platform_account: '',
    internal_id: '',
    id: '',
    status:'',
  }

  return (
    <>
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>

            <h1 className='head-text'>Create Listings</h1>


      </div>
    </div>
    <section className='mt-10 flex flex-col gap-5'>
    <section className='mt-9 bg-dark-2 p-10'>
      <CreateListing userId={userInfo._id.toString()} btnTitle='Continue' modifiable={true} listing={listing_info} />
    </section>
    </section>
    </>
  );
}

export default Page;
