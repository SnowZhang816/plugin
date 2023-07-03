"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRootMenu = exports.onPanelMenu = exports.onNodeMenu = exports.onCreateMenu = void 0;
function onCreateMenu(t) {
    console.warn("assets-hierarchy onCreateMenu", t);
    return [
        {
            label: 'i18n:script-help.menu.fullParent',
            click() {
                const options = {
                    name: "script-help",
                    method: 'asyncParentSize',
                    args: []
                };
                Editor.Message.request('scene', 'execute-scene-script', options);
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onNodeMenu(t) {
    console.warn("assets-hierarchy onNodeMenu", t);
    let menus = [];
    menus.push({
        label: 'i18n:script-help.menu.fullParent',
        click() {
            const options = {
                name: "script-help",
                method: 'asyncParentSize',
                args: []
            };
            Editor.Message.request('scene', 'execute-scene-script', options);
        },
    });
    let name = t.name;
    let uuid = t.uuid;
    let resPath = t.prefab.assetUuid;
    if (resPath && resPath != '') {
        menus.push({
            label: 'i18n:script-help.menu.createComponent',
            click() {
                console.warn("assets-hierarchy onRootMenu click");
                const options = {
                    name: "script-help",
                    method: 'createComponent',
                    args: [name, uuid, resPath]
                };
                Editor.Message.request('scene', 'execute-scene-script', options);
            },
        });
    }
    return menus;
}
exports.onNodeMenu = onNodeMenu;
function onPanelMenu(t) {
    console.warn("assets-hierarchy onPanelMenu", t);
    return [
        {
            label: 'i18n:script-help.menu.fullParent',
            async click() {
                const options = {
                    name: "script-help",
                    method: 'asyncParentSize',
                    args: []
                };
                Editor.Message.request('scene', 'execute-scene-script', options);
            },
        },
    ];
}
exports.onPanelMenu = onPanelMenu;
;
function onRootMenu(t) {
    console.warn("assets-hierarchy onRootMenu", t);
    if (t.isScene) {
        //场景节点不能添加组件脚本
        return [];
    }
    let menus = [];
    if (t.prefab && t.prefab.assetUuid && t.prefab.assetUuid != '') {
        let name = t.name;
        let uuid = t.uuid;
        let resPath = t.prefab.assetUuid;
        menus.push({
            label: 'i18n:script-help.menu.createComponent',
            click() {
                console.warn("assets-hierarchy onRootMenu click");
                const options = {
                    name: "script-help",
                    method: 'createComponent',
                    args: [name, uuid, resPath]
                };
                Editor.Message.request('scene', 'execute-scene-script', options);
            },
        });
    }
    return menus;
}
exports.onRootMenu = onRootMenu;
