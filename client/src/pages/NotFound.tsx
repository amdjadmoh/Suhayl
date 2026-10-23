import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/kit";

export default function NotFound(): React.ReactElement {
  return (
    <ErrorState
      title="This page doesn't exist"
      action={
        <Button variant="primary" asChild>
          <Link to="/dashboard">Back to the dashboard</Link>
        </Button>
      }
    >
      The link may be old, or there's a typo in the address.
    </ErrorState>
  );
}
