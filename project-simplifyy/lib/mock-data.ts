export type MappingStatus = "review" | "generate"

export type Project = {
  id: string
  name: string
  source: string
  target: string
  dataDomain: string
  progress: number
  sourceIngested: boolean
  sourceFields: number
  targetIngested: boolean
  targetFields: number
  fieldsMapped: number
  mappingStatus: MappingStatus
}

export const projects: Project[] = [
  {
    id: "project-simplifyy",
    name: "Project Simplifyy",
    source: "SAP S4 HANA",
    target: "Salesforce",
    dataDomain: "Customer Master",
    progress: 100,
    sourceIngested: true,
    sourceFields: 55,
    targetIngested: true,
    targetFields: 57,
    fieldsMapped: 57,
    mappingStatus: "review",
  },
  {
    id: "project-2",
    name: "Project 2",
    source: "Oracle EBS",
    target: "Workday",
    dataDomain: "Vendor Master",
    progress: 62,
    sourceIngested: true,
    sourceFields: 67,
    targetIngested: true,
    targetFields: 71,
    fieldsMapped: 30,
    mappingStatus: "review",
  },
  {
    id: "project-3",
    name: "Project 3",
    source: "NetSuite",
    target: "Snowflake",
    dataDomain: "Product Catalog",
    progress: 48,
    sourceIngested: true,
    sourceFields: 41,
    targetIngested: false,
    targetFields: 39,
    fieldsMapped: 0,
    mappingStatus: "generate",
  },
  {
    id: "project-4",
    name: "Project 4",
    source: "Source System",
    target: "Target System",
    dataDomain: "Finance",
    progress: 0,
    sourceIngested: false,
    sourceFields: 0,
    targetIngested: false,
    targetFields: 0,
    fieldsMapped: 0,
    mappingStatus: "generate",
  },
]

export function getProject(id: string) {
  return projects.find((p) => p.id === id) ?? projects[0]
}

export type SchemaField = {
  id: string
  fieldName: string
  description: string
  dataType: string
  length: number
  mandatory: boolean
  nullable: boolean
  custom: boolean
  notes: string
}

export const sourceFields: SchemaField[] = [
  { id: "s1", fieldName: "Name", description: "Name of the vendor/Customer", dataType: "varchar", length: 200, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "s2", fieldName: "Address1", description: "Address line 1", dataType: "varchar", length: 200, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "s3", fieldName: "Address2", description: "Address line 2", dataType: "varchar", length: 200, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "s4", fieldName: "City", description: "City", dataType: "varchar", length: 50, mandatory: false, nullable: false, custom: false, notes: "" },
  { id: "s5", fieldName: "State", description: "State/Province", dataType: "varchar", length: 50, mandatory: false, nullable: false, custom: false, notes: "" },
  { id: "s6", fieldName: "Postcode", description: "Postcode", dataType: "varchar", length: 10, mandatory: false, nullable: false, custom: false, notes: "" },
  { id: "s7", fieldName: "Country", description: "Country", dataType: "varchar", length: 2, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "s8", fieldName: "TaxID", description: "Tax identification number", dataType: "varchar", length: 30, mandatory: false, nullable: true, custom: true, notes: "Region specific" },
]

export const targetFields: SchemaField[] = [
  { id: "t1", fieldName: "AccountName", description: "Account display name", dataType: "string", length: 255, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "t2", fieldName: "BillingStreet", description: "Billing street address", dataType: "string", length: 255, mandatory: true, nullable: false, custom: false, notes: "" },
  { id: "t3", fieldName: "BillingCity", description: "Billing city", dataType: "string", length: 60, mandatory: false, nullable: true, custom: false, notes: "" },
  { id: "t4", fieldName: "BillingState", description: "Billing state/province", dataType: "string", length: 60, mandatory: false, nullable: true, custom: false, notes: "" },
  { id: "t5", fieldName: "BillingPostalCode", description: "Billing postal code", dataType: "string", length: 20, mandatory: false, nullable: true, custom: false, notes: "" },
  { id: "t6", fieldName: "BillingCountry", description: "Billing country", dataType: "string", length: 80, mandatory: true, nullable: false, custom: false, notes: "" },
]

export type MappingState = "suggested" | "approved" | "rejected" | "modified" | "unmapped"

export type FieldMapping = {
  id: string
  sourceField: string
  targetField: string
  logic: string
  confidence: number
  state: MappingState
  sourceMissing?: boolean
  targetMissing?: boolean
  reasoning: string[]
  alternate?: {
    targetField: string
    confidence: number
    reasoning: string[]
  }
  notes: string
  reviewedBy?: string
  reviewedDate?: string
  updatedBy?: string
  updatedDate?: string
}

export const fieldMappings: FieldMapping[] = [
  {
    id: "m1",
    sourceField: "CustomerID",
    targetField: "AccountId",
    logic: "Both the fields are primary keys in each schema",
    confidence: 98,
    state: "suggested",
    targetMissing: true,
    reasoning: ["Both fields are primary keys", "Data type: identifier", "Sample values are unique identifiers"],
    alternate: {
      targetField: "ExternalId",
      confidence: 61,
      reasoning: ["Also used as a unique reference", "Data type: identifier"],
    },
    notes: "AI Mapping generated",
  },
  {
    id: "m2",
    sourceField: "Name",
    targetField: "AccountName",
    logic: "Field names are exactly the same",
    confidence: 99,
    state: "suggested",
    reasoning: ["Field names are semantically similar", "Data type: Text", "Sample values show customer names"],
    alternate: {
      targetField: "altName",
      confidence: 55,
      reasoning: ["Field names are semantically similar", "Data type: Text", "Sample values show customer names"],
    },
    notes: "AI Mapping generated",
  },
  {
    id: "m3",
    sourceField: "Address1",
    targetField: "BillingStreet",
    logic: "Semantically fields are the same",
    confidence: 90,
    state: "approved",
    reasoning: ["Semantically aligned address fields", "Data type: Text", "Sample values show street addresses"],
    notes: "Reviewed and accepted",
  },
  {
    id: "m4",
    sourceField: "Postcode",
    targetField: "BillingPostalCode",
    logic: "Field names are different but the description, datatype, and length are the same",
    confidence: 40,
    state: "rejected",
    reasoning: ["Names differ significantly", "Length mismatch risk", "Low semantic similarity"],
    notes: "Rejected — needs manual mapping",
  },
  {
    id: "m5",
    sourceField: "TaxID",
    targetField: "",
    logic: "Field not found",
    confidence: 0,
    state: "unmapped",
    sourceMissing: true,
    reasoning: ["No matching target field found", "Consider creating a custom field"],
    notes: "No target match",
  },
]
