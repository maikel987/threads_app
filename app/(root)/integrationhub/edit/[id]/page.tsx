import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import IntegrationForm from "@/components/forms/CreateIntegration";
import { fetchIntegration } from "@/lib/actions/integration.actions";


async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    let integration_info = await fetchIntegration(params.id);
    console.log(integration_info);

      
    let integ_info = {
        id:integration_info.id?integration_info.id:'',
        username:integration_info.username?integration_info.username:'',
        password:integration_info.password?integration_info.password:'',
        platform:integration_info.platform?integration_info.platform:'',
        platform_account_id:integration_info.platform_account_id?integration_info.platform_account_id:'',
        account_url:integration_info.account_url?integration_info.account_url:'',
        apiKey:integration_info.apiKey?integration_info.apiKey:'',
        modifiable : integration_info.listings.length < 1
      }

    return (
        <>
        <div className='flex w-full flex-col justify-start'>
            <div className='flex items-center justify-between'>
                <h1 className='head-text'>Edit Integration</h1>
            </div>
        </div>
        <section className='mt-10 flex flex-col gap-5'>
            <section className='mt-9 bg-dark-2 p-10'>
                <IntegrationForm userId={userInfo._id} btnTitle='Continue' integration_info={integ_info} />
            </section>
        </section>
        </>
    );
}

export default Page;
