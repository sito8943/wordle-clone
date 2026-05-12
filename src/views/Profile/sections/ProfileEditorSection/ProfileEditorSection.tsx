import { useEffect, useState } from "react";
import { Alert } from "@components";
import { useAnimatedPresence } from "@hooks";
import { cn } from "@utils/cn";
import { EditableProfileCard, ProfileCard } from "@views/Profile/components";
import { useProfileView } from "@views/Profile/providers";
import { PROFILE_EDITOR_ALERT_EXIT_MS } from "./constants";

const ProfileEditorSection = () => {
  const {
    controller: {
      editing,
      toggleEditing,
      savedMessage,
      player,
      code,
      submitProfile,
    },
  } = useProfileView();
  const hasSavedMessage = savedMessage.length > 0;
  const savedMessageAlert = useAnimatedPresence(
    hasSavedMessage,
    PROFILE_EDITOR_ALERT_EXIT_MS,
  );
  const [visibleSavedMessage, setVisibleSavedMessage] = useState(savedMessage);
  const alertMessage = hasSavedMessage ? savedMessage : visibleSavedMessage;

  useEffect(() => {
    if (hasSavedMessage) {
      setVisibleSavedMessage(savedMessage);
    }
  }, [hasSavedMessage, savedMessage]);

  return (
    <>
      <div
        className={cn(
          "profile-alert-slot",
          hasSavedMessage && "profile-alert-slot-open",
        )}
      >
        {savedMessageAlert.shouldRender ? (
          <div
            role="status"
            aria-live="polite"
            className={savedMessageAlert.isExiting ? "alert-exit" : "alert-enter"}
          >
            <Alert message={alertMessage} color="success" />
          </div>
        ) : null}
      </div>
      {editing ? (
        <EditableProfileCard
          name={player.name}
          code={code}
          score={player.score}
          onSubmit={submitProfile}
          toggleEditing={toggleEditing}
        />
      ) : (
        <ProfileCard
          name={player.name}
          code={code}
          score={player.score}
          toggleEditing={toggleEditing}
        />
      )}
    </>
  );
};

export default ProfileEditorSection;
