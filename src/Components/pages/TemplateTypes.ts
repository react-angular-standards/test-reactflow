/**
 * @file Template Type Definitions
 * @copyright Company
 */

export interface Types {
  UniqueID: string;
  display: boolean;
  description?: string;
  type: Type;
  UPDATED_ON: Date;
  sponsoring_customer: string;
  node_type: Type;
  isDeleted: boolean;
  header: string;
  inputType: string;
  id: number;
  choices: string[];
  hasInput: boolean;
  prompt: string;
  children: Types[];
  Updated_by?: UpdatedBy;
  Tag?: Tag[];
  order?: number;
}

export interface Tag {
  Description: string;
  NAME: string;
  UPDATED_ON: Date;
  node_type: string;
  id: number;
}

export interface UpdatedBy {
  BEMSID: string;
  CREATED_ON: Date;
  EMAIL: string;
  EQUIPMENT_MANAGER: string;
  IS_ACTIVE: string;
  LAB_ID: string;
  NAME: string;
  NT_USER_ID: string;
  PHONE_1: string;
  PHONE_2: string;
  ROLES: string;
  TITLE: string;
  UPDATED_ON: Date;
  id: number;
  node_type: string;
}

export enum Type {
  RequirementObject = "RequirementObject",
  Template = "Template",
}
