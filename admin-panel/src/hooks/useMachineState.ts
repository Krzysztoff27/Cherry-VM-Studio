import { useEffect, useState } from "react";
import useApiWebSocket from "./useApiWebSocket.ts";
import { MachineState, WebSocketResponse } from "../types/api.types";

export type MachineStateRetrievalModes = "subscribed" | "account" | "global";

const useMachineState = (mode: MachineStateRetrievalModes, target_uuids: string[] = undefined) => {
    const { lastJsonMessage, sendCommand } = useApiWebSocket(`/ws/machines/${mode}`);
    const [machinesState, setMachinesState] = useState<Record<string, MachineState>>({});
    let dataMsg = <WebSocketResponse>lastJsonMessage;

    useEffect(() => {
        if (mode === "subscribed") {
            sendCommand("SUBSCRIBE", { target: [target_uuids].flat() });

            // set timeout as the state cooldown,
            // if 2 pass without receiving data (otherwise the entire component would reload),
            // change dataMsg to message with empty body
            setTimeout(() => (dataMsg = { method: "DATA", uuid: null, body: {} }), 2000);
        }
    }, [JSON.stringify(target_uuids)]);

    useEffect(() => {
        if (dataMsg?.method === "DATA") setMachinesState(dataMsg?.body as Record<string, MachineState>);
    }, [dataMsg]);

    return { machinesState, setMachinesState };
};

export default useMachineState;
