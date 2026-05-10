import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardBody, CardHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { useCampaigns } from "../hooks/useCampaigns";
import { useGames } from "../hooks/useGames";
import { usePlayers } from "../hooks/usePlayers";
import { useSessions } from "../hooks/useSessions";
import { formatDate } from "../utils/format";

export function DashboardPage() {
  const { games } = useGames();
  const { players } = usePlayers();
  const { campaigns } = useCampaigns();
  const { allSessions } = useSessions();

  const recentSessions = allSessions
    .slice()
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Track scores across your board game campaigns."
        action={
          <Link to="/campaigns">
            <Button>+ New campaign</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile label="Games" value={games.length} />
        <StatTile label="Players" value={players.length} />
        <StatTile label="Campaigns" value={campaigns.length} />
        <StatTile label="Sessions" value={allSessions.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent sessions</h2>
              <Link to="/campaigns" className="text-xs text-brand-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-slate-500">No sessions yet. Start a campaign and record your first play.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentSessions.map((s) => {
                  const campaign = campaigns.find((c) => c.id === s.campaignId);
                  return (
                    <li key={s.id} className="py-2 flex items-center justify-between text-sm">
                      <Link
                        to={campaign ? `/campaigns/${campaign.id}` : "/campaigns"}
                        className="text-slate-900 hover:text-brand-700"
                      >
                        {campaign?.name ?? "Unknown campaign"}
                      </Link>
                      <span className="text-slate-500">{formatDate(s.playedAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Get started</h2>
          </CardHeader>
          <CardBody>
            {games.length === 0 && players.length === 0 ? (
              <EmptyState
                title="No data yet"
                description="Add a game and some players, then create your first campaign."
                action={
                  <div className="flex gap-2 justify-center">
                    <Link to="/games">
                      <Button>Add a game</Button>
                    </Link>
                    <Link to="/players">
                      <Button variant="secondary">Add players</Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-700">
                    {games.length > 0 ? "✓" : "•"} Add games you play
                  </span>
                  <Link to="/games" className="text-brand-600 hover:underline">
                    Manage games
                  </Link>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700">
                    {players.length > 0 ? "✓" : "•"} Add players
                  </span>
                  <Link to="/players" className="text-brand-600 hover:underline">
                    Manage players
                  </Link>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700">
                    {campaigns.length > 0 ? "✓" : "•"} Start a campaign
                  </span>
                  <Link to="/campaigns" className="text-brand-600 hover:underline">
                    Campaigns
                  </Link>
                </li>
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
