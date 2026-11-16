export interface VideoProviderDef {
    name: string
    match: RegExp
    transform: (match: RegExpMatchArray) => string
}

const PROVIDERS: VideoProviderDef[] = [
    {
        name: 'youtube',
        match: /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        transform: (m) => `https://www.youtube.com/embed/${m[1]}`,
    },
    {
        name: 'vimeo',
        match: /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/,
        transform: (m) => `https://player.vimeo.com/video/${m[1]}`,
    },
    {
        name: 'dailymotion',
        match: /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/,
        transform: (m) => `https://www.dailymotion.com/embed/video/${m[1]}`,
    },
    {
        name: 'twitch',
        match: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/(?:videos\/(\d+)|([a-zA-Z0-9_]+))/,
        transform: (m) => {
            const host = window.location.hostname;
            if (m[1]) return `https://player.twitch.tv/?video=v${m[1]}&parent=${host}`;
            return `https://player.twitch.tv/?channel=${m[2]}&parent=${host}`;
        },
    },
    {
        name: 'facebook',
        match: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:[^/]+\/videos\/\d+|plugins\/video\.php)/,
        transform: (m) => {
            const url = m[0].startsWith('http') ? m[0] : `https://${m[0]}`;
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734`;
        },
    },
    {
        name: 'spotify',
        match: /(?:https?:\/\/)?open\.spotify\.com\/(track|episode|playlist|album)\/([a-zA-Z0-9]+)/,
        transform: (m) => `https://open.spotify.com/embed/${m[1]}/${m[2]}`,
    },
    {
        name: 'tiktok',
        match: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
        transform: (m) => `https://www.tiktok.com/embed/v2/${m[1]}`,
    },
];

export function getProviders(): VideoProviderDef[] {
    return PROVIDERS;
}

export function addProvider(name: string, match: RegExp, transform: (match: RegExpMatchArray) => string): void {
    PROVIDERS.push({ name, match, transform });
}

export function transformVideoUrl(url: string): string {
    const clean = url.trim();
    for (const provider of PROVIDERS) {
        const m = clean.match(provider.match);
        if (m) return provider.transform(m);
    }
    return clean;
}
