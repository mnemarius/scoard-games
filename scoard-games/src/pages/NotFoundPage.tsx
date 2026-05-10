import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={
        <Link to="/">
          <Button>Go to dashboard</Button>
        </Link>
      }
    />
  );
}
