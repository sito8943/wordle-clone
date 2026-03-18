export type RecoverySectionProps = {
  onSubmit: (code: string) => Promise<string | null>;
};
