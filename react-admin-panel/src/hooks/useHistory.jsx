import { useState } from "react";

export const useHistory = (latest, limit = 256) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if(!latest) return;

        setHistory(prev => [...prev, latest].slice(-limit));
    }, [latest]);

    return {
        history
    }
};

export default useHistory;