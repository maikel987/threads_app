import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchListing } from "@/lib/actions/listing.actions";
import CreateListing from "@/components/forms/CreateListing";
import CreateListing2 from "@/components/forms/CreateListing2";
import { fetchPropertyByUser } from "@/lib/actions/apartment.actions";
import { fetchPlatformAccountByPlatform, PlatformAccount} from "@/lib/actions/integration.actions";
import { getSignedImageUrl } from "@/lib/aws";


async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");


    let listing_data = await fetchListing(params.id);
    if(listing_data.platform_account.owner._id.toString() !== userInfo.id.toString()) return null

    const properties = await fetchPropertyByUser({ userId:userInfo.id });
    
    const integrations = await fetchPlatformAccountByPlatform({ userId:userInfo.id });
    
    const signedUrl = await getSignedImageUrl(listing_data.picture).catch(() => '/assets/missingApt.webp');

    let listing_info = {
        link: listing_data.link ? listing_data.link : '',
        platform: listing_data.platform ? listing_data.platform : '',
        title: listing_data.title ? listing_data.title : '',
        apartment_id: listing_data.apartment._id ? listing_data.apartment._id.toString() : '',
        picture: listing_data.picture ? listing_data.picture : '',
        platform_account_id: listing_data.platform_account._id ? listing_data.platform_account._id.toString() : '',
        internal_id: listing_data.internal_id ? listing_data.internal_id : '',
        id: listing_data.id ? listing_data.id : '',
        status: listing_data.status ? listing_data.status : '',
        signedURL:signedUrl,
      };
        console.log('TEST######################',listing_info);

        //listing_info.picture= '';



    return (
        <>
        <div className='flex w-full flex-col justify-start'>
            <div className='flex items-center justify-between'>
                <h1 className='head-text'>Edit Listings</h1>
            </div>
        </div>
        <section className='mt-10 flex flex-col gap-5'>
            <section className='mt-9 bg-dark-2 p-10'>
                
                <CreateListing2 
                userId={userInfo._id.toString()} 
                btnTitle='Continue' 
                modifiable={false} 
                listing={listing_info} 
                properties={properties}
                platformAccounts = {integrations} />

            </section>
        </section>
        </>
    );
}

export default Page;
