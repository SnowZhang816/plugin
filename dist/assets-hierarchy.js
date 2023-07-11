"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRootMenu = exports.onPanelMenu = exports.onNodeMenu = exports.onCreateMenu = void 0;
function onCreateMenu(t) {
    // console.warn("assets-hierarchy onCreateMenu", t)
    // return [
    //     {
    //         label: 'i18n:script-help.menu.fullParent',
    //         click() {
    //             const options: ExecuteSceneScriptMethodOptions = {
    //                 name: "script-help",
    //                 method: 'asyncParentSize',
    //                 args: []
    //             };
    //             Editor.Message.request('scene', 'execute-scene-script', options)
    //         },
    //     },
    // ];
}
exports.onCreateMenu = onCreateMenu;
;
async function exportComToScript(nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid, isRetry) {
    const options = {
        name: "script-help",
        method: 'exportComToScript',
        args: [nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid, isRetry]
    };
    return await Editor.Message.request('scene', 'execute-scene-script', options);
}
function getSubMenu(nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid, temp) {
    // console.log("exportComToScript", nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid, temp)
    let labelName = scriptName;
    if (temp) {
        labelName = labelName + temp.toString();
    }
    return {
        label: labelName,
        async click() {
            // console.log("exportComToScript click", nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid)
            let retry = async (times, isRetry) => {
                times--;
                let result = await exportComToScript(nodeUuid, nodeName, propertyType, scriptName, scriptCid, scriptUuid, exportScriptUuid, isRetry);
                // console.log("assets-hierarchy exportComToScript", result)
                if (result != 0) {
                    if (result == 1) {
                        if (times > 0) {
                            setTimeout(() => {
                                retry(times, true);
                            }, 100);
                        }
                        else {
                            console.warn("assets-hierarchy exportComToScript fail");
                        }
                    }
                }
                else {
                    console.log("assets-hierarchy exportComToScript success");
                }
            };
            retry(10, false);
        }
    };
}
async function getScriptExportMenu(t) {
    var _a;
    //导出节点到组件脚本中
    let name = t.name;
    let uuid = t.uuid;
    let resPath = t.prefab.assetUuid;
    let menus = [];
    if (resPath && resPath != '') {
        const options = {
            name: "script-help",
            method: 'getValidCom',
            args: [uuid]
        };
        let nodeValidComponents = await Editor.Message.request('scene', 'execute-scene-script', options);
        nodeValidComponents = nodeValidComponents !== null && nodeValidComponents !== void 0 ? nodeValidComponents : [];
        // console.warn("sceneComponents nodeValidComponents", nodeValidComponents)
        let sceneComponents = await Editor.Message.request('scene', 'query-components');
        // console.warn("sceneComponents sceneComponents", sceneComponents)
        let valids = [];
        for (let index = 0; index < sceneComponents.length; index++) {
            const component = sceneComponents[index];
            let i = nodeValidComponents.indexOf(component.cid);
            if (component.assetUuid && i != -1) {
                valids.push(component);
            }
        }
        if (valids.length > 0) {
            // console.warn("valids sceneComponents", valids)
            let subSceneComMenus = [];
            let includes = new Map();
            for (let index = 0; index < valids.length; index++) {
                const sceneCom = valids[index];
                let name = sceneCom.name;
                let identify = includes.get(name);
                let count;
                if (typeof identify === 'undefined') {
                    identify = 0;
                }
                else {
                    identify++;
                    count = identify;
                }
                includes.set(name, identify);
                subSceneComMenus.push(getSubMenu(t.uuid, t.name, "Node", sceneCom.name, sceneCom.cid, sceneCom.assetUuid, "", count));
            }
            menus.push({
                label: 'Node 到',
                submenu: subSceneComMenus
            });
            let nodeComponents = (_a = t.components) !== null && _a !== void 0 ? _a : [];
            for (let index = 0; index < nodeComponents.length; index++) {
                const nodeCom = nodeComponents[index];
                // console.warn("nodeComponents nodeCom", nodeCom)
                let exportScriptUuid;
                if (!nodeCom.type.startsWith('cc.')) {
                    for (let i = 0; i < sceneComponents.length; i++) {
                        const component = sceneComponents[i];
                        if (component.name == nodeCom.type) {
                            exportScriptUuid = component.assetUuid;
                            break;
                        }
                    }
                }
                subSceneComMenus = [];
                let includes = new Map();
                for (let index = 0; index < valids.length; index++) {
                    const sceneCom = valids[index];
                    let name = sceneCom.name;
                    let identify = includes.get(name);
                    let count;
                    if (typeof identify === 'undefined') {
                        identify = 0;
                    }
                    else {
                        identify++;
                        count = identify;
                    }
                    includes.set(name, identify);
                    if (exportScriptUuid) {
                        if (sceneCom.name != nodeCom.type) {
                            subSceneComMenus.push(getSubMenu(t.uuid, t.name, nodeCom.type, sceneCom.name, sceneCom.cid, sceneCom.assetUuid, exportScriptUuid, count));
                        }
                    }
                    else {
                        subSceneComMenus.push(getSubMenu(t.uuid, t.name, nodeCom.type, sceneCom.name, sceneCom.cid, sceneCom.assetUuid, exportScriptUuid, count));
                    }
                }
                if (subSceneComMenus.length > 0) {
                    menus.push({
                        label: nodeCom.type + " 到",
                        submenu: subSceneComMenus
                    });
                }
            }
        }
    }
    return menus;
}
async function onNodeMenu(t) {
    // console.warn("assets-hierarchy onNodeMenu", t)
    let menus = [];
    //同步父节点大小
    // menus.push({
    //     label: 'i18n:script-help.menu.fullParent',
    //     click() {
    //         const options: ExecuteSceneScriptMethodOptions = {
    //             name: "script-help",
    //             method: 'log',
    //             args: [t.uuid]
    //         };
    //         Editor.Message.request('scene', 'execute-scene-script', options)
    //     },
    // })
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
    let subMenus = await getScriptExportMenu(t);
    if (subMenus.length > 0) {
        menus.push({
            label: '导出',
            submenu: subMenus
        });
    }
    return menus;
}
exports.onNodeMenu = onNodeMenu;
function onPanelMenu(t) {
    // console.warn("assets-hierarchy onPanelMenu", t)
    // return [
    //     {
    //         label: 'i18n:script-help.menu.fullParent',
    //         async click() {
    //             const options: ExecuteSceneScriptMethodOptions = {
    //                 name: "script-help",
    //                 method: 'asyncParentSize',
    //                 args: []
    //             };
    //             Editor.Message.request('scene', 'execute-scene-script', options)
    //         },
    //     },
    // ];
}
exports.onPanelMenu = onPanelMenu;
;
async function onRootMenu(t) {
    // console.warn("assets-hierarchy onRootMenu", t)
    if (t.isScene) {
        //场景节点不能添加组件脚本
        return [];
    }
    let name = t.name;
    let uuid = t.uuid;
    let resPath = t.prefab.assetUuid;
    let menus = [];
    if (t.prefab && t.prefab.assetUuid && t.prefab.assetUuid != '') {
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
    let subMenus = await getScriptExportMenu(t);
    if (subMenus.length > 0) {
        menus.push({
            label: '导出',
            submenu: subMenus
        });
    }
    return menus;
}
exports.onRootMenu = onRootMenu;
