import { useState, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Plug } from "lucide-react";

type BridgeState = "idle" | "connecting" | "connected" | "error";

export default function ExtensionBridge(): React.ReactElement {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<BridgeState>("idle");
  const [error, setError] = useState("");

  const handleConnect = useCallback(() => {
    try {
      setState("connecting");
      const token = localStorage.getItem("token");
      if (!token) {
        setState("error");
        setError("No authentication token found. Please log in again.");
        return;
      }
      window.postMessage(
        { type: "wannabout-extension-bridge", token },
        window.location.origin,
      );
      setState("connected");
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error ? err.message : "Failed to connect extension",
      );
    }
  }, []);

  const handleCloseTab = useCallback(() => {
    window.close();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    // Fallback: should not render because ProtectedRoute guards this page,
    // but redirect with returnTo so the user comes back after login.
    return <Navigate to="/login?returnTo=/extension-bridge" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect this browser extension to WannaOut</CardTitle>
          <CardDescription>
            This will let the extension add programs to your account from any
            page you visit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "idle" && (
            <Button onClick={handleConnect} className="w-full">
              <Plug className="mr-2 h-4 w-4" />
              Connect extension
            </Button>
          )}

          {state === "connecting" && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting…
            </Button>
          )}

          {state === "connected" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Connected! You can close this tab.</span>
              </div>
              <Button
                onClick={handleCloseTab}
                variant="outline"
                className="w-full"
              >
                Close tab
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Connection failed</p>
                  <p>{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login?returnTo=/extension-bridge")}
              >
                Log in again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
