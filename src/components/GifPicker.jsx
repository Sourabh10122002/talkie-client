import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

const GifPicker = ({ onGifSelect, onClose, theme = 'dark' }) => {
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const apiKey = import.meta.env.VITE_GIPHY_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            console.error('Giphy API key is missing');
            return;
        }
        fetchGifs();
    }, [search, offset]);

    const fetchGifs = async () => {
        setLoading(true);
        try {
            const endpoint = search ? 'search' : 'trending';
            const query = search ? `&q=${search}` : '';
            const response = await fetch(
                `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${apiKey}${query}&limit=20&offset=${offset}&rating=g`
            );
            const data = await response.json();

            if (offset === 0) {
                setGifs(data.data);
            } else {
                setGifs(prev => [...prev, ...data.data]);
            }
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && !loading) {
            setOffset(prev => prev + 20);
        }
    };

    return (
        <div className="w-[350px] h-[450px] bg-theme-surface border border-theme-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-theme-border flex items-center gap-2 shrink-0 bg-theme-surface z-10">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search GIFs..."
                        className="w-full bg-theme-background text-theme-text px-3 py-2 pl-9 rounded-lg text-sm outline-none focus:ring-1 focus:ring-theme-primary transition-all"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setOffset(0);
                            setGifs([]);
                        }}
                        autoFocus
                    />
                    <Search size={16} className="absolute left-3 top-2.5 text-theme-secondary" />
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-theme-background rounded-full text-theme-secondary hover:text-theme-text transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Masonry Grid */}
            <div
                className="flex-1 overflow-y-auto p-2"
                onScroll={handleScroll}
            >
                <div className="columns-2 gap-2 space-y-2">
                    {gifs.map((gif) => (
                        <button
                            key={gif.id}
                            onClick={() => onGifSelect(gif.images.original.url)}
                            className="relative w-full rounded-lg overflow-hidden hover:ring-2 hover:ring-theme-primary transition-all group mb-2 break-inside-avoid"
                        >
                            <img
                                src={gif.images.fixed_width.url}
                                alt={gif.title}
                                className="w-full h-auto object-cover block"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="w-full flex justify-center py-4">
                        <Loader2 className="animate-spin text-theme-primary" />
                    </div>
                )}

                {!loading && gifs.length === 0 && (
                    <div className="text-center text-theme-secondary py-10">
                        {apiKey ? 'No GIFs found' : 'Giphy API key missing'}
                    </div>
                )}
            </div>

            {/* Simple Footer Attribution */}
            <div className="p-1 bg-theme-background border-t border-theme-border flex justify-center shrink-0">
                <span className="text-[10px] text-theme-secondary font-medium tracking-wide opacity-70">POWERED BY GIPHY</span>
            </div>
        </div>
    );
};

export default GifPicker;
