import { useEffect, useState } from "react";
import useApiWebSocket from "./useApiWebSocket.ts";
import { WebSocketResponse } from "../types/api.types";

const useMachineState = (uuids: string[] | string) => {
    const { lastJsonMessage, sendCommand } = useApiWebSocket("/ws/vm");
    const [machinesState, setMachinesState] = useState({});
    let dataMsg = <WebSocketResponse>lastJsonMessage;

    useEffect(() => {
        // subscribe to every machine
        [uuids].flat().forEach(uuid => sendCommand("SUBSCRIBE", { target: uuid }));
        // set timeout as the state cooldown,
        // if 2 pass without receiving data (otherwise the entire component would reload),
        // change dataMsg to message with empty body
        setTimeout(() => (dataMsg = { method: "DATA", uuid: null, body: {} }), 2000);
    }, [JSON.stringify(uuids)]);

    useEffect(() => {
        if (dataMsg?.method === "DATA") setMachinesState(dataMsg?.body);
    }, [dataMsg]);

    return { machinesState };
};

export default useMachineState;
