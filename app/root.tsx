import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Toaster } from "~/components/ui/toaster";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import Layout from "~/components/Layout";
import { AuthProvider } from "./context/AuthContext";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://api.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.css",
  },
];

// Loader to fetch user session
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") || null;
  return json({ user });
};

export default function App() {
  const { user } = useLoaderData<{ user: { id: string; nombre: string } | null }>();
  const location = useLocation();
  const isIndexRoute = location.pathname === "/";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="font-ubuntu">
        <AuthProvider>
          {isIndexRoute ? (
            // No layout for index route
            <Outlet />
          ) : (
            // Apply Layout for non-index routes
            <Layout user={user}>
              <Outlet />
            </Layout>
          )}
          <Toaster />
          <ScrollRestoration />
          <Scripts />
        </AuthProvider>
      </body>
    </html>
  );
}