import { CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { listingStatusEvolution } from "@/lib/actions/listing.actions";
import { useRouter } from "next/navigation";
import Image from "next/image";



interface ListingProps {
    internal_id: string;
  }

export function PayoutConfigurationDialog({ internal_id}: ListingProps) {
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  
  const handleClick = () => {
    listingStatusEvolution({internal_id}).then(() => {
      router.refresh()
      });
    };

  const handleCopyClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const input = document.getElementById("link") as HTMLInputElement;
    await navigator.clipboard.writeText(input.value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="payout_config_btn">Set Up Payout</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
          <h1 className="text-lg font-semibold text-gray-800">Set Up the Payout </h1>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription>
              <div  className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800"> 1. Access Co-Host Page :</h2>
                <p className="text-sm text-gray-600">Go to your listing’s co-hosting section.</p>
              </div>
            </DialogDescription>

            <Button 
          type="button" 
          variant="secondary"
          onClick={() => {
            const url = `https://airbnb.com/hosting/listings/${internal_id}/co-hosts/${process.env.NEXT_PUBLIC_AIRBNB_ACCOUNT_ID}`;
            window.open(url, "_blank");
            }}>
              Set Up Payout
            </Button>   

            <DialogDescription>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800"> 2. Navigate to Payout Preferences:</h2>
                <p className="text-sm text-gray-600">Select the ‘Payouts’ option to specify how funds are shared.</p>

                <div className="flex justify-center items-center border border-black bg-white" > 
                  <Image
                    src={'/assets/payoutClick.png'}
                    alt={`Listing image for ${internal_id}`}
                    width={500}  // Example width or use actual image width
                    height={300} // Example height or use actual image height
                    objectFit='contain' 
                  />
                </div>
              </div>
            </DialogDescription>

            <DialogDescription>
              <div  className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800"> 3. Determine Sharing Percentage:</h2>
                <p className="text-sm text-gray-600">Choose the ‘Percentage’ option to set the earnings share</p>

                  <div className="flex justify-center items-center border border-black bg-white" > 
                    {/* Ensure you have a set height for the container or it will collapse to the height of the image */}
                    <Image
                      src={'/assets/percentageSetUp.png'}
                      alt={`Listing image for ${internal_id}`}
                      width={500}  // Example width or use actual image width
                      height={300} // Example height or use actual image height
                      objectFit='contain' 
                    />
                  </div>              
                  <p className="text-sm text-gray-600">and then click ‘Next’.</p>
                </div>
            </DialogDescription>
            <DialogDescription>
              <div  className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800"> 4. Specify Percentage :</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Input id="link" defaultValue={process.env.NEXT_PUBLIC_PERCENTAGE} readOnly />
                  </div>
                  <Button type="button" size="sm" className="px-3" onClick={handleCopyClick}>
                    <span className="sr-only">Copy</span>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                  {copied && (
                    <div className="text-sm text-green-500">
                      Link copied to clipboard!
                    </div>
                  )}
                </div>
              <p className="text-sm text-gray-600 mt-2">Enter the percentage indicated above and finalize the setup by clicking 'Confirm with Co-Host'.</p>
            </div>
          </DialogDescription>



        <div className="flex justify-end">
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" className="user-card_btn mt-4" onClick={handleClick}>
              Confirm
              </Button>   
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
