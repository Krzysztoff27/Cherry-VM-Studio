import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, RouterProvider } from "react-router-dom";
import Protected from "./wrappers/Protected";
import ErrorBoundary from "./components/organisms/display/ErrorBoundary/ErrorBoundary";
import PanelLayout from "./components/templates/PanelLayout/PanelLayout";
import LoginPage from "./pages/global/LoginPage/LoginPage.tsx";
import { AuthenticationProvider } from "./contexts/AuthenticationContext.tsx";
import { PermissionsProvider } from "./contexts/PermissionsContext.tsx";
import ReverseProtected from "./wrappers/ReverseProtected.tsx";
import MachinesPage from "./pages/administrative/machines/MachinesPage/MachinesPage.tsx";
import MachinePage from "./pages/administrative/machines/MachinePage/MachinePage.tsx";
import DobrePage from "./pages/global/DobrePage/DobrePage.tsx";
import CreditsPage from "./pages/global/CreditsPage/CreditsPage.tsx";
import CopyrightPage from "./pages/global/CopyrightPage/CopyrightPage.tsx";
import AdminHomePage from "./pages/administrative/main/AdminHomePage/AdminHomePage.tsx";
import TemplatesLibraryPage from "./pages/administrative/machines/TemplatesLibraryPage/TemplatesLibraryPage.tsx";
import IsoLibraryPage from "./pages/administrative/machines/IsoLibraryPage/IsoLibraryPage.tsx";
import UsersPage from "./pages/administrative/accounts/UsersPage/UsersPage.tsx";
import GroupsPage from "./pages/administrative/accounts/GroupsPage/GroupsPage.tsx";
import ClientHomePage from "./pages/client/main/ClientHomePage/ClientHomePage.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={
            <AuthenticationProvider>
                <PermissionsProvider>
                    <Outlet/>
                </PermissionsProvider>
            </AuthenticationProvider>
        }>
            <Route errorElement={<ErrorBoundary/>} >
                <Route path='/'                                 element={<Navigate to='/login'/>}/>
                <Route path='/credits'                          element={<CreditsPage/>}/>
                <Route path='/copyright'                        element={<CopyrightPage/>}/>
                <Route path="/admin" element={<Protected accountType="administrative" wrongAccountTypeFallback="/client/home"/>}>
                    <Route element={<PanelLayout account_type="administrative"/>}>
                        <Route path='home'                      element={<AdminHomePage/>}/>
                        {/* <Route path='network-panel'             element={<NetworkPanelPage/>}/>     */}
                    </Route>
                    <Route element={<PanelLayout account_type="administrative" doubleNavbar/>}>
                        <Route path='machines/templates'        element={<TemplatesLibraryPage/>}/>
                        {/* <Route path='machines/snapshots'       element={</>}/> */}
                        <Route path='machines/iso'              element={<IsoLibraryPage/>}/>
                        <Route path='machines/all'              element={<MachinesPage global={true}/>}/>
                        <Route path='machines'                  element={<MachinesPage/>}/>
                        <Route path='machines/machine/:uuid'    element={<MachinePage/>}/>
                        <Route path='accounts'                  element={<Navigate to='/admin/accounts/admins'/>}/>
                        <Route path='accounts/admins'           element={<UsersPage accountType="administrative"/>}/>
                        <Route path='accounts/clients'          element={<UsersPage accountType="client"/>}/>
                        <Route path='accounts/groups'           element={<GroupsPage/>}/>
                    </Route>
                </Route>
                <Route path="/client" element={<Protected accountType="client" wrongAccountTypeFallback="/admin/home"/>}>
                    <Route element={<PanelLayout account_type="client"/>}>
                        <Route path='home'                      element={<ClientHomePage/>}/>    
                        <Route path='machines'/>
                    </Route>
                </Route>
                <Route element={<ReverseProtected/>}>
                    <Route path='/login'                        element={<LoginPage/>}/>
                </Route>
                <Route path='/dobre'                            element={<DobrePage/>}/>
                <Route path="*" loader={() => {throw new Response("Page not found", {status: 404})}} />
            </Route>
        </Route>
    )
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
