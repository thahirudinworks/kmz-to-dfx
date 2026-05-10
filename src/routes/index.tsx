import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import 'leaflet/dist/leaflet.css'

export const route = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
]);