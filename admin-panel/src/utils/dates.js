export const timePassedRounded = (pastDate) => {
    if(!pastDate) return [null, null];

    const thresholds = Object.entries({
        'seconds': 60,
        'minutes': 60,
        'hours': 24,
    });
    
    const now = new Date();
    let diff = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

    for(const [unit, threshold] of thresholds) {
        if(diff < threshold) return [diff, unit];
        diff = Math.floor(diff / threshold);
    }

    return [diff, 'days'];
}