export interface IFieldType {
  UniqueID: string;
  header: string;
  prompt: string;
  hasInput: boolean;
  inputType: string;
  choices: [];
  validators: [];
  children: [];
  sponsoring_customer: string;
  UPDATED_ON?: string;
  id?: number;
  key?: string;
  display: boolean;
  description?: string;
  status?: string;
  Updated_by?: any;
  Tag?: any;
  order?: string;
  isDeleted?: boolean;
}
