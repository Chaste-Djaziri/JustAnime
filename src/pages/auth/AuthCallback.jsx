import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleOAuthToken } = useAuth();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    async function processCallback() {
      try {
        setErrorMsg(null);
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        if (!accessToken) {
          // Check query parameters for error
          const queryParams = new URLSearchParams(window.location.search);
          const error = queryParams.get("error");
          const errorDescription = queryParams.get("error_description");
          if (error) {
            throw new Error(errorDescription || `OAuth Error: ${error}`);
          }
          throw new Error("No access token found in OAuth response.");
        }

        await handleOAuthToken(accessToken);
        // Clean URL hash and navigate to profile
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/profile", { replace: true });
      } catch (err) {
        console.error("AniList OAuth callback failed:", err);
        setErrorMsg(err.message || "Failed to complete AniList authentication.");
      }
    }

    processCallback();
  }, [handleOAuthToken, navigate, retryKey]);

  if (errorMsg) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl mb-4">
          <FontAwesomeIcon icon={faCircleExclamation} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentication Issue</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6">{errorMsg}</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition-colors"
          >
            Go to Profile
          </button>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <BouncingLoader />
      <p className="text-sm font-medium text-zinc-400 animate-pulse">
        Connecting to AniList & syncing your anime library...
      </p>
    </div>
  );
}
