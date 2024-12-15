declare global {
    interface Window {
        ENV: {
            PUBLIC_API_BASE_URL: string;
        };
    }
}

export {};
