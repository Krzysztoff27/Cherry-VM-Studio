import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/organisms/ErrorBoundary/ErrorBoundary";
import HomeLayout from "./components/templates/HomeLayout/HomeLayout";
import PanelLayout from "./components/templates/PanelLayout/PanelLayout";
import Home from "./pages/Home/Home";
import Desktops from "./pages/Desktops/Desktops";
import { Protected, ReverseProtected } from "./wrappers/Protected";
import Credits from "./pages/Credits/Credits.tsx";
import Copyright from "./pages/Copyright/Copyright";
import VirtualMachinePage from "./pages/VirtualMachine/VirtualMachinePage";
import NetworkPanel from "./pages/NetworkPanel/NetworkPanel";
import LoginPage from "./pages/Login/LoginPage";
import MachinesPage from "./pages/Machines/Machines";
import Dobre from "./pages/Dobre/Dobre";
import Groups from "./pages/Accounts/Groups/Groups";
import Users from "./pages/Accounts/Users/Users";

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
                    <Route path='/virtual-machines'         element={<MachinesPage/>}/>
                    <Route path='/virtual-machines/:uuid'   element={<VirtualMachinePage/>}/>
                    <Route path='/desktops'                 element={<Desktops/>}/>
                    <Route path='/network-panel'            element={<NetworkPanel/>}/>    
                </Route>
                <Route element={<PanelLayout doubleNavbar/>}>
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
    return (
        <RouterProvider router={router} />
    )
}

export default App
