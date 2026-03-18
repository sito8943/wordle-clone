export type ProfileEditorSectionProps = {
  editing: boolean;
  savedMessage: string;
  name: string;
  code: string;
  score: number;
  onSubmit: (name: string) => Promise<string | null>;
};
