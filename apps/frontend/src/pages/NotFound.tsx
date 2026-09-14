import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-20 blur-xl"></div>
          <h1 className="relative mt-4 text-7xl font-extrabold tracking-tight text-foreground sm:text-9xl">
            404
          </h1>
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops! We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Return Home
          </Link>
          <Link
            to="/help"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
