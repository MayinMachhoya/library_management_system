import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to={user?.role === 'admin' ? '/admin/books' : '/student/issues'} className="flex flex-shrink-0 items-center gap-2">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="font-bold text-xl text-gray-900 tracking-tight">LibraryMS</span>
                        </Link>

                        {user?.role === 'admin' && (
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                <Link to="/admin/books" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Inventory</Link>
                                <Link to="/admin/circulation" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Circulation</Link>
                                <Link to="/admin/students" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Students</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <UserIcon className="h-4 w-4" />
                                    <span className="font-medium">{user.name}</span>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ml-2">
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 text-sm font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:block">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
