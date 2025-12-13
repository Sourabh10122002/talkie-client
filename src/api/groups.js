import api from './api';

export const createGroup = (data) => api.post('/groups', data);

export const getUserGroups = () => api.get('/groups');

export const joinGroup = (data) => api.post('/groups/join', data);

export const createGroupChannel = (groupId, data) => api.post(`/groups/${groupId}/channels`, data);

export const getGroupChannels = (groupId) => api.get(`/groups/${groupId}/channels`);

export const getGroupMembers = (groupId) => api.get(`/groups/${groupId}/members`);

export const promoteMember = (groupId, userId) => api.put(`/groups/${groupId}/admins`, { userId });

export const addChannelMember = (channelId, userId) => api.post(`/channels/${channelId}/members`, { userId });

export const removeChannelMember = (channelId, userId) => api.delete(`/channels/${channelId}/members/${userId}`);

export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`);
