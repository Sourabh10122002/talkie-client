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

        <div className="flex h-[100dvh] bg-theme-background text-theme overflow-hidden">

            {/* Group Sidebar (Leftmost) */}
            <GroupSidebar
                onCreateGroup={() => setCreateGroupOpen(true)}
                onJoinGroup={() => setJoinGroupOpen(true)}
            />

            {/* Main Content Area Wrapper */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Channels) */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-theme-surface">
                    {currentChannel ? (
                        <ChatArea onOpenSidebar={toggleSidebar} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-theme-secondary bg-theme-surface relative">
                            {/* Mobile Menu Button for Empty State */}
                            <div className="absolute top-4 left-4 lg:hidden">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                >
                                    <Menu size={20} />
                                </button>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold mb-2 text-theme-text">Welcome to Chat App</p>
                                <p className="text-theme-secondary">Select a server and a channel to start chatting</p>
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
