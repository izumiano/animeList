import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Home from "./Home.tsx";
import MyErrorBoundary from "./routeErrorPage.tsx";

if (import.meta.env.DEV) {
	const matches = window.location.href.match(
		/\?console(?:=(?<config>show|hide))?/,
	);
	if (matches) {
		import("eruda").then((_eruda) => {
			const eruda = _eruda.default;
			eruda.init();

			if (matches.groups?.config === "show") {
				eruda.show();
			}
		});
	}
}

const routes = [
	{ index: true, element: <Home /> },
	{ path: "malAuth", element: <Home /> },
	{ path: "tmdbAuth", element: <Home /> },
	{ path: "details/*", element: <Home startPage="details" /> },
	{ path: "stats", element: <Home startPage="stats" /> },
];

if (import.meta.env.DEV) {
	const StarRatingTest = lazy(() => import("./dev/starRatingTest"));
	routes.push({ path: "dev", element: <StarRatingTest /> });
}

const router = createBrowserRouter([
	{
		path: import.meta.env.BASE_URL,
		element: <App />,
		errorElement: <MyErrorBoundary />,
		children: routes,
	},
]);

// biome-ignore lint/style/noNonNullAssertion: <root will always exist>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
