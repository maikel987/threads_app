import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getApartment(userInfo._id);
  console.log("activity",activity);

  let apt_info = {
    id:'',
    address: '',
    checkin_process: '',
    internal_name: '',
    urgent_number: '',
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
      <ApartmentForm userId={userInfo._id} btnTitle='Continue' apartment_info={apt_info} />
    </section>
    </section>
    </>
  );
}

export default Page;
