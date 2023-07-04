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
function getSubMenu(nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid) {
    return {
        label: scriptName,
        click() {
            const options = {
                name: "script-help",
                method: 'exportComToScript',
                args: [nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid]
            };
            Editor.Message.request('scene', 'execute-scene-script', options);
        }
    };
}
async function onNodeMenu(t) {
    var _a;
    console.warn("assets-hierarchy onNodeMenu", t);
    let menus = [];
    //同步父节点大小
    menus.push({
        label: 'i18n:script-help.menu.fullParent',
        click() {
            const options = {
                name: "script-help",
                method: 'log',
                args: [t.uuid]
            };
            Editor.Message.request('scene', 'execute-scene-script', options);
        },
    });
    //生成同名组件
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
    //导出节点到组件脚本中
    const options = {
        name: "script-help",
        method: 'getValidCom',
        args: [uuid]
    };
    let nodeValidComponents = await Editor.Message.request('scene', 'execute-scene-script', options);
    nodeValidComponents = nodeValidComponents !== null && nodeValidComponents !== void 0 ? nodeValidComponents : [];
    console.warn("sceneComponents nodeValidComponents", nodeValidComponents);
    let sceneComponents = await Editor.Message.request('scene', 'query-components');
    console.warn("sceneComponents sceneComponents", sceneComponents);
    let valids = [];
    for (let index = 0; index < sceneComponents.length; index++) {
        const component = sceneComponents[index];
        if (component.assetUuid && nodeValidComponents.indexOf(component.name.replace('cc.', '')) != -1) {
            valids.push(component);
        }
    }
    if (valids.length > 0) {
        console.warn("valids sceneComponents", valids);
        let subSceneComMenus = [];
        for (let index = 0; index < valids.length; index++) {
            const sceneCom = valids[index];
            subSceneComMenus.push(getSubMenu(t.uuid, t.name, "Node", sceneCom.name, sceneCom.cid, sceneCom.assetUuid));
        }
        let subMenus = [];
        subMenus.push({
            label: 'Node 到',
            submenu: subSceneComMenus
        });
        let nodeComponents = (_a = t.components) !== null && _a !== void 0 ? _a : [];
        for (let index = 0; index < nodeComponents.length; index++) {
            const nodeCom = nodeComponents[index];
            console.warn("nodeComponents nodeCom", nodeCom);
            subSceneComMenus = [];
            for (let index = 0; index < valids.length; index++) {
                const sceneCom = valids[index];
                subSceneComMenus.push(getSubMenu(t.uuid, t.name, nodeCom.type, sceneCom.name, sceneCom.cid, sceneCom.assetUuid));
            }
            subMenus.push({
                label: nodeCom.type + " 到",
                submenu: subSceneComMenus
            });
        }
        menus.push({
            label: '导出',
            submenu: subMenus
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
