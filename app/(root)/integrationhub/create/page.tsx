import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { getApartment } from "@/lib/actions/apartment.actions";
import ApartmentForm from "@/components/forms/CreateApartment";
import IntegrationForm from "@/components/forms/CreateIntegration";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");


  let integration_info = {
    id:'',
    username:'',
    password:'',
    platform:'',
    platform_account_id:'',
    account_url:'',
    modifiable : true
  }

  return (
    <>
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>

            <h1 className='head-text'>Initiate Integration</h1>


      </div>
    </div>
    <section className='mt-10 flex flex-col gap-5'>
    <section className='mt-9 bg-dark-2 p-10'>
      <IntegrationForm userId={userInfo._id} btnTitle='Continue' integration_info={integration_info} />
    </section>
    </section>
    </>
  );
}

export default Page;
