import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Stethoscope, Dna, LayoutDashboard, LogOut, Lock } from 'lucide-react';
import { PatientContext } from '../context/PatientContext';

const Sidebar = () => {
    const { isSessionActive } = useContext(PatientContext);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Breast Cancer Analysis', path: '/breast', icon: <Activity size={20} /> },
        { name: 'Cervical Cancer Analysis', path: '/cervical', icon: <Dna size={20} /> },
        { name: 'PCOS Detection', path: '/pcos', icon: <Stethoscope size={20} /> },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <div className="flex items-center gap-2 text-teal-600">
                    <Activity size={28} className="stroke-[2.5]" />
                    <span className="text-xl font-bold tracking-tight">AuraMed AI</span>
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                    Diagnostic Modules
                </div>
                {navItems.map((item) => {
                    const isDisabled = !isSessionActive && item.path !== '/dashboard';
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={(e) => {
                                if (isDisabled) {
                                    e.preventDefault();
                                }
                            }}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${isDisabled
                                    ? 'text-slate-400 opacity-60 cursor-not-allowed grayscale'
                                    : isActive
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                {item.name}
                            </div>
                            {isDisabled && <Lock size={14} className="opacity-50" />}
                        </NavLink>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-200">
                <NavLink
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
