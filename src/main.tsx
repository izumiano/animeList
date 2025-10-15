import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home.tsx";

const router = createBrowserRouter([
	{
		path: import.meta.env.BASE_URL,
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "malAuth", element: <Home /> },
			{ path: "details/*", element: <Home startPage="details" /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
