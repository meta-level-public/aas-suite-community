import { AasEmailValidator } from './aas-email-validator';

describe('AasEmailValidator', () => {
  it('should validate email correctly', () => {
    expect(AasEmailValidator.isValidEmail('test@example.com')).toBeTruthy();
    expect(AasEmailValidator.isValidEmail('invalid')).toBeFalsy();
    expect(AasEmailValidator.isValidEmail(null)).toBeFalsy();
  });
});
