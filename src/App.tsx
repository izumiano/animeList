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
