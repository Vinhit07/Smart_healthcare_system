import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case 'PATIENT':
                return [
                    { to: '/patient/dashboard', label: 'Dashboard' },
                    { to: '/patient/appointments', label: 'Appointments' },
                    { to: '/patient/prescriptions', label: 'Prescriptions' },
                    { to: '/patient/symptom-checker', label: 'Symptom Checker' },
                    { to: '/patient/chatbot', label: 'AI Assistant' },
                    { to: '/support', label: 'Support' },
                    { to: '/faq', label: 'FAQs' },
                ];
            case 'DOCTOR':
                return [
                    { to: '/doctor/dashboard', label: 'Dashboard' },
                    { to: '/support', label: 'Support' },
                    { to: '/faq', label: 'FAQs' },
                ];
            case 'ADMIN':
                return [
                    { to: '/admin/dashboard', label: 'Dashboard' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Activity className="h-8 w-8 text-indigo-600" />
                        <span className="ml-2 text-xl font-bold text-slate-900">HealthCare</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-slate-600 hover:text-indigo-600 transition font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-indigo-600">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-slate-900">{user?.name}</div>
                                        <div className="text-xs text-slate-500">{user?.role}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-600 hover:text-red-600 transition"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-slate-600 hover:text-indigo-600"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
