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

export function CampaignsPage() {
  const { campaigns, add } = useCampaigns();
  const { games, sessions } = useAppData();
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
                <Link key={c.id} to={`/campaigns/${c.id}`} className="group block">
                  <Card interactive>
                    <CardBody>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-content truncate">{c.name}</h3>
                          <p className="text-sm text-content-muted group-hover:text-primary-700 transition-colors mt-0.5 truncate">
                            {game?.name ?? "(deleted game)"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-display font-bold text-3xl leading-none tracking-tight text-accent-600">
                            {sessionCount}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider font-medium text-content-muted mt-1">
                            {sessionCount === 1 ? "session" : "sessions"}
                          </div>
                        </div>
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
