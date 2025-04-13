export const timePassedRounded = pastDate => {
    if (!pastDate) return [null, null];

    const thresholds = Object.entries({
        seconds: 60,
        minutes: 60,
        hours: 24,
    });

    const now = new Date();
    let diff = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

    for (const [unit, threshold] of thresholds) {
        if (diff < threshold) return [diff, unit];
        diff = Math.floor(diff / threshold);
    }

    return [diff, "days"];
};

export const timeSince = pastDate => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - pastDate) / 1000);

    const hours = String(Math.floor(diffInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((diffInSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(diffInSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
};
