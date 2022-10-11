import "./style.css";
import { Elm } from "./src/Main.elm";

if (process.env.NODE_ENV === "development") {
    const ElmDebugTransform = await import("elm-debug-transformer")

    ElmDebugTransform.register({
        simple_mode: true
    })
}

const root = document.querySelector("#app");
const app = Elm.Main.init({ node: root, flags: '<some value>' });

setTimeout(function() {
    var settingsElement = document.getElementById('settings');
    var ww = document.body.clientWidth;
    var wh = document.body.clientHeight - settingsElement.clientHeight;
    app.ports.screenSize.send([ww, wh])
})