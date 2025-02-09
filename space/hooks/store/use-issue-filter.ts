import { useContext } from "react";
// lib
import { StoreContext } from "@/lib/app-providers";
// store
import { IIssueFilterStore } from "@/store/issue-filters.store";

export const useIssueFilter = (): IIssueFilterStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useUserProfile must be used within StoreProvider");
  return context.issueFilter;
};
