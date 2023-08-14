import React from 'react';
import Cookies from 'js-cookie';
import { Navigate, useLocation } from 'react-router-dom';
import { Messages } from '@ktap/libs/utils';

const AuthContext = React.createContext({});

function useAuth() {
    return React.useContext(AuthContext);
}

function CheckAlreadyLogin({ children }) {
    const { user } = useAuth();
    return user?.id ? <Navigate to={`/users/${user.id}`} replace /> : children;
}

function RequireAuth({ children }) {
    const { authenticating, isAuthenticated } = useAuth();
    const location = useLocation();
    if (authenticating) return <></>;
    return isAuthenticated() ? children : <Navigate to={`/login?from=${location.pathname}`} replace />;
}

function RequireAdmin({ children }) {
    const { authenticating, isAdmin } = useAuth();
    if (authenticating) return <></>;
    return isAdmin() ? children : <Navigate to='/not-found' replace />;
}

function AuthProvider({ children }) {
    const KEY_USER_ID = 'user_id';
    const [user, setUser] = React.useState(null);
    const [authenticating, setAuthenticating] = React.useState(true);

    const fetchUser = React.useCallback(async () => {
        if (Cookies.get(KEY_USER_ID)) {
            try {
                const res = await fetch(`/api/user`);
                if (!res.ok) throw new Error();
                const json = await res.json();
                setUser(json.data);
            } catch (e) {
                localLogout();
            }
        }
        setAuthenticating(false);
    }, []);

    React.useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    async function login(email, password, from = '/') {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                window.location.href = from;
            } else {
                if (res.status === 403) {
                    const json = await res.json();
                    throw new Error(json.message);
                } else throw new Error();
            }
        } catch (e) {
            localLogout();
            throw new Error(e.message || Messages.authFail);
        }
    }

    async function logout(to = '/') {
        try {
            setAuthenticating(true);
            await fetch('/api/logout', { method: 'POST', });
        } finally { // 不管结果如何，直接清空本地
            localLogout();
            setAuthenticating(false);
            window.location.href = to;
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
    CheckAlreadyLogin,
};
