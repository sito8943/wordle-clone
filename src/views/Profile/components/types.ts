export type ProfileCardPropsTypes = {
  name: string;
  code: string;
  score: number;
};

export interface EditableProfileCardPropsTypes extends ProfileCardPropsTypes {
  onSubmit: (name: string) => Promise<string | null>;
}
