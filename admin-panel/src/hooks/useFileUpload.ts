import { useState } from "react";
import { UploadStatus } from "../types/hooks.types";
import { isNull } from "lodash";
import axios from "axios";
import useAuth from "./useAuth";

const useFileUpload = () => {
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [progress, setProgress] = useState(0);
    const { tokens } = useAuth();

    const uploadFile = async (file: File | null, data: { [key: string]: any } = {}) => {
        if (isNull(file)) return;

        setStatus("uploading");

        const formData = new FormData();
        Object.entries(([key, value]) => formData.set(key, value));
        formData.append("file", file);

        try {
            await axios.post("https://file.io", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const uploadProgress = progressEvent.total ? Math.round((progressEvent.loaded / progressEvent.total) * 100) : 0;
                    setProgress(uploadProgress);
                },
            });

            setStatus("success");
            setProgress(100);
        } catch {
            setStatus("error");
            setProgress(0);
        }
    };

    return {
        status,
        progress,
        uploadFile,
    };
};

export default useFileUpload;
