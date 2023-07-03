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

export function onNodeMenu(t : any) {
    console.warn("assets-hierarchy onNodeMenu", t)
    let menus = []
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