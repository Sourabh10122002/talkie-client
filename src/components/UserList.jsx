import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Users, Shield, Award } from 'lucide-react';
import api from '../api/api';

const UserList = () => {
    const { onlineUsers, currentGroup, promoteMember, groupMembers, currentChannel } = useChat();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [contextMenu, setContextMenu] = useState({
        isOpen: false, x: 0, y: 0, userId: null
    });
    const contextMenuRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isCurrentUserAdmin = currentGroup && (
        currentGroup.owner === currentUser?.id ||
        currentGroup.admins?.includes(currentUser?.id)
    );

    useEffect(() => {
        if (currentChannel && currentChannel.type === 'private') {
            // Filter by channel members if private
            // Include Group Owner and Admins explicitly as they have implicit access
            const channelMemberIds = currentChannel.members.map(m => (m._id || m).toString());

            setFilteredUsers(groupMembers.filter(u => {
                const uId = u._id.toString();
                const isOwner = currentGroup.owner === uId;
                const isAdmin = currentGroup.admins?.includes(uId);
                const isMember = channelMemberIds.includes(uId);

                return isMember || isOwner || isAdmin;
            }));
        } else {
            // Show all group members for public channels (or if no channel selected)
            setFilteredUsers(groupMembers);
        }
    }, [groupMembers, currentChannel]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu({ isOpen: false, x: 0, y: 0, userId: null });
            }
        };

        if (contextMenu.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu.isOpen]);

    const handleContextMenu = (e, userId) => {
        if (!isCurrentUserAdmin) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            userId
        });
    };

    const handlePromote = async () => {
        try {
            await promoteMember(currentGroup._id, contextMenu.userId);
            setContextMenu({ isOpen: false, x: 0, y: 0, userId: null });
            // Ideally force a refresh of group data here or optimistic update,
            // relying on context refresh or parent reload for now if context doesn't auto-update lists deeply
            alert('User promoted to Admin');
        } catch (error) {
            alert('Failed to promote user');
        }
    };

    const isUserOnline = (userId) => {
        // console.log('Checking online status for:', userId, typeof userId);
        // console.log('Online users:', onlineUsers);
        return onlineUsers.some(user => {
            // Check for both _id and id properties and string comparison
            const onlineId = user._id || user.id;
            return onlineId === userId || onlineId?.toString() === userId?.toString();
        });
    };



    return (
        <div className="w-64 bg-theme-surface border-l border-theme hidden lg:flex flex-col shadow-xl z-10">
            <div className="h-16 px-4 border-b border-theme font-bold text-theme flex items-center justify-between">
                <div className="flex items-center">
                    <Users size={18} className="mr-2 text-theme-background" />
                    <span>Users</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                        {filteredUsers.filter(u => isUserOnline(u._id)).length}
                    </span>
                    <span className="text-slate-500 text-xs">/</span>
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">{filteredUsers.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {filteredUsers.sort((a, b) => {
                    const aOnline = isUserOnline(a._id);
                    const bOnline = isUserOnline(b._id);
                    if (aOnline && !bOnline) return -1;
                    if (!aOnline && bOnline) return 1;
                    return 0;
                }).map((user) => {
                    const online = isUserOnline(user._id);
                    const isAdmin = currentGroup?.owner === user._id || currentGroup?.admins?.includes(user._id);

                    return (
                        <div
                            key={user._id}
                            onContextMenu={(e) => handleContextMenu(e, user._id)}
                            className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group relative"
                        >
                            <div className="relative mr-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white border border-slate-500
                                    ${isAdmin ? 'from-amber-600 to-amber-500' : 'from-slate-700 to-slate-600'}
                                `}>
                                    {user.username?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${online ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium truncate transition-colors ${isAdmin ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'}`}>
                                        {user.username}
                                    </p>
                                    {isAdmin && <Shield size={12} className="text-amber-500 ml-1" />}
                                </div>
                                <p className={`text-xs truncate ${online ? 'text-green-400' : 'text-slate-500'}`}>
                                    {online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* Context Menu */}
                {contextMenu.isOpen && (
                    <div
                        ref={contextMenuRef}
                        className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 min-w-[150px]"
                        style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    >
                        {(() => {
                            const targetUserIsAdmin = currentGroup?.owner === contextMenu.userId || currentGroup?.admins?.includes(contextMenu.userId);
                            if (targetUserIsAdmin) {
                                return <div className="px-4 py-2 text-sm text-slate-500 italic">Already Admin</div>
                            }
                            return (
                                <button
                                    onClick={handlePromote}
                                    className="w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-slate-700 flex items-center"
                                >
                                    <Award size={14} className="mr-2" />
                                    Make Admin
                                </button>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
