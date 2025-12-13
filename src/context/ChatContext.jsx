import { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import api from '../api/api';
import * as groupService from '../api/groups';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Group State
    const [groups, setGroups] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);

    const [typingUsers, setTypingUsers] = useState({});

    // Initialize Socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                console.error('Socket error details:', err.message);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, []);

    // Fetch Groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await groupService.getUserGroups();
                setGroups(response.data);
                if (response.data.length > 0) {
                    // Automatically select first group for now
                    // Or implement "Home" logic
                    selectGroup(response.data[0]);
                } else {
                    setLoading(false); // No groups, stop loading
                }
            } catch (error) {
                console.error("Error fetching groups", error);
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const selectGroup = (group) => {
        if (!group) return; // Handle deselect/home view later
        setCurrentGroup(group);
        setCurrentChannel(null); // Reset channel when switching groups

        // Fetch channels for the selected group
        fetchChannels(group._id);
        // Fetch members for the selected group
        fetchGroupMembers(group._id);
    };

    const fetchGroupMembers = async (groupId) => {
        try {
            const response = await groupService.getGroupMembers(groupId);
            setGroupMembers(response.data);
        } catch (error) {
            console.error("Error fetching group members", error);
        }
    };

    const fetchChannels = async (groupId) => {
        try {
            const response = await groupService.getGroupChannels(groupId);
            setChannels(response.data);
            // Optionally auto-select 'general'
            const general = response.data.find(c => c.name === 'general');
            if (general) setCurrentChannel(general);
        } catch (error) {
            console.error("Error fetching channels", error);
        } finally {
            setLoading(false);
        }
    };

    // Listen for messages and online users
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            if (currentChannel && message.channel === currentChannel._id) {
                setMessages((prev) => {
                    // Prevent duplicates by checking if message already exists
                    if (prev.some(m => m._id === message._id)) {
                        return prev;
                    }
                    return [...prev, message];
                });

                // Auto-mark as delivered when receiving a message
                if (message.sender._id !== JSON.parse(localStorage.getItem('user')).id) {
                    socket.emit('message_delivered', { messageId: message._id, channelId: currentChannel._id });
                }
            }
        });

        socket.on('message_updated', (updatedMessage) => {
            setMessages((prev) => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
        });

        socket.on('message_deleted', (messageId) => {
            setMessages((prev) => prev.filter(msg => msg._id !== messageId));
        });

        socket.on('status_updated', (updatedMessage) => {
            setMessages((prev) => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
        });

        socket.on('typing', ({ userId, username, channelId }) => {
            if (currentChannel && channelId === currentChannel._id) {
                setTypingUsers(prev => ({ ...prev, [userId]: username }));
            }
        });

        socket.on('stop_typing', ({ userId, channelId }) => {
            if (currentChannel && channelId === currentChannel._id) {
                setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[userId];
                    return newState;
                });
            }
        });

        socket.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        socket.on('added_to_channel', (channel) => {
            // Add the new channel to the list if it belongs to current group
            // Ideally we should check if we are in the group, but usually we are.
            // We can also verify if channel.group (populated or ID) matches currentGroup._id
            // But relying on backend emission to correct user is safe enough.
            if (currentGroup && (channel.group === currentGroup._id || channel.group?._id === currentGroup._id)) {
                setChannels(prev => [...prev, channel]);
            } else if (!currentGroup) {
                // If no group is selected, we might want to refresh groups or do nothing
                // For now, do nothing till user selects group
            }
        });

        socket.on('removed_from_channel', ({ channelId, groupId }) => {
            // Check if we are in the group contexts
            if (currentGroup && currentGroup._id === groupId) {
                setChannels(prev => prev.filter(c => c._id !== channelId));

                // If currently viewing this channel, redirect or clear
                if (currentChannel && currentChannel._id === channelId) {
                    setCurrentChannel(null);
                    alert('You have been removed from this channel.');
                }
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('message_updated');
            socket.off('message_deleted');
            socket.off('status_updated');
            socket.off('typing');
            socket.off('stop_typing');
            socket.off('online_users');
            socket.off('added_to_channel');
            socket.off('removed_from_channel');
        };
    }, [socket, currentChannel]);

    // Join channel room and load initial messages
    useEffect(() => {
        if (socket && currentChannel) {
            socket.emit('join_channel', currentChannel._id);

            // Fetch ONLY recent messages (WhatsApp-style)
            const fetchMessages = async () => {
                try {
                    setPage(1);
                    setHasMore(true);
                    // Load only 30 recent messages initially
                    const response = await api.get(`/messages/${currentChannel._id}?page=1&limit=30`);
                    setMessages(response.data);
                    if (response.data.length < 30) setHasMore(false);
                } catch (error) {
                    console.error("Error fetching messages", error);
                }
            };
            fetchMessages();

            return () => {
                socket.emit('leave_channel', currentChannel._id);
            };
        }
    }, [currentChannel, socket]);

    const sendMessage = (content) => {
        if (socket && currentChannel) {
            socket.emit('send_message', {
                channelId: currentChannel._id,
                content
            });
        }
    };

    const sendTyping = (isTyping) => {
        if (socket && currentChannel) {
            socket.emit(isTyping ? 'typing' : 'stop_typing', currentChannel._id);
        }
    };

    const editMessage = async (messageId, content) => {
        try {
            await api.put(`/messages/${messageId}`, { content });
        } catch (error) {
            console.error("Error editing message", error);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await api.delete(`/messages/${messageId}`);
        } catch (error) {
            console.error("Error deleting message", error);
        }
    };

    const createGroup = async (name, description) => {
        try {
            const response = await groupService.createGroup({ name, description });
            setGroups([...groups, response.data]);
            selectGroup(response.data); // Switch to new group
            return response.data;
        } catch (error) {
            console.error("Error creating group", error);
            throw error;
        }
    };

    const joinGroup = async (inviteCode) => {
        try {
            const response = await groupService.joinGroup({ inviteCode });
            // Add if not exists
            if (!groups.find(g => g._id === response.data._id)) {
                setGroups([...groups, response.data]);
            }
            selectGroup(response.data);
            return response.data;
        } catch (error) {
            console.error("Error joining group", error);
            throw error;
        }
    };

    const promoteMember = async (groupId, userId) => {
        try {
            const response = await groupService.promoteMember(groupId, userId);
            // Update local group state if needed, e.g., to reflect new admin list immediately
            // For now, we might rely on re-fetching or just assuming success
            // Ideally we update the currentGroup admins list
            if (currentGroup && currentGroup._id === groupId) {
                setCurrentGroup(prev => ({
                    ...prev,
                    admins: [...prev.admins, userId]
                }));
            }
            return response.data;
        } catch (error) {
            console.error("Error promoting member", error);
            throw error;
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            await groupService.deleteGroup(groupId);
            setGroups(prev => prev.filter(g => g._id !== groupId));
            if (currentGroup && currentGroup._id === groupId) {
                setCurrentGroup(null);
                setChannels([]);
                setCurrentChannel(null);
            }
        } catch (error) {
            console.error("Error deleting group", error);
            throw error;
        }
    };

    const createChannel = async (name, description, type = 'public', members = []) => {
        if (!currentGroup) return;
        try {
            const response = await groupService.createGroupChannel(currentGroup._id, { name, description, type, members });
            setChannels([...channels, response.data]);
            return response.data;
        } catch (error) {
            console.error("Error creating channel", error);
            throw error;
        }
    }

    const joinChannel = async (channelId) => {
        // Technically "joining" via API is less relevant if group membership controls access
        // But we keep it if needed for direct member list tracking on channel model
        // However, the new backend logic primarily uses group membership.
        // We'll keep the API call if backend still supports it, or just UI update
        try {
            const response = await api.post(`/channels/${channelId}/join`);
            setChannels(prev => prev.map(c => c._id === channelId ? response.data : c));
            if (currentChannel && currentChannel._id === channelId) {
                setCurrentChannel(response.data);
            }
            return response.data;
        } catch (error) {
            console.error("Error joining channel", error);
            throw error;
        }
    };

    const leaveChannel = async (channelId) => {
        try {
            const response = await api.post(`/channels/${channelId}/leave`);

            const userId = JSON.parse(localStorage.getItem('user')).id;
            const isOwner = currentGroup.owner === userId;
            const isAdmin = currentGroup.admins?.includes(userId);

            // Hide channel if left (unless admin/owner)
            if (!isOwner && !isAdmin) {
                setChannels(prev => prev.filter(c => c._id !== channelId));
            } else {
                setChannels(prev => prev.map(c => c._id === channelId ? response.data : c));
            }

            if (currentChannel && currentChannel._id === channelId) {
                setCurrentChannel(null);
            }
            return response.data;
        } catch (error) {
            console.error("Error leaving channel", error);
            throw error;
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMore) return;
        try {
            const nextPage = page + 1;
            // Load 30 messages per page for consistency
            const response = await api.get(`/messages/${currentChannel._id}?page=${nextPage}&limit=30`);
            if (response.data.length > 0) {
                setMessages(prev => [...response.data, ...prev]);
                setPage(nextPage);
                if (response.data.length < 30) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more messages", error);
        }
    };

    const markMessagesAsDelivered = (messageIds) => {
        if (socket && currentChannel) {
            messageIds.forEach(messageId => {
                socket.emit('message_delivered', { messageId, channelId: currentChannel._id });
            });
        }
    };

    const markMessagesAsRead = async (messageIds) => {
        if (socket && currentChannel) {
            messageIds.forEach(messageId => {
                socket.emit('message_read', { messageId, channelId: currentChannel._id });
            });
        }
    };

    const updateChannel = async (channelId, name, description) => {
        try {
            const response = await api.put(`/channels/${channelId}`, { name, description });
            setChannels(prev => prev.map(c => c._id === channelId ? response.data : c));
            if (currentChannel && currentChannel._id === channelId) {
                setCurrentChannel(response.data);
            }
            return response.data;
        } catch (error) {
            console.error("Error updating channel", error);
            throw error;
        }
    };

    const deleteChannel = async (channelId) => {
        try {
            await api.delete(`/channels/${channelId}`);
            setChannels(prev => prev.filter(c => c._id !== channelId));
            if (currentChannel && currentChannel._id === channelId) {
                setCurrentChannel(null);
            }
        } catch (error) {
            throw error;
        }
    };

    const addChannelMember = async (channelId, userId) => {
        try {
            const response = await groupService.addChannelMember(channelId, userId);
            setChannels(prev => prev.map(c => c._id === channelId ? response.data : c));
            if (currentChannel && currentChannel._id === channelId) setCurrentChannel(response.data);
            return response.data;
        } catch (error) {
            console.error("Error adding channel member", error);
            throw error;
        }
    };

    const removeChannelMember = async (channelId, userId) => {
        try {
            const response = await groupService.removeChannelMember(channelId, userId);
            setChannels(prev => prev.map(c => c._id === channelId ? response.data : c));
            if (currentChannel && currentChannel._id === channelId) setCurrentChannel(response.data);
            return response.data;
        } catch (error) {
            console.error("Error removing channel member", error);
            throw error;
        }
    };

    // WebRTC State
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [name, setName] = useState('');
    const [isCallActive, setIsCallActive] = useState(false);
    const [callType, setCallType] = useState('video');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    // WebRTC Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('call_user', ({ from, name: callerName, signal, callType }) => {
            setCall({ isReceivingCall: true, from, name: callerName, signal, callType });
            setIsCallActive(true);
            setCallType(callType || 'video');
        });

        socket.on('call_accepted', (signal) => {
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        socket.on('end_call', () => {
            setCallEnded(true);
            setIsCallActive(false);
            leaveCall(false);
        });

        return () => {
            socket.off('call_user');
            socket.off('call_accepted');
            socket.off('end_call');
        }
    }, [socket]);

    const answerCall = async () => {
        setCallAccepted(true);

        try {
            const constraints = {
                video: call.callType === 'video',
                audio: true
            };

            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);

            console.log('✅ Media obtained for call receiver');
            console.log('Video tracks:', currentStream.getVideoTracks().length);
            console.log('Audio tracks:', currentStream.getAudioTracks().length);

            const peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: currentStream
            });

            peer.on('signal', (data) => {
                socket.emit('answer_call', { signal: data, to: call.from });
            });

            peer.on('stream', (remoteStream) => {
                console.log('✅ Remote stream received');
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });

            peer.signal(call.signal);
            connectionRef.current = peer;
        } catch (err) {
            console.error("Failed to get media:", err);
            alert("Cannot access camera/microphone. Please grant permissions and try again.");
        }
    };

    const callUser = async (id, type = 'video') => {
        setCallType(type);

        try {
            const constraints = {
                video: type === 'video',
                audio: true
            };

            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);

            console.log('✅ Media obtained for call initiator');
            console.log('Video tracks:', currentStream.getVideoTracks().length);
            console.log('Audio tracks:', currentStream.getAudioTracks().length);

            const peer = new SimplePeer({
                initiator: true,
                trickle: false,
                stream: currentStream
            });

            peer.on('signal', (data) => {
                socket.emit('call_user', {
                    userToCall: id,
                    signalData: data,
                    from: socket.id,
                    name: JSON.parse(localStorage.getItem('user')).username,
                    callType: type
                });
            });

            peer.on('stream', (remoteStream) => {
                console.log('✅ Remote stream received');
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });

            connectionRef.current = peer;
            setIsCallActive(true);
        } catch (err) {
            console.error("Failed to get media:", err);
            alert("Cannot access camera/microphone. Please grant permissions and try again.");
        }
    };

    const leaveCall = (emit = true) => {
        setCallEnded(true);
        setIsCallActive(false);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        if (emit && callAccepted && !callEnded) {
            socket.emit('end_call', { to: call.from });
        }

        if (callAccepted) {
            const typeText = callType === 'video' ? 'Video Call' : 'Voice Call';
            sendMessage(`${typeText} ended.`);
        }

        setCall({});
        setCallAccepted(false);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        window.location.reload();
    };

    const value = {
        socket,

        // Group State
        groups,
        currentGroup,
        selectGroup,
        createGroup,
        joinGroup,
        promoteMember,
        deleteGroup, // Add to context
        groupMembers,

        channels,
        currentChannel,
        setCurrentChannel,
        messages,
        sendMessage,
        createChannel,
        joinChannel,
        leaveChannel,
        loadMoreMessages,
        hasMore,
        typingUsers,
        sendTyping,
        editMessage,
        deleteMessage,
        updateChannel,
        deleteChannel,
        addChannelMember,
        removeChannelMember,
        onlineUsers,
        loading,
        markMessagesAsDelivered,
        markMessagesAsRead,
        // WebRTC
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        isCallActive,
        setIsCallActive,
        setStream,
        answerCall,
        callUser,
        leaveCall,
        callType
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

