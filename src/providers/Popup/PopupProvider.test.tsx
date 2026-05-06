import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PopupProvider } from "./PopupProvider";
import {
  POPUP_PORTAL_MANAGED_ATTRIBUTE,
  POPUP_PORTAL_REF_COUNT_ATTRIBUTE,
  POPUP_PORTAL_ROOT_ID,
} from "./constants";

afterEach(() => {
  cleanup();
  const portalTarget = document.getElementById(POPUP_PORTAL_ROOT_ID);
  if (portalTarget?.parentElement) {
    portalTarget.parentElement.removeChild(portalTarget);
  }
});

describe("PopupProvider", () => {
  it("keeps a shared portal root alive until the last provider unmounts", async () => {
    const Providers = ({
      showFirst,
      showSecond,
    }: {
      showFirst: boolean;
      showSecond: boolean;
    }) => (
      <>
        {showFirst ? (
          <PopupProvider>
            <div>First</div>
          </PopupProvider>
        ) : null}
        {showSecond ? (
          <PopupProvider>
            <div>Second</div>
          </PopupProvider>
        ) : null}
      </>
    );

    const { rerender } = render(<Providers showFirst showSecond />);

    await waitFor(() => {
      const portalTarget = document.getElementById(POPUP_PORTAL_ROOT_ID);
      expect(portalTarget).toBeTruthy();
      expect(portalTarget?.getAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE)).toBe(
        "2",
      );
      expect(portalTarget?.getAttribute(POPUP_PORTAL_MANAGED_ATTRIBUTE)).toBe(
        "true",
      );
    });

    rerender(<Providers showFirst={false} showSecond />);

    await waitFor(() => {
      const portalTarget = document.getElementById(POPUP_PORTAL_ROOT_ID);
      expect(portalTarget).toBeTruthy();
      expect(portalTarget?.getAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE)).toBe(
        "1",
      );
    });

    rerender(<Providers showFirst={false} showSecond={false} />);

    await waitFor(() => {
      expect(document.getElementById(POPUP_PORTAL_ROOT_ID)).toBeNull();
    });
  });

  it("does not remove unmanaged pre-existing portal roots", async () => {
    const preexistingPortalTarget = document.createElement("div");
    preexistingPortalTarget.id = POPUP_PORTAL_ROOT_ID;
    document.body.appendChild(preexistingPortalTarget);

    const { unmount } = render(
      <PopupProvider>
        <div>Child</div>
      </PopupProvider>,
    );

    await waitFor(() => {
      expect(
        preexistingPortalTarget.getAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE),
      ).toBe("1");
      expect(
        preexistingPortalTarget.getAttribute(POPUP_PORTAL_MANAGED_ATTRIBUTE),
      ).toBeNull();
    });

    unmount();

    expect(document.getElementById(POPUP_PORTAL_ROOT_ID)).toBe(
      preexistingPortalTarget,
    );
    expect(
      preexistingPortalTarget.getAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE),
    ).toBe("0");
  });
});
