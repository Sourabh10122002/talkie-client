import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useChat } from '../context/ChatContext';
import { Menu } from 'lucide-react';
import GroupSidebar from './GroupSidebar';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import UserList from './UserList';

const ChatLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
    const [isJoinGroupOpen, setJoinGroupOpen] = useState(false);
    const { currentChannel } = useChat();

    // Mobile sidebar toggle
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (

        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">

            {/* Group Sidebar (Leftmost) */}
            <GroupSidebar
                onCreateGroup={() => setCreateGroupOpen(true)}
                onJoinGroup={() => setJoinGroupOpen(true)}
            />

            {/* Main Content Area Wrapper */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Mobile Menu Button */}
                <div className="absolute top-4 left-4 z-50 lg:hidden">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 bg-slate-800 rounded-md text-slate-300 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Sidebar (Channels) */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
                    {currentChannel ? (
                        <ChatArea />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-900">
                            <div className="text-center">
                                <p className="text-xl font-bold mb-2">Welcome to Chat App</p>
                                <p>Select a server and a channel to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar (User List) */}
                <UserList />

            </div>

            {/* Modals */}
            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
            />
            <JoinGroupModal
                isOpen={isJoinGroupOpen}
                onClose={() => setJoinGroupOpen(false)}
            />

        </div>
    );
};

export default ChatLayout;
