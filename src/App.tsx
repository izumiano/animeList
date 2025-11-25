import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ToastContainer } from "react-toastify";
import "./App.css";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MALAuth } from "./external/auth/malAuth";
import { TMDBAuth } from "./external/auth/tmdbAuth";

function App() {
	useEffect(() => {
		MALAuth.instance.init();
		TMDBAuth.instance.init();
	}, []);

	return (
		<div>
			<ToastContainer position="bottom-left" className="leftAlignedText" />
			<Outlet />
		</div>
	);
}

export default App;
