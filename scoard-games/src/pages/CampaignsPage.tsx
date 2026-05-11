import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { CampaignForm } from "../components/CampaignForm";
import { Card, CardBody } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/useAppData";
import { useCampaigns } from "../hooks/useCampaigns";
import { formatDate } from "../utils/format";

export function CampaignsPage() {
  const { campaigns, add } = useCampaigns();
  const { games, players, sessions } = useAppData();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Each campaign tracks one game across many sessions."
        action={<Button onClick={() => setCreating(true)}>+ New campaign</Button>}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="A campaign groups sessions of one game. Create one to start tracking."
          action={<Button onClick={() => setCreating(true)}>New campaign</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((c) => {
              const game = games.find((g) => g.id === c.gameId);
              const sessionCount = sessions.filter((s) => s.campaignId === c.id).length;
              return (
                <Link key={c.id} to={`/campaigns/${c.id}`}>
                  <Card className="hover:border-primary-400 hover:shadow-md transition cursor-pointer">
                    <CardBody>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-content truncate">{c.name}</h3>
                          <p className="text-sm text-content-muted mt-0.5">{game?.name ?? "(deleted game)"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-100 text-xs shrink-0">
                          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
                        <span>{c.playerIds.length} players</span>
                        <span>Started {formatDate(c.createdAt)}</span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New campaign" size="lg">
        <CampaignForm
          games={games}
          players={players}
          onCancel={() => setCreating(false)}
          onSubmit={(v) => {
            add(v);
            setCreating(false);
          }}
        />
      </Modal>
    </div>
  );
}
