import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { createGroup } = useChat();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGroup(name, description);
            onClose();
            setName('');
            setDescription('');
        } catch (error) {
            console.error(error);
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

                <h2 className="text-2xl font-bold text-center text-theme mb-2">Create Your Server</h2>
                <p className="text-center text-theme-secondary mb-6 text-sm">
                    Your server is where you and your friends hang out. Make yours and start talking.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-theme-secondary uppercase mb-1">Server Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-theme-surface-light text-theme rounded p-2 border border-theme focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="My Awesome Server"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-theme-secondary uppercase mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-theme-surface-light text-theme rounded p-2 border border-theme focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="A place for..."
                        />
                    </div>

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
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
