import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { Protected, ReverseProtected } from "./wrappers/Protected";
import ErrorBoundary from "./components/organisms/display/ErrorBoundary/ErrorBoundary.jsx";
import HomeLayout from "./components/templates/HomeLayout/HomeLayout";
import PanelLayout from "./components/templates/PanelLayout/PanelLayout";
import Home from "./pages/Home/Home";
import Credits from "./pages/Credits/Credits.tsx";
import Copyright from "./pages/Copyright/Copyright";
import NetworkPanel from "./pages/NetworkPanel/NetworkPanel";
import LoginPage from "./pages/Login/LoginPage";
import MachinesPage from "./pages/Machines/Machines";
import Dobre from "./pages/Dobre/Dobre";
import Groups from "./pages/Accounts/Groups/Groups";
import Users from "./pages/Accounts/Users/Users";
import Machine from "./pages/Machine/Machine.tsx";
import SnapshotLibrary from "./pages/SnapshotLibrary/SnapshotLibrary.tsx";
import IsoLibrary from "./pages/IsoLibrary/IsoLibrary.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route errorElement={<ErrorBoundary/>}>
            <Route path='/dobre'            element={<Dobre/>}/>
            <Route element={<HomeLayout/>}>
                <Route path='/'           element={<Home/>}/>
                <Route path='/credits'    element={<Credits/>}/>
                <Route path='/copyright'  element={<Copyright/>}/>
            </Route>
            <Route element={<Protected/>}>
                <Route element={<PanelLayout/>}>
                    <Route path='/home'                     element={<Home/>}/>
                    <Route path='/network-panel'            element={<NetworkPanel/>}/>    
                </Route>
                <Route element={<PanelLayout doubleNavbar/>}>
                    <Route path='/machines/snapshots'       element={<SnapshotLibrary/>}/>
                    <Route path='/machines/iso'             element={<IsoLibrary/>}/>
                    <Route path='/machines/all'             element={<MachinesPage global={true}/>}/>
                    <Route path='/machines/'                element={<MachinesPage/>}/>
                    <Route path='/machines/:uuid'           element={<Machine/>}/>
                    <Route path='/accounts'                 element={<Navigate to='/accounts/admins'/>}/>
                    <Route path='/accounts/admins'          element={<Users accountType="administrative"/>}/>
                    <Route path='/accounts/clients'         element={<Users accountType="client"/>}/>
                    <Route path='/accounts/groups'          element={<Groups/>}/>
                </Route>
            </Route>
            <Route element={<ReverseProtected/>}>
                <Route path='/login' element={<LoginPage/>}/>
            </Route>
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
