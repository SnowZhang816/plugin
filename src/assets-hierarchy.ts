import { AssetInfo } from "../@types/packages/asset-db/@types/public";
import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";

let createComponent = {
    label: 'i18n:simple-1687856477446.menu.createCompoment',
    click() {
        const options: ExecuteSceneScriptMethodOptions = {
            name: "simple-1687856477446",
            method: 'createComponent',
            args: []
        };

        Editor.Message.request('scene', 'execute-scene-script', options)
    },
}

export function onCreateMenu(t : any) {
    console.warn("assets-hierarchy onCreateMenu", t)
    return [
        {
            label: 'i18n:simple-1687856477446.menu.fullParent',
            click() {
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "simple-1687856477446",
                    method: 'asyncParentSize',
                    args: []
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        },
        {
            label: 'i18n:simple-1687856477446.menu.customUiCompoment',
            submenu: [
                {
                  label: 'i18n:simple-1687856477446.ui.sprite',
                  click() {
                    const options: ExecuteSceneScriptMethodOptions = {
                        name: "simple-1687856477446",
                        method: 'createUICompoment',
                        args: []
                    };
            
                    Editor.Message.request('scene', 'execute-scene-script', options)
                  },
                },
              ],
        },
        createComponent,
    ];
};

export function onNodeMenu(t : any) {
    console.warn("assets-hierarchy onNodeMenu", t)
    let name = t.name
    let uuid = t.uuid
    let resPath = t.prefab.assetUuid

    let data = {
        name : name,
        uuid : uuid,
        resPath : resPath
    }
    
    return [
        {
            label: 'i18n:simple-1687856477446.menu.fullParent',
            click() {
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "simple-1687856477446",
                    method: 'asyncParentSize',
                    args: []
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        },
        {
            label: 'i18n:simple-1687856477446.menu.createCompoment',
            click() {
                console.warn("assets-hierarchy onRootMenu click")
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "simple-1687856477446",
                    method: 'createComponent',
                    args: [name, uuid, resPath]
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        }
    ];
}

export function onPanelMenu(t : any) {
    console.warn("assets-hierarchy onPanelMenu", t)
    return [
        {
            label: 'i18n:simple-1687856477446.menu.fullParent',
            async click() {
                const options: ExecuteSceneScriptMethodOptions = {
                    name: "simple-1687856477446",
                    method: 'asyncParentSize',
                    args: []
                };
        
                Editor.Message.request('scene', 'execute-scene-script', options)
            },
        },

        {
            label: 'i18n:simple-1687856477446.menu.customUiCompoment',
            submenu: [
                {
                  label: 'i18n:simple-1687856477446.ui.sprite',
                  click() {
                    const options: ExecuteSceneScriptMethodOptions = {
                        name: "simple-1687856477446",
                        method: 'createUICompoment',
                        args: []
                    };
            
                    Editor.Message.request('scene', 'execute-scene-script', options)
                  },
                },
              ],
        },
        createComponent,
    ];
};

export function onRootMenu(t : any){
    if (t.isScene) {
        return []
    }

    if (t.prefab && t.prefab.state == 1) {
        let name = t.name
        let uuid = t.uuid
        let resPath = t.prefab.assetUuid

        let data = {
            name : name,
            uuid : uuid,
            resPath : resPath
        }

        let s = JSON.stringify(data)

        console.warn("assets-hierarchy onRootMenu", t, s)
        return [
            {
                label: 'i18n:simple-1687856477446.menu.createCompoment',
                click() {
                    console.warn("assets-hierarchy onRootMenu click")
                    const options: ExecuteSceneScriptMethodOptions = {
                        name: "simple-1687856477446",
                        method: 'createComponent',
                        args: [name, uuid, resPath]
                    };
            
                    Editor.Message.request('scene', 'execute-scene-script', options)
                },
            }
        ]
    }
}