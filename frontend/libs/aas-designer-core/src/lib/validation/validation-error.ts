export interface ValidationError {
  uuid: string;
  message: string;
  value: any;
  valueType: any;
  htmlId?: string;
  submodel?: boolean;
  severity: 'warn' | 'error' | 'hint';
}
