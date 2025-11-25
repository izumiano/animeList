import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Home from "./Home.tsx";
import MyErrorBoundary from "./routeErrorPage.tsx";

const router = createBrowserRouter([
	{
		path: import.meta.env.BASE_URL,
		element: <App />,
		errorElement: <MyErrorBoundary />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "malAuth", element: <Home /> },
			{ path: "tmdbAuth", element: <Home /> },
			{ path: "details/*", element: <Home startPage="details" /> },
		],
	},
]);

// biome-ignore lint/style/noNonNullAssertion: <root will always exist>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
