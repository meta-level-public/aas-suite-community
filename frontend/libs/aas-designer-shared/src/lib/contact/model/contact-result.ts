export class ContactResult {
  isSuccess: boolean = false;
  contactResultStatus: ContactResultStatus = ContactResultStatus.Success;
}

export enum ContactResultStatus {
  Success = 'Success',
  OrganisationDomainAlreadyExists = 'OrganisationDomainAlreadyExists',
  OrganisationNotCreated = 'OrganisationNotCreated',
}
