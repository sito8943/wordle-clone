export type ProfileCardPropsTypes = {
  name: string;
  score: number;
};

export interface EditableProfileCardPropsTypes extends ProfileCardPropsTypes {
  onSubmit: (name: string) => void;
}
