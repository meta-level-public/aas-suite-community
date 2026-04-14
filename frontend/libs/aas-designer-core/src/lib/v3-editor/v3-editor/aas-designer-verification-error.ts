import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';

export class AasDesignerVerificationError extends VerificationError {
  messageTranslated?: string | undefined;
  constraint?: string | undefined;
  number: number | undefined;
  label: string = 'FIX_THIS';
  allLabel: string = 'FIX_ALL';

  constructor(error: VerificationError) {
    super(error.message, error.path);
    Object.assign(this, error);

    if (error.message.startsWith('Constraint')) {
      this.constraint = error.message.split(':')[0].substring(11);
    }
  }
}
