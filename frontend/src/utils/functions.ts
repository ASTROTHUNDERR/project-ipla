export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export function formatReadableDate(passedDate: string, monthLength: "numeric" | "2-digit" | "long" | "short" | "narrow"): string {
    const date = new Date(passedDate);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: monthLength, day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};