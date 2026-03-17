export type ProfileEditorSectionProps = {
  editing: boolean;
  savedMessage: string;
  name: string;
  score: number;
  onSubmit: (name: string) => Promise<string | null>;
};
