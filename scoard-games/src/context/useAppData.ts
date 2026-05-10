import { useContext } from "react";
import { AppDataContext, type AppDataState } from "./appDataContextValue";

export function useAppData(): AppDataState {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
