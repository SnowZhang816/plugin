import { MenuItem } from "electron";
import { AssetInfo } from "../@types/packages/asset-db/@types/public";
import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";

export function onCreateMenu(t : any) {
    console.warn("assets-hierarchy onCreateMenu", t)
    return [
        {
            label: 'i18n:script-help.menu.fullParent',
            click() {
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "script-help",
                    method: 'asyncParentSize',
                    args: []
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        },
    ];
};

function getSubMenu(propertyName : string, propertyType : string, uuid : string, isNode : boolean, scriptLabel : string, cid : string, assetUuid : string, resPath : string){
    return {
        label : scriptLabel,
        click(){
            console.warn("click", uuid, isNode, scriptLabel, cid)
            const options: ExecuteSceneScriptMethodOptions = {
                name: "script-help",
                method: 'exportComToScript',
                args: [scriptLabel, cid, assetUuid, propertyName, propertyType, uuid, isNode, resPath]
            };
    
            Editor.Message.request('scene', 'execute-scene-script', options)
        }
    }
}

export async function onNodeMenu(t : any) {
    console.warn("assets-hierarchy onNodeMenu", t)
    let menus = []

    //同步父节点大小
    menus.push({
        label: 'i18n:script-help.menu.fullParent',
        click() {
            const options: ExecuteSceneScriptMethodOptions = {
                name: "script-help",
                method: 'asyncParentSize',
                args: []
            };
    
            Editor.Message.request('scene', 'execute-scene-script', options)
        },
    })

    //生成同名组件
    let name = t.name
    let uuid = t.uuid
    let resPath = t.prefab.assetUuid
    if (resPath && resPath != '') {
        menus.push(        {
            label: 'i18n:script-help.menu.createComponent',
            click() {
                console.warn("assets-hierarchy onRootMenu click")
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "script-help",
                    method: 'createComponent',
                    args: [name, uuid, resPath]
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        })
    }
    
    //导出节点到组件脚本中
    let sceneComponents = await Editor.Message.request('scene', 'query-components')
    let valids:any[] = []
    for (let index = 0; index < sceneComponents.length; index++) {
        const component = sceneComponents[index];
        if (component.assetUuid && component.name != 'internal.DebugViewRuntimeControl') {
            valids.push(component)
        }
    }
    if (valids.length > 0) {
        console.warn("valids sceneComponents", valids)

        let subSceneComMenus = []
        for (let index = 0; index < valids.length; index++) {
            const sceneCom = valids[index];
            subSceneComMenus.push(getSubMenu(t.name, "Node", t.uuid, true, sceneCom.name, sceneCom.cid, sceneCom.assetUuid, resPath))
        }
    
        let subMenus = []
        subMenus.push({
            label: 'Node 到',
            submenu : subSceneComMenus
        })

        let nodeComponents = t.components ?? []
        for (let index = 0; index < nodeComponents.length; index++) {
            const nodeCom = nodeComponents[index];
            console.warn("nodeComponents element", nodeCom)
            subSceneComMenus = []
            for (let index = 0; index < valids.length; index++) {
                const sceneCom = valids[index];
                subSceneComMenus.push(getSubMenu(t.name, nodeCom.type.replace('cc.',''), nodeCom.value, false, sceneCom.name, sceneCom.cid, sceneCom.assetUuid, resPath))
            }
            
            subMenus.push({
                label: nodeCom.type + " 到",
                submenu : subSceneComMenus
            })
        }

        menus.push({
            label: '导出',
            submenu : subMenus
        })
    }

    return menus
}

export function onPanelMenu(t : any) {
    console.warn("assets-hierarchy onPanelMenu", t)
    return [
        {
            label: 'i18n:script-help.menu.fullParent',
            async click() {
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "script-help",
                    method: 'asyncParentSize',
                    args: []
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        },
    ];
};

export function onRootMenu(t : any){
    console.warn("assets-hierarchy onRootMenu", t)
    if (t.isScene) {
        //场景节点不能添加组件脚本
        return []
    }

    let menus = []
    if (t.prefab && t.prefab.assetUuid && t.prefab.assetUuid != '' ) {
        let name = t.name
        let uuid = t.uuid
        let resPath = t.prefab.assetUuid
        menus.push({
            label: 'i18n:script-help.menu.createComponent',
            click() {
                console.warn("assets-hierarchy onRootMenu click")
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "script-help",
                    method: 'createComponent',
                    args: [name, uuid, resPath]
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        })
    }

    return menus
}