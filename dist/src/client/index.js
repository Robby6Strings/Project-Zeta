import "./styles/page.css";
import "./styles/index.css";
import "./styles/button.css";
import "./styles/avatar.css";
import "./styles/card.css";
import "./styles/utilities.css";
import "./styles/form.css";
import "./styles/badge.css";
import { Hydration } from "cinnabun/hydration";
import { Document } from "../Document";
import { App } from "../App";
import { Cinnabun } from "cinnabun";
import { createLiveSocket } from "./liveSocket";
const env = process.env.NODE_ENV ?? "development";
if ("__cbData" in window) {
    try {
        Cinnabun.registerRuntimeServices(createLiveSocket());
        Hydration.hydrate(Document(App), window.__cbData);
    }
    catch (error) {
        console.error(error);
    }
    if (env === "development") {
        const evtHandler = new EventSource("/sse");
        let didConnect = false;
        evtHandler.addEventListener("handshake", () => {
            didConnect = true;
        });
        evtHandler.addEventListener("error", (evt) => {
            const connIsReset = didConnect && evtHandler.readyState === 0;
            if (connIsReset)
                location.reload();
            console.log("evtHandler err evt", evt);
        });
    }
}