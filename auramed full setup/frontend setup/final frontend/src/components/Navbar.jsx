import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-4 hidden sm:flex">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patient records..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64 bg-slate-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-900">Dr. Sarah Jenkins</div>
                        <div className="text-xs text-slate-500">Chief Oncologist</div>
                    </div>
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
