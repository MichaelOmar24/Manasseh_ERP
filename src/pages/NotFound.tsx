import { Link } from "react-router-dom";
import { Compass, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
      </div>
      <p className="mt-6 font-mono text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Let's get you back to safety.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/"><Home className="h-4 w-4" /> Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/login"><LogIn className="h-4 w-4" /> Staff & client login</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
