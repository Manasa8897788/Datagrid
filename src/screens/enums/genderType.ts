export enum GenderType{
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderDisplay: Record<GenderType, string> = {
  [GenderType.MALE]: 'Male',
  [GenderType.FEMALE]: 'Female',
  [GenderType.OTHER]: 'Other',
};
