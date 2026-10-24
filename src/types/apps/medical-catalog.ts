export interface ConditionMedication {
  id: number;
  conditionId: number;
  name: string;
  description: string;
}

export interface MedicalCondition {
  id: number;
  name: string;
  medications: ConditionMedication[];
}
