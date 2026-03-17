import { Button } from "@components";
import {
  PROFILE_CANCEL_ACTION_LABEL,
  PROFILE_EDIT_ACTION_LABEL,
  PROFILE_PAGE_TITLE,
} from "../../constants";
import type { ProfileHeaderProps } from "./types";

const ProfileHeader = ({ editing, onToggleEditing }: ProfileHeaderProps) => {
  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <h2 className="page-title">{PROFILE_PAGE_TITLE}</h2>
      <Button onClick={onToggleEditing}>
        {editing ? PROFILE_CANCEL_ACTION_LABEL : PROFILE_EDIT_ACTION_LABEL}
      </Button>
    </div>
  );
};

export default ProfileHeader;
