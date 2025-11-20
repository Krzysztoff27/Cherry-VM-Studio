import { useEffect, useState } from "react";
import useApiWebSocket from "./useApiWebSocket.ts";
import { MachineState, WebSocketResponse } from "../types/api.types";

const useMachineState = (uuids: string[] | string) => {
    const { lastJsonMessage, sendCommand } = useApiWebSocket("/ws/vm");
    const [machinesState, setMachinesState] = useState<Record<string, MachineState>>({});
    let dataMsg = <WebSocketResponse>lastJsonMessage;

    useEffect(() => {
        sendCommand("SUBSCRIBE", { target: [uuids].flat() });

        // set timeout as the state cooldown,
        // if 2 pass without receiving data (otherwise the entire component would reload),
        // change dataMsg to message with empty body
        setTimeout(() => (dataMsg = { method: "DATA", uuid: null, body: {} }), 2000);
    }, [JSON.stringify(uuids)]);

    useEffect(() => {
        if (dataMsg?.method === "DATA") setMachinesState(dataMsg?.body as Record<string, MachineState>);
    }, [dataMsg]);

    return { machinesState, setMachinesState };
};

export default useMachineState;
