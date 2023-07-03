"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    async log() {
        const options = {
            name: "script-help",
            method: 'asyncParentSize',
            args: []
        };
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    console.warn("script-help load");
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    console.warn("script-help unload");
}
exports.unload = unload;
