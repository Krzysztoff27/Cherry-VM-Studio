type ByteUnit = "B" | "KiB" | "MiB" | "GiB" | "TiB" | "PiB" | "EiB";

export const getRelevantUnit = (bytes: number): ByteUnit => {
    const k = 1024;
    const units: ByteUnit[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return units[i] || "B";
};

export const formatBytesToUnit = (bytes: number, unit: ByteUnit, decimals = 2): string => {
    const units: ByteUnit[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
    const index = units.indexOf(unit);

    if (index === -1) throw new Error(`Invalid unit: ${unit}`);

    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(decimals)} ${unit}`;
};

export const formatBytesToRelevantUnit = (bytes: number) => formatBytesToUnit(bytes, getRelevantUnit(bytes));
