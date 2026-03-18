import { Button } from "@components";
import {
  PROFILE_PAGE_TITLE,
  PROFILE_CANCEL_ACTION_LABEL,
  PROFILE_EDIT_ACTION_LABEL,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const ProfileHeader = () => {
  const {
    controller: { editing, toggleEditing },
  } = useProfileView();

  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <h2 className="page-title">{PROFILE_PAGE_TITLE}</h2>
      <Button onClick={toggleEditing}>
        {editing ? PROFILE_CANCEL_ACTION_LABEL : PROFILE_EDIT_ACTION_LABEL}
      </Button>
    </div>
  );
};

export default ProfileHeader;
