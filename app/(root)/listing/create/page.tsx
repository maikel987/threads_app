import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import CreateListing from "@/components/forms/CreateListing";
import CreateListing2 from "@/components/forms/CreateListing2";
import { fetchPropertyByUser } from "@/lib/actions/apartment.actions";
import { fetchPlatformAccountByPlatform, PlatformAccount} from "@/lib/actions/integration.actions";



async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const properties = await fetchPropertyByUser({ userId:userInfo.id });
  
  const integrations = await fetchPlatformAccountByPlatform({ userId:userInfo.id });

  


  let listing_info = {
    link: '',
    platform: '',
    title: '',
    apartment_id: '',
    picture: '',
    platform_account_id: '',
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

      <CreateListing2 
      userId={userInfo._id.toString()} 
      btnTitle='Create' 
      modifiable={true} 
      listing={listing_info} 
      properties={properties}
      platformAccounts = {integrations} />
    
    </section>
    </section>
    </>
  );
}

export default Page;
