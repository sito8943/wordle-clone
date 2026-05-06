import type { SoundEvent, SoundProviderProps } from "./types";
import { soundTemplate } from "./soundTemplate";

const { SoundTemplateProvider } = soundTemplate;

const SoundProvider = ({
  children,
  featureEnabled,
  eventMap,
  musicMap,
  channels,
  includeDefaultChannels,
  storageKeyPrefix,
  storageKeys,
}: SoundProviderProps<SoundEvent>) => {
  return (
    <SoundTemplateProvider
      featureEnabled={featureEnabled}
      eventMap={eventMap}
      musicMap={musicMap}
      channels={channels}
      includeDefaultChannels={includeDefaultChannels}
      storageKeyPrefix={storageKeyPrefix}
      storageKeys={storageKeys}
    >
      {children}
    </SoundTemplateProvider>
  );
};

export { SoundProvider };
