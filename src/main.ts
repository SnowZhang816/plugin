// import { js } from "cc";
import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    async log() {
        const options: ExecuteSceneScriptMethodOptions = {
            name: "script-help",
            method: 'asyncParentSize',
            args: []
        };

        const result = await Editor.Message.request('scene', 'execute-scene-script', options)
        // console.warn("log", result)
    },

    mainReady() {
        console.log("mainReady")
    },

    assetsAdd1(data : any){
        // let class1 = js.getClassByName(data);
        console.warn("main assetsAdd1");
    }
};


function buildReady(data : any){
    console.warn("build-worker:ready", data)

    // let class1 = js.getClassByName(newFileName);
    // console.warn("main buildReady", class1);
}

function assetsAdd(data : any){
    // let class1 = js.getClassByName(data);
    console.warn("main assetsAdd");
}

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    console.warn("script-help load")
    Editor.Message.addBroadcastListener("selection:select", buildReady)
    Editor.Message.addBroadcastListener("assets:add", assetsAdd)
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    console.warn("script-help unload")
    Editor.Message.removeBroadcastListener("selection:select", buildReady)
    Editor.Message.removeBroadcastListener("assets:add", assetsAdd)
}

