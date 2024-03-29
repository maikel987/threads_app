import Link from "next/link";
import Image from "next/image";

interface Props {
  internal_name: string;
  address: string;
  picture: string;
  id:string;
}

function PropertyHeader({
  internal_name,
  address,
  picture,
  id,
}: Props) {
  console.log('picture',picture)
  return (
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative h-20 w-20 object-cover'>
            <Image
              src={picture}
              alt='logo'
              fill
              className='rounded-full object-cover shadow-2xl'
            />
          </div>

          <div className='flex-1'>
            <h2 className='text-left text-heading3-bold text-light-1'>
              {internal_name}
            </h2>
            <p className='text-base-medium text-gray-1'>{address}</p>
          </div>
        </div>
          <Link href={`/property/edit/${id}`}>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />
              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>
     
      </div>



      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default PropertyHeader;
