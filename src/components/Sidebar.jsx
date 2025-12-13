
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '../context/ChatContext';
import {
    Hash, Plus, LogOut, MessageSquare,
    UserPlus, Lock, Users, Settings, X, MoreVertical, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Sidebar = ({ isOpen, onClose }) => {

    const {
        channels,
        currentChannel,
        setCurrentChannel,
        createChannel,
        joinChannel,
        leaveChannel,
        updateChannel,
        deleteChannel,
        currentGroup,
        addChannelMember,
        removeChannelMember,
        deleteGroup,
        groupMembers
    } = useChat();

    const [isCreating, setIsCreating] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [hoveredChannelId, setHoveredChannelId] = useState(null);

    const [contextMenu, setContextMenu] = useState({
        isOpen: false, x: 0, y: 0, channelId: null
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [channelToEdit, setChannelToEdit] = useState(null);
    const [channelToDelete, setChannelToDelete] = useState(null);

    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    // For adding members in edit mode
    const [userToAdd, setUserToAdd] = useState('');

    const contextMenuRef = useRef(null);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Helper for safe ID comparison
    const idsAreEqual = (id1, id2) => {
        if (!id1 || !id2) return false;
        const s1 = typeof id1 === 'object' ? id1._id || id1 : id1;
        const s2 = typeof id2 === 'object' ? id2._id || id2 : id2;
        return s1.toString() === s2.toString();
    };

    const isAdmin = currentGroup && currentUser && (
        idsAreEqual(currentGroup.owner, currentUser.id) ||
        currentGroup.admins?.some(adminId => idsAreEqual(adminId, currentUser.id))
    );



    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu({ isOpen: false, x: 0, y: 0, channelId: null });
            }
        };

        if (contextMenu.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu.isOpen]);

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        if (!newChannelName.trim()) return;
        try {
            const newChannel = await createChannel(
                newChannelName,
                '',
                isPrivate ? 'private' : 'public',
                selectedMembers
            );

            setCurrentChannel(newChannel);
            setIsCreating(false);
            setNewChannelName('');
            setIsPrivate(false);
            setSelectedMembers([]);

            // Close sidebar on mobile after selection
            if (window.innerWidth < 1024) {
                onClose && onClose();
            }

        } catch (error) {
            alert('Failed to create channel');
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleJoin = async (e, channelId) => {
        e.stopPropagation();
        await joinChannel(channelId);
    };

    const handleGearClick = (e, channel) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setContextMenu({
            isOpen: true,
            x: rect.left,
            y: rect.bottom + 5,
            channelId: channel._id
        });
    };

    const handleEditChannel = () => {
        const channel = channels.find(c => c._id === contextMenu.channelId);
        setChannelToEdit(channel);
        setEditName(channel.name);
        setEditDescription(channel.description || '');
        setIsEditModalOpen(true);
        setContextMenu({ isOpen: false, x: 0, y: 0, channelId: null });
    };

    const handleDeleteChannel = () => {
        setChannelToDelete(contextMenu.channelId);
        setIsDeleteModalOpen(true);
        setContextMenu({ isOpen: false, x: 0, y: 0, channelId: null });
    };

    const handleSaveEdit = async () => {
        try {
            await updateChannel(channelToEdit._id, editName, editDescription);
            setIsEditModalOpen(false);
            setChannelToEdit(null);
        } catch (error) {
            alert('Failed to update channel. Please try again.');
            console.error('Error updating channel:', error);
        }
    };

    const handleConfirmDelete = async () => {
        await deleteChannel(channelToDelete);
        setIsDeleteModalOpen(false);
        setChannelToDelete(null);
    };

    const handleChannelSelect = (channel) => {
        setCurrentChannel(channel);
        // Close sidebar on mobile when channel is selected
        if (window.innerWidth < 1024) {
            onClose && onClose();
        }
    };

    return (
        <div className={`
            fixed inset-y-0 left-0 z-30 w-4/5 max-w-xs bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:w-64
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>

            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between relative">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-violet-600 p-2 rounded-lg shadow-lg shadow-violet-500/20 flex-shrink-0">
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight truncate">
                        {currentGroup ? currentGroup.name : 'Select Server'}
                    </span>
                </div>

                {/* Header Menu (3 dots) - Admin Only */}
                {isAdmin && (
                    <button
                        onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                    >
                        <MoreVertical size={20} />
                    </button>
                )}

                {/* Header Menu Dropdown */}
                {isHeaderMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsHeaderMenuOpen(false)}
                        ></div>
                        <div className="absolute top-16 right-4 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                            <button
                                onClick={() => {
                                    setIsInviteModalOpen(true);
                                    setIsHeaderMenuOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center"
                            >
                                <UserPlus size={14} className="mr-2" />
                                Invite People
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this group? This cannot be undone.')) {
                                        deleteGroup(currentGroup._id);
                                        setIsHeaderMenuOpen(false);
                                    }
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center"
                            >
                                <Trash2 size={14} className="mr-2" />
                                Delete Server
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto py-4">
                {currentGroup ? (
                    <>
                        <div className="px-4 mb-2 flex justify-between items-center text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Channels</span>

                            {/* Create button - Only for admins */}
                            {isAdmin && (
                                <button
                                    onClick={() => setIsCreating(!isCreating)}
                                    className="hover:text-violet-400 transition-colors p-1 rounded hover:bg-slate-800"
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>

                        {/* Create Modal */}
                        {isCreating && (
                            <div className="px-4 mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700 mx-2">
                                <form onSubmit={handleCreateChannel} className="space-y-3">
                                    <input
                                        type="text"
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        placeholder="Channel name"
                                        className="w-full bg-slate-900 text-slate-200 text-sm rounded-md px-3 py-2 outline-none border border-slate-700 focus:border-violet-500 transition-all"
                                    />

                                    {/* Private / Public */}
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(!isPrivate)}
                                        className={`flex items-center text-xs px-2 py-1 rounded transition-colors 
                                            ${isPrivate ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                                    >
                                        {isPrivate ? <Lock size={12} className="mr-1" /> : <Hash size={12} className="mr-1" />}
                                        {isPrivate ? 'Private' : 'Public'}
                                    </button>

                                    {/* Member list */}
                                    {isPrivate && (
                                        <div className="max-h-32 overflow-y-auto space-y-1 border border-slate-700 rounded p-1 bg-slate-900">
                                            {groupMembers.map(user => {
                                                if (!user || !user._id || user._id === currentUser.id) return null;
                                                return (
                                                    <div
                                                        key={user._id}
                                                        onClick={() => toggleMember(user._id)}
                                                        className={`flex items-center px-2 py-1 rounded cursor-pointer text-xs 
                                                            ${selectedMembers.includes(user._id)
                                                                ? 'bg-violet-900/50 text-violet-200'
                                                                : 'hover:bg-slate-800 text-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full mr-2 border 
                                                            ${selectedMembers.includes(user._id)
                                                                ? 'bg-violet-500 border-violet-500'
                                                                : 'border-slate-500'
                                                            }`}
                                                        ></div>
                                                        {user.username}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-2">
                                        <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-slate-400 hover:text-white">
                                            Cancel
                                        </button>
                                        <button type="submit" className="text-xs bg-violet-600 text-white px-3 py-1 rounded">
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Channel list */}
                        <div className="space-y-1 px-2">
                            {channels.map(channel => {
                                if (!channel || !channel._id) return null;

                                const isMember = channel.members?.some(
                                    m => m?._id === currentUser?.id || m === currentUser?.id
                                );

                                const isPrivateChannel = channel.type === 'private';

                                return (
                                    <div
                                        key={channel._id}
                                        className="group relative"
                                        onMouseEnter={() => setHoveredChannelId(channel._id)}
                                        onMouseLeave={() => setHoveredChannelId(null)}
                                    >
                                        <div
                                            onClick={() => handleChannelSelect(channel)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md 
                                                text-sm font-medium transition-all duration-200 
                                                ${currentChannel?._id === channel._id
                                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/10'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                                }`}
                                        >
                                            <div className="flex items-center truncate">
                                                {isPrivateChannel ? (
                                                    <Lock size={14} className="mr-3 text-slate-500 group-hover:text-slate-400" />
                                                ) : (
                                                    <Hash size={18} className="mr-3 text-slate-500 group-hover:text-slate-400" />
                                                )}
                                                <span>{channel.name}</span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                {isMember && (
                                                    <>
                                                        {isPrivateChannel && <Users size={12} className="opacity-50 mr-1" />}
                                                        <span className="text-[10px] opacity-60">
                                                            {channel.members.length}
                                                        </span>
                                                    </>
                                                )}

                                                {isAdmin && hoveredChannelId === channel._id && (
                                                    <span
                                                        onClick={(e) => handleGearClick(e, channel)}
                                                        className="p-1 hover:bg-slate-700 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                        title="Channel Settings"
                                                    >
                                                        <Settings size={14} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="px-4 text-center text-slate-500 mt-10">
                        <p>Select a server to view channels</p>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu.isOpen && (
                <div
                    ref={contextMenuRef}
                    className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 min-w-[180px]"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                >
                    {isAdmin && (
                        <button
                            onClick={handleEditChannel}
                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center"
                        >
                            <Settings size={14} className="mr-2" />
                            Edit Channel
                        </button>
                    )}

                    {/* Only show delete option if user is admin */}
                    {isAdmin && (
                        <button
                            onClick={handleDeleteChannel}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center"
                        >
                            <X size={14} className="mr-2" />
                            Delete Channel
                        </button>
                    )}
                </div>
            )}

            {/* Edit Channel Modal */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">Edit Channel</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Channel Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-slate-900 text-slate-200 rounded-lg px-3 py-2 outline-none border border-slate-700 focus:border-violet-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full bg-slate-900 text-slate-200 rounded-lg px-3 py-2 outline-none border border-slate-700 focus:border-violet-500 transition-all resize-none"
                                    rows="3"
                                />
                            </div>

                            {/* Member Management for Private Channels */}
                            {channelToEdit?.type === 'private' && (
                                <div className="pt-4 border-t border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center">
                                        <Lock size={14} className="mr-2" />
                                        Members
                                    </h3>

                                    {/* Add Member */}
                                    <div className="flex space-x-2 mb-3">
                                        <select
                                            value={userToAdd}
                                            onChange={(e) => setUserToAdd(e.target.value)}
                                            className="flex-1 bg-slate-900 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none border border-slate-700"
                                        >
                                            <option value="">Select user to add...</option>
                                            {groupMembers
                                                .filter(u => !channelToEdit.members.some(m => (m._id || m) === u._id) && u._id !== currentUser.id)
                                                .map(user => (
                                                    <option key={user._id} value={user._id}>{user.username}</option>
                                                ))
                                            }
                                        </select>
                                        <button
                                            disabled={!userToAdd}
                                            onClick={async () => {
                                                if (!userToAdd) return;
                                                await addChannelMember(channelToEdit._id, userToAdd);
                                                setChannelToEdit(prev => ({
                                                    ...prev,
                                                    members: [...prev.members, groupMembers.find(u => u._id === userToAdd)]
                                                }));
                                                setUserToAdd('');
                                            }}
                                            className="bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded-lg text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Member List */}
                                    <div className="space-y-1 max-h-40 overflow-y-auto bg-slate-900/50 rounded-lg p-2">
                                        {channelToEdit.members?.map(member => {
                                            const memberId = member._id || member; // Populate vs ID
                                            const memberName = member.username || groupMembers.find(u => u._id === memberId)?.username || 'Unknown User';
                                            const isOwner = currentGroup.owner === memberId;

                                            // Ensure member is an object for display if possible, or fallback
                                            if (memberId === currentUser.id) return null; // Don't show self or maybe show but disable remove

                                            return (
                                                <div key={memberId} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded group">
                                                    <span className="text-sm text-slate-300">{memberName} {isOwner && '👑'}</span>
                                                    {!isOwner && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(`Remove ${memberName} from this channel ? `)) {
                                                                    await removeChannelMember(channelToEdit._id, memberId);
                                                                    setChannelToEdit(prev => ({
                                                                        ...prev,
                                                                        members: prev.members.filter(m => (m._id || m) !== memberId)
                                                                    }));
                                                                }
                                                            }}
                                                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {channelToEdit.members?.length <= 1 && (
                                            <p className="text-xs text-slate-500 text-center py-2">No other members</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Channel Modal */}
            {isDeleteModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-red-900/30">
                        <h2 className="text-xl font-bold text-red-400 mb-2">Delete this channel permanently?</h2>
                        <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && currentGroup && createPortal(
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" onClick={() => setIsInviteModalOpen(false)}>
                    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">Invite Friends</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Share this code with your friends to join <strong>{currentGroup.name}</strong>.
                        </p>
                        <div className="bg-black/40 p-3 rounded-lg flex items-center justify-between border border-slate-700">
                            <code className="text-xl font-mono text-violet-400 tracking-wider">
                                {currentGroup.inviteCode}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(currentGroup.inviteCode);
                                    alert('Copied to clipboard!');
                                }}
                                className="text-slate-400 hover:text-white text-xs bg-slate-700 px-2 py-1 rounded"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm"
                >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                </button>
            </div>

        </div>
    );

};

export default Sidebar;
