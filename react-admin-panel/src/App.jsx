import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import ConfigValidator from "./wrappers/ConfigValidator";
import ErrorBoundary from "./components/organisms/ErrorBoundary/ErrorBoundary";
import HomeLayout from "./components/templates/HomeLayout/HomeLayout";
import PanelLayout from "./components/templates/PanelLayout/PanelLayout";
import Home from "./pages/Home/Home";
import Desktops from "./pages/Desktops/Desktops";
import {Protected, ReverseProtected} from "./wrappers/Protected";
import Credits from "./pages/Credits/Credits";
import Copyright from "./pages/Copyright/Copyright";
import VirtualMachinePage from "./pages/VirtualMachine/VirtualMachinePage";
import NetworkPanel from "./pages/NetworkPanel/NetworkPanel";
import LoginPage from "./pages/Login/LoginPage";
import MachineListPage from "./pages/MachinesListPage/MachineListPage";



const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<ConfigValidator/>} errorElement={<ErrorBoundary/>}>
            <Route element={<HomeLayout/>}>
                <Route exact path='/'           element={<Home/>}/>
                <Route path='/credits'          element={<Credits/>}/>
                <Route path='/copyright'        element={<Copyright/>}/>
            </Route>
            <Route element={<Protected/>}>
                <Route element={<PanelLayout/>}>
                    <Route path='/home'                 element={<Home/>}/>
                    <Route path='/virtual-machines'     element={<MachineListPage/>}/>
                    <Route path='/virtual-machines/:uuid' element={<VirtualMachinePage/>}/>
                    <Route path='/desktops'             element={<Desktops/>}/>
                    <Route path='/network-panel'        element={<NetworkPanel/>}/>    
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
