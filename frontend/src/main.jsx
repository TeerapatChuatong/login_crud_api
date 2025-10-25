import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css"; // ใช้วิธี npm ก็ลบ <link> ใน index.html
import "./App.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter /* basename={import.meta.env.BASE_URL} */>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
