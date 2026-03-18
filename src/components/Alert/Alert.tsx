import type { AlertPropsType } from "./types";
import { ALERT_BASE_STYLE, ALERT_COLOR_STYLE } from "./constants";

const Alert = (props: AlertPropsType) => {
  const { message, color = "primary" } = props;

  return (
    <p className={`${ALERT_BASE_STYLE} ${ALERT_COLOR_STYLE[color]}`}>
      {message}
    </p>
  );
};

export default Alert;
