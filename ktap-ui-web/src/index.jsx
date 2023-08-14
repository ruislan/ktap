import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, createBrowserRouter, createRoutesFromChildren, RouterProvider } from 'react-router-dom';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { DarkTheme, BaseProvider } from 'baseui';
import './assets/css/globals.css';

import { AuthProvider, RequireAuth, RequireAdmin, CheckAlreadyLogin } from './hooks/use-auth';

// Routes
import Home from './pages/home';
import Rank from './pages/ranks';
import App from './pages/apps';
import Review from './pages/reviews';
import User from './pages/users';
import Discover from './pages/discover';
import Search from './pages/search';
import Organization from './pages/organizations';
import News from './pages/news';
import NewsApps from './pages/news/news-apps';
import NewsDetail from './pages/news/news-detail';
import Discussions from './pages/discussions';
import DiscussionsApps from './pages/discussions/apps';
import DiscussionsDetail from './pages/discussions/[id]';
import Login from './pages/login';
import Register from './pages/register';
import Terms from './pages/terms';
import Privacy from './pages/privacy';
import Rules from './pages/rules';
import About from './pages/about';
import PasswordForgot from './pages/password-forgot';
import PasswordReset from './pages/password-reset';
import Settings from './pages/settings';
import SettingsGeneral from './pages/settings/general';
import SettingsProfile from './pages/settings/profile';
import SettingsPassword from './pages/settings/password';
import Tags from './pages/tags';
import TradingHistory from './pages/tradings/history';
import NotFound from './pages/not-found';
import NotWork from './pages/not-work';
import AdminPanel from './pages/admin-panel';
import AdminPanelDashboard from './pages/admin-panel/dashboard';
import AdminPanelUsers from './pages/admin-panel/users';
import AdminPanelUserDetail from './pages/admin-panel/users/user-detail';
import AdminPanelReviews from './pages/admin-panel/reviews';
import AdminPanelDiscussions from './pages/admin-panel/discussions';
import AdminPanelNews from './pages/admin-panel/news';
import AdminPanelApps from './pages/admin-panel/apps';
import AdminPanelAppDetail from './pages/admin-panel/apps/app-detail';
import AdminPanelOrganizations from './pages/admin-panel/organizations';
import AdminPanelTags from './pages/admin-panel/tags';
import AdminPanelBuzzwords from './pages/admin-panel/buzzwords';
import AdminPanelGifts from './pages/admin-panel/gifts';
import AdminPanelDiscover from './pages/admin-panel/discover';
import Layout from './pages/layout';

const engine = new Styletron();
const router = createBrowserRouter(
    createRoutesFromChildren(
        <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='/login' element={<CheckAlreadyLogin><Login /></CheckAlreadyLogin>} />
            <Route path='/register' element={<Register />} />
            <Route path='/terms' element={<Terms />} />
            <Route path='/privacy' element={<Privacy />} />
            <Route path='/about' element={<About />} />
            <Route path='/password/forgot' element={<PasswordForgot />} />
            <Route path='/password/reset' element={<PasswordReset />} />
            <Route path='/apps/:id' element={<App />} />
            <Route path='/users/:id' element={<User />} />
            <Route path='/settings' element={<RequireAuth><Settings /></RequireAuth>}>
                <Route index element={<SettingsGeneral />} />
                <Route path='profile' element={<SettingsProfile />} />
                <Route path='password' element={<SettingsPassword />} />
            </Route>
            <Route path='/tradings/history' element={<RequireAuth><TradingHistory /></RequireAuth>} />
            <Route path='/reviews/:id' element={<Review />} />
            <Route path='/ranks' element={<Rank />} />
            <Route path='/organizations/:id' element={<Organization />} />
            <Route path='/discover' element={<Discover />} />
            <Route path='/news'>
                <Route index element={<News />} />
                <Route path=':id' element={<NewsDetail />} />
                <Route path='apps/:appId' element={<NewsApps />} />
            </Route>
            <Route path='/discussions'>
                <Route index element={<Discussions />} />
                <Route path=':id' element={<DiscussionsDetail />} />
                <Route path='apps/:appId' element={<DiscussionsApps />} />
                <Route path='apps/:appId/channels/:channelId' element={<DiscussionsApps />} />
            </Route>
            <Route path='/search' element={<Search />} />
            <Route path='/tags/:name' element={<Tags />} />
            <Route path='/rules' element={<Rules />} />
            <Route path='/admin-panel' element={<RequireAdmin><AdminPanel /></RequireAdmin>}>
                <Route index element={<AdminPanelDashboard />} />
                <Route path='users'>
                    <Route index element={<AdminPanelUsers />} />
                    <Route path=':id' element={<AdminPanelUserDetail />} />
                </Route>
                <Route path='apps'>
                    <Route index element={<AdminPanelApps />} />
                    <Route path=':id' element={<AdminPanelAppDetail />} />
                </Route>
                <Route path='reviews' element={<AdminPanelReviews />} />
                <Route path='discussions' element={<AdminPanelDiscussions />} />
                <Route path='news' element={<AdminPanelNews />} />
                <Route path='tags' element={<AdminPanelTags />} />
                <Route path='organizations' element={<AdminPanelOrganizations />} />
                <Route path='gifts' element={<AdminPanelGifts />} />
                <Route path='buzzwords' element={<AdminPanelBuzzwords />} />
                <Route path='discover' element={<AdminPanelDiscover />} />
            </Route>
            <Route path='not-work' element={<NotWork />} />
            <Route path='*' element={<NotFound />} />
        </Route>
    )
);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <StyletronProvider value={engine}>
            <BaseProvider theme={DarkTheme}>
                <AuthProvider>
                    <RouterProvider router={router} future={{ v7_startTransition: true }} />
                </AuthProvider>
            </BaseProvider>
        </StyletronProvider>
    </React.StrictMode>
);