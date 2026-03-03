import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layouts/homeLayout/HomeLayout";
import Dashboard from "../layouts/dashboard/Dashboard";
import SignIn from "../layouts/signIn/SignIn";
import Camera from "../layouts/camera/Camera";
import Register from "../layouts/register/Register";
import StaffList from "../layouts/staff/StaffList";
import InmatesList from "../layouts/inmates/InmatesList";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "/camera",
                element: <Camera />
            },
            {
                path: "/inmates",
                element: <InmatesList />
            },
            {
                path: "/staff",
                element: <StaffList />
            }
        ]
    },
    {
        path: "/sign-in",
        element: <SignIn />
    },
    {
        path: "/register",
        element: <Register />
    },
])