import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ToastContainer } from "react-toastify";
import "./App.css";
import { Outlet } from "react-router-dom";
import { MALAuth } from "./external/auth/malAuth";
import { useEffect } from "react";

function App() {
	useEffect(() => {
		MALAuth.instance.init();
	}, []);

	return (
		<div>
			<ToastContainer position="bottom-left" className="leftAlignedText" />
			<Outlet />
		</div>
	);
}

export default App;
