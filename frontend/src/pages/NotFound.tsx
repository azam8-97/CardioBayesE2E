import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center container py-20 text-center">
        <div className="text-6xl mb-4" aria-hidden>
          📉
        </div>
        <h1 className="text-h2 text-white mb-2">Signal lost</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The page you are looking for does not exist or has moved. This is a 404 — not a flatline on your ECG.
        </p>
        <Button asChild variant="primary">
          <Link to="/">Return to home</Link>
        </Button>
      </main>
    </div>
  );
}
