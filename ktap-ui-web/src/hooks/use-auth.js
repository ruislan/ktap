import React from 'react';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';
import { Messages } from '../constants';

const AuthContext = React.createContext({});

function useAuth() {
    return React.useContext(AuthContext);
}

function RequireAuth({ children }) {
    const { authenticating, isAuthenticated } = useAuth();
    if (authenticating) { return <></>; }
    return isAuthenticated() ? children : <Navigate to='/login' replace />;
}

function RequireAdmin({ children }) {
    const { authenticating, isAdmin } = useAuth();
    if (authenticating) { return <></>; }
    return isAdmin() ? children : <Navigate to='/not-found' replace />;
}

function AuthProvider({ children }) {
    const KEY_USER_ID = 'user_id';
    const [user, setUser] = React.useState(null);
    const [authenticating, setAuthenticating] = React.useState(true);

    React.useEffect(() => {
        async function fetchUser() {
            if (Cookies.get(KEY_USER_ID)) {
                try {
                    const res = await fetch(`/api/user`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    setUser(data);
                } catch (e) {
                    localLogout();
                }
            }
            setAuthenticating(false);
        }
        fetchUser();
    }, []);

    async function login(email, password) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.status === 403) {
                const json = await res.json();
                throw new Error(json.message);
            } else if (!res.ok) throw new Error();
        } catch (e) {
            localLogout();
            throw new Error(e.message || Messages.authFail);
        }
    }

    async function logout() {
        try {
            setAuthenticating(true);
            await fetch('/api/logout', { method: 'POST', });
        } finally { // 不管请求如何，直接清空本地
            localLogout();
            setAuthenticating(false);
        }
    }

    function localLogout() {
        setUser(null);
        Cookies.remove(KEY_USER_ID);
        sessionStorage.clear();
        localStorage.clear();
    }

    function isAuthenticated() {
        return !!user;
    }

    function isAdmin() {
        return user && user.isAdmin;
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            authenticating,
            isAuthenticated,
            isAdmin,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export {
    useAuth,
    AuthProvider,
    RequireAuth,
    RequireAdmin,
};
