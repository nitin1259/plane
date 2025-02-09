import { useEffect } from "react";
import { observer } from "mobx-react-lite";
// components
import { LogoSpinner } from "@/components/common";
import { DashboardWidgets } from "@/components/dashboard";
import { EmptyState } from "@/components/empty-state";
import { IssuePeekOverview } from "@/components/issues";
import { TourRoot } from "@/components/onboarding";
import { UserGreetingsView } from "@/components/user";
// constants
import { EmptyStateType } from "@/constants/empty-state";
import { PRODUCT_TOUR_COMPLETED } from "@/constants/event-tracker";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import {
  useCommandPalette,
  useAppRouter,
  useUserProfile,
  useEventTracker,
  useDashboard,
  useProject,
  useUser,
} from "@/hooks/store";
import useSize from "@/hooks/use-window-size";

export const WorkspaceDashboardView = observer(() => {
  // store hooks
  const {
    //  captureEvent,
    setTrackElement,
  } = useEventTracker();
  const { toggleCreateProjectModal } = useCommandPalette();
  const { workspaceSlug } = useAppRouter();
  const { data: currentUser } = useUser();
  const { data: currentUserProfile, updateTourCompleted } = useUserProfile();
  const { captureEvent } = useEventTracker();
  const { homeDashboardId, fetchHomeDashboardWidgets } = useDashboard();
  const { joinedProjectIds } = useProject();

  const [windowWidth] = useSize();

  const handleTourCompleted = () => {
    updateTourCompleted()
      .then(() => {
        captureEvent(PRODUCT_TOUR_COMPLETED, {
          user_id: currentUser?.id,
          state: "SUCCESS",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // fetch home dashboard widgets on workspace change
  useEffect(() => {
    if (!workspaceSlug) return;

    fetchHomeDashboardWidgets(workspaceSlug);
  }, [fetchHomeDashboardWidgets, workspaceSlug]);

  return (
    <>
      {currentUserProfile && !currentUserProfile.is_tour_completed && (
        <div className="fixed left-0 top-0 z-20 grid h-full w-full place-items-center bg-custom-backdrop bg-opacity-50 transition-opacity">
          <TourRoot onComplete={handleTourCompleted} />
        </div>
      )}
      {homeDashboardId && joinedProjectIds ? (
        <>
          {joinedProjectIds.length > 0 ? (
            <>
              <IssuePeekOverview />
              <div
                className={cn(
                  "space-y-7 md:p-7 p-3 bg-custom-background-90 h-full w-full flex flex-col overflow-y-auto",
                  {
                    "vertical-scrollbar scrollbar-lg": windowWidth >= 768,
                  }
                )}
              >
                {currentUser && <UserGreetingsView user={currentUser} />}

                <DashboardWidgets />
              </div>
            </>
          ) : (
            <EmptyState
              type={EmptyStateType.WORKSPACE_DASHBOARD}
              primaryButtonOnClick={() => {
                setTrackElement("Dashboard empty state");
                toggleCreateProjectModal(true);
              }}
            />
          )}
        </>
      ) : (
        <div className="grid h-full w-full place-items-center">
          <LogoSpinner />
        </div>
      )}
    </>
  );
});
