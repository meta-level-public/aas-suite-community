export interface ContactInformation {
  nationalCode: string;
  cityTown: string;
  company: string;
  telephoneNumber: string;
  street: string;
  emailAddress: string;
  zipCode: string;
}

export function createEmptyContactInformation(): ContactInformation {
  return {
    nationalCode: '',
    cityTown: '',
    company: '',
    telephoneNumber: '',
    street: '',
    emailAddress: '',
    zipCode: '',
  };
}
