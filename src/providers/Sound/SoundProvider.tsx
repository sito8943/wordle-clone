import type { SoundEvent, SoundProviderProps } from "./types";
import { soundTemplate } from "./soundTemplate";

const { SoundTemplateProvider } = soundTemplate;

const SoundProvider = ({
  children,
  featureEnabled,
  eventMap,
  storageKeys,
}: SoundProviderProps<SoundEvent>) => {
  return (
    <SoundTemplateProvider
      featureEnabled={featureEnabled}
      eventMap={eventMap}
      storageKeys={storageKeys}
    >
      {children}
    </SoundTemplateProvider>
  );
};

export { SoundProvider };
