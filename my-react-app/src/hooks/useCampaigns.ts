import { useCallback } from "react";
import { useAppData } from "../context/useAppData";
import type { Campaign, ID } from "../types/domain";
import { newId } from "../utils/id";

export type NewCampaignInput = Omit<Campaign, "id" | "createdAt">;

export function useCampaigns() {
  const { campaigns, setCampaigns, setSessions } = useAppData();

  const add = useCallback(
    (input: NewCampaignInput): Campaign => {
      const campaign: Campaign = {
        id: newId(),
        name: input.name.trim(),
        gameId: input.gameId,
        playerIds: input.playerIds,
        notes: input.notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [...prev, campaign]);
      return campaign;
    },
    [setCampaigns],
  );

  const update = useCallback(
    (id: ID, patch: Partial<Omit<Campaign, "id" | "createdAt">>) => {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    [setCampaigns],
  );

  const remove = useCallback(
    (id: ID) => {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setSessions((prev) => prev.filter((s) => s.campaignId !== id));
    },
    [setCampaigns, setSessions],
  );

  const getById = useCallback((id: ID) => campaigns.find((c) => c.id === id), [campaigns]);

  return { campaigns, add, update, remove, getById };
}
