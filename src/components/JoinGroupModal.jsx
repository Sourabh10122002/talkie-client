import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X } from 'lucide-react';

const JoinGroupModal = ({ isOpen, onClose }) => {
    const [inviteCode, setInviteCode] = useState('');
    const { joinGroup } = useChat();
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await joinGroup(inviteCode);
            onClose();
            setInviteCode('');
        } catch (err) {
            setError('Invalid invite code or already a member.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-theme-surface rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 border border-theme">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-theme-secondary hover:text-theme"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-center text-theme mb-2">Join a Server</h2>
                <p className="text-center text-theme-secondary mb-6 text-sm">
                    Enter an invite code to join an existing server.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-theme-secondary uppercase mb-1">Invite Code</label>
                        <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full bg-theme-surface-light text-theme rounded p-2 border border-theme focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="e.g. 5f4d3e..."
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                    <div className="pt-4 flex justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-theme-secondary hover:underline"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white rounded font-medium transition-colors"
                        >
                            Join Server
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinGroupModal;
