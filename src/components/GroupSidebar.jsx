import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Plus, Compass, Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';

const GroupSidebar = ({ onCreateGroup, onJoinGroup }) => {
    const { groups, currentGroup, selectGroup } = useChat();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="w-16 md:w-20 bg-theme-surface flex flex-col items-center py-4 space-y-4 border-r border-theme overflow-y-auto">

            {/* Home / Direct Messages (Optional, can be a special 'group') */}
            {/* <div
                onClick={() => selectGroup(null)}
                className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-theme-primary text-white
                ${!currentGroup ? 'rounded-[16px] bg-theme-primary' : ''}`}
            >
                <MessageSquare size={24} />
            </div> */}
            {/* <div className="w-8 h-[2px] bg-slate-800 rounded-full" /> */}

            {/* Groups */}
            {groups.map(group => (
                <div key={group._id} className="relative group flex items-center justify-center">
                    {/* Active Indicator */}
                    {currentGroup?._id === group._id && (
                        <div className="absolute left-0 w-1 h-8 bg-[var(--color-text)] rounded-r-full" />
                    )}

                    {/* Hover Indicator */}
                    <div className="absolute left-0 w-1 h-2 bg-theme-background rounded-r-full scale-0 group-hover:scale-100 transition-all duration-200 origin-left opacity-50" />

                    <div
                        onClick={() => selectGroup(group)}
                        className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 
                        flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-theme-primary text-white overflow-hidden
                        ${currentGroup?._id === group._id ? 'rounded-[16px] bg-theme-primary' : ''}`}
                        title={group.name}
                    >
                        {group.icon ? (
                            <img src={group.icon} alt={group.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-sm">{group.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                </div>
            ))}

            {/* Add Group */}
            <div
                onClick={onCreateGroup}
                className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-green-600 text-green-500 hover:text-white"
                title="Create a Server"
            >
                <Plus size={24} />
            </div>

            {/* Join Group */}
            <div
                onClick={onJoinGroup}
                className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-blue-600 text-blue-500 hover:text-white"
                title="Join a Server"
            >
                <Compass size={24} />
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Settings Button */}
            <div
                onClick={() => setIsSettingsOpen(true)}
                className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-theme-primary text-slate-400 hover:text-white"
                title="Settings"
            >
                <SettingsIcon size={24} />
            </div>

            {/* Settings Modal */}
            <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        </div>
    );
};

export default GroupSidebar;

