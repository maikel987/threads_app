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


interface ListingProps {
    internal_id: string;
  }

export function ConnectionDialogue({ internal_id}: ListingProps) {
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
        <Button className="connection_btn">Connect Housing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
          <h1 className="text-lg font-semibold text-gray-800">Connect Your Airbnb Listing</h1>

          </DialogTitle>
            <DialogDescription>
              <div  className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800"> 1. Assign Co-host :</h2>
                <p className="text-sm text-gray-600">Enter the following email address in your Airbnb co-host settings:</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={process.env.NEXT_PUBLIC_AIRBNB_EMAIL} readOnly />
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
        <DialogDescription>
        <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">2. Link to Airbnb:</h2>
            <p className="text-sm text-gray-600">Proceed to your Airbnb Account to finalize the co-hosting setup.</p>
        </div>
        </DialogDescription>
          <Button 
          type="button" 
          variant="secondary"
          onClick={() => {
            const url = `https://fr.airbnb.com/hosting/listings/${internal_id}/co-hosts`;
            window.open(url, "_blank");
            }}>
              Begin Connection
            </Button>   
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
