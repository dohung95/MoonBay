import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(localStorage.getItem('token') || '');
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const storedUser = localStorage.getItem('user');
//         if (storedUser) {
//             try {
//                 const parsedUser = JSON.parse(storedUser);
//                 setUser(parsedUser);
//             } catch (error) {
//                 console.error("Error parsing stored user:", error);
//                 localStorage.removeItem('user');
//                 setUser(null);
//             }
//         }
//         setLoading(false);
//     }, []);
    
//     const login = (userData, authToken) => {
//         // Đảm bảo userData có avatar, nếu không thì đặt mặc định
//         const user = {
//             ...userData,
//             avatar: userData.avatar || '/images/avatar/default.png',
//         };
//         setUser(user);
//         setToken(authToken);
//         localStorage.setItem('user', JSON.stringify(user));
//         localStorage.setItem('token', authToken);
//         console.log('User stored in localStorage:', localStorage.getItem('user')); // Debug
//         console.log('Token stored in localStorage:', localStorage.getItem('token')); // Debug
//         axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
//     };

//     const logout = () => {
//         setUser(null);
//         setToken('');
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         console.log('User and token removed from localStorage');
//     };

//     const updateUser = (updatedUser) => {
//         const user = {
//             ...updatedUser,
//             avatar: updatedUser.avatar || '/images/avatar/default.png',
//         };
//         setUser(user);
//         localStorage.setItem('user', JSON.stringify(user));
//         console.log('Updated user stored in localStorage:', localStorage.getItem('user')); // Debug
//     };

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };







export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(Cookies.get('token') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy thông tin user và token từ cookie khi component mount
        const storedUser = Cookies.get('user');
        const storedToken = Cookies.get('token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Reset thời gian sống của cookie (gia hạn thêm 30 ngày)
                Cookies.set('user', storedUser, { expires: 30 }); // 30 ngày
                Cookies.set('token', storedToken, { expires: 30 }); // 30 ngày
            } catch (error) {
                console.error("Error parsing stored user:", error);
                // Nếu có lỗi, xóa cookie và reset state
                Cookies.remove('user');
                Cookies.remove('token');
                setUser(null);
                setToken('');
                delete axios.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        // Đảm bảo userData có avatar, nếu không thì đặt mặc định
        const user = {
            ...userData,
            avatar: userData.avatar || '/images/Dat/avatar/default.png',
        };
        setUser(user);
        setToken(authToken);

        // Lưu user và token vào cookie với thời gian sống 30 ngày
        Cookies.set('user', JSON.stringify(user), { expires: 30 }); // 30 ngày
        Cookies.set('token', authToken, { expires: 30 }); // 30 ngày

        console.log('User stored in cookie:', Cookies.get('user')); // Debug
        console.log('Token stored in cookie:', Cookies.get('token')); // Debug
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken('');

        // Xóa cookie khi logout
        Cookies.remove('user');
        Cookies.remove('token');

        delete axios.defaults.headers.common['Authorization'];
        console.log('User and token removed from cookie');
    };

    const updateUser = (updatedUser) => {
        const user = {
            ...updatedUser,
            avatar: updatedUser.avatar || '/images/Dat/avatar/default.png',
        };
        setUser(user);

        // Cập nhật cookie với thời gian sống 30 ngày
        Cookies.set('user', JSON.stringify(user), { expires: 30 }); // 30 ngày
        console.log('Updated user stored in cookie:', Cookies.get('user')); // Debug
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};