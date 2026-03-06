import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layouts/homeLayout/HomeLayout";
import Dashboard from "../layouts/dashboard/Dashboard";
import SignIn from "../layouts/signin/SignIn";
import Camera from "../layouts/camera/Camera";
import Overcrowding from "../layouts/overcrowding/Overcrowding";
import Rehabilitation from "../layouts/rehabilitation/Rehabilitation";
import Inmates from "../layouts/inmates/Inmates";
import Cells from "../layouts/cells/Cells";
import RehabInmates from "../layouts/rehabilitation/RehabInmates";
import Violations from "../layouts/violations/Violations";
import Survey from "../layouts/survey/Survey";
import SupportDocs from "../layouts/survey/SupportDocs";
import InmatesHistory from "../layouts/security/InmatesHistory";
import CommonDocs from "../layouts/security/CommonDocs";


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
                path: "/survey",
                children: [
                    {
                        index: true,
                        element: <Survey />,
                    },
                    {
                        path: "support-docs",
                        element: <SupportDocs />
                    },
                    {
                        path: "history",
                        element: <InmatesHistory />
                    },
                    {
                        path: "common-docs",
                        element: <CommonDocs />
                    },
                ]
            },
            {
                path: "/overcrowding",
                element: <Overcrowding />
            },
            {
                path: "/rehabilitation",
                children: [
                    {
                        index: true,
                        element: <Rehabilitation />,
                    },
                    {
                        path: "rehab-inmates",
                        element: <RehabInmates />
                    },
                ]
            },
            {
                path: "/inmates",
                element: <Inmates />
            },
            {
                path: "/cells",
                element: <Cells />
            },
            {
                path: "/violations",
                element: <Violations />
            },
        ]
    },
    {
        path: "/sign-in",
        element: <SignIn />
    },
])