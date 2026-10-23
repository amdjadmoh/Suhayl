import { useState, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { StarGlyph, Wordmark } from "@/components/kit";

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
      window.postMessage({ type: "wannabout-extension-bridge", token }, window.location.origin);
      setState("connected");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Failed to connect extension");
    }
  }, []);

  const handleCloseTab = useCallback(() => {
    window.close();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <StarGlyph className="size-5 animate-pulse text-ink-4" />
      </div>
    );
  }

  if (!user) {
    // Fallback: redirect with returnTo so the user comes back after login.
    return <Navigate to="/login?returnTo=/extension-bridge" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-7">
      <Wordmark className="text-[15px]" />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          <p className="kicker mb-3">Browser extension</p>
          {state === "connected" ? (
            <>
              <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em]">Connected.</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                Programs you save from university websites will show up in Suhayl. You can close this tab.
              </p>
              <Button variant="outline" className="mt-8 w-full" onClick={handleCloseTab}>
                Close this tab
              </Button>
            </>
          ) : state === "error" ? (
            <>
              <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em]">That didn't connect.</h1>
              <p className="mt-3 rounded-2xl bg-stamp-soft px-4 py-3 text-sm text-stamp">{error}</p>
              <Button variant="primary" className="mt-8 w-full" onClick={() => navigate("/login?returnTo=/extension-bridge")}>
                Sign in again
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em]">Let the extension in?</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                This lets the browser extension add programs to <span className="font-medium text-ink">{user.name}</span>'s
                account from any page you visit.
              </p>
              <Button variant="primary" size="lg" className="mt-8 w-full" onClick={handleConnect} disabled={state === "connecting"}>
                {state === "connecting" && <Loader2 className="animate-spin" />}
                {state === "connecting" ? "Connecting…" : "Connect the extension"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
