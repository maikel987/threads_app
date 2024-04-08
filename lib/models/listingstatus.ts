
export enum ListingStatus {
    HOUSING_NOT_CONNECTED = "housing_not_connected",
    CONNECTION_REQUESTED = "connection_requested",
    PAYOUT_SETUP_REQUIRED = "payout_setup_required",
    AWAITING_FINAL_APPROVAL = "awaiting_final_approval",
    CONNECTED = "connected",
  }
  
  export const colorListingStatus = {
    [ListingStatus.HOUSING_NOT_CONNECTED]: "color-housing-not-connected",
    [ListingStatus.CONNECTION_REQUESTED]: "color-connection-requested",
    [ListingStatus.PAYOUT_SETUP_REQUIRED]: "color-payout-setup-required",
    [ListingStatus.AWAITING_FINAL_APPROVAL]: "color-awaiting-final-approval",
    [ListingStatus.CONNECTED]: "color-connected",
  };
  