import { useEffect, useState, useRef } from "react";
import useApiWebSocket from "./useApiWebSocket.ts";
import { WebSocketResponse } from "../types/api.types";

const useMachineState = (uuids: string[] | string) => {
    const { lastJsonMessage, sendCommand } = useApiWebSocket("/ws/vm");
    const [machinesState, setMachinesState] = useState({});
    const prevUuidsRef = useRef<string[]>([]);
    let dataMsg = <WebSocketResponse>lastJsonMessage;

    useEffect(() => {
        const flatUuids = [uuids].flat();

        // Unsubscribe from previous UUIDs
        prevUuidsRef.current.forEach(uuid => sendCommand("UNSUBSCRIBE", { target: uuid }));

        // Subscribe to new UUIDs
        flatUuids.forEach(uuid => sendCommand("SUBSCRIBE", { target: uuid }));

        // Update ref for next effect run
        prevUuidsRef.current = flatUuids;

        // Cleanup on unmount — unsubscribe from current uuids
        return () => {
            flatUuids.forEach(uuid => sendCommand("UNSUBSCRIBE", { target: uuid }));
        };
    }, [JSON.stringify(uuids)]);

    useEffect(() => {
        if (dataMsg?.method === "DATA") setMachinesState(dataMsg?.body);
    }, [dataMsg]);

    return { machinesState };
};

export default useMachineState;
