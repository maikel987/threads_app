
export enum IntegrationStatus {
  INITIATING = "initiating",
  PENDING = "pending",
  CONNECTED = "connected", //ok
  REFRESHING = "refreshing",
  FAILED = "failed", //ok
  }
  
  export const IntegrationStatusColorClasses = {
    [IntegrationStatus.INITIATING]: "color-initiating",
    [IntegrationStatus.PENDING]: "color-pending",
    [IntegrationStatus.CONNECTED]: "color-connected",
    [IntegrationStatus.REFRESHING]: "color-refreshing",
    [IntegrationStatus.FAILED]: "color-failed",
  };
  
  