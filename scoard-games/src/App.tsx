import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AppDataProvider } from "./context/AppDataContext";
import { CampaignDetailPage } from "./pages/CampaignDetailPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GamesPage } from "./pages/GamesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlayersPage } from "./pages/PlayersPage";
import { SessionFormPage } from "./pages/SessionFormPage";

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="campaigns/:id/sessions/new" element={<SessionFormPage />} />
            <Route path="campaigns/:id/sessions/:sessionId" element={<SessionFormPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
