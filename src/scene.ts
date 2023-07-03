
import { Widget } from "cc";
import { Sprite } from "cc";
import { Node } from "cc";

import { UITransform } from "cc";
import path from "path";
import fs from 'fs'
import { CreateComponentOptions } from "../@types/packages/scene/@types/public";
import http from 'http';
import { js } from "cc";
const { director } = require('cc');


function findByUUID(node: any, uuid: any): any {
    let findNode = node.getChildByUuid(uuid)
    if (findNode) {
        return findNode
    } else {
        let children = node.children ?? []
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            let tNode = findByUUID(child, uuid)
            if (tNode) {
                return tNode
            }
        }
    }
}

function findUITransform(node: any): any {
    let c = node.getComponent(UITransform)
    if (c) {
        return c
    } else {
        return findUITransform(node.parent)
    }
}

function removeFileExtension(filename: string): string {
    const lastIndex = filename.lastIndexOf(".");
    if (lastIndex === -1) {
        return filename;
    }
    return filename.substring(0, lastIndex);
}

function getDbPath(filename: string): string {
    let str = removeFileExtension(filename)
    const lastIndex = str.lastIndexOf("/");
    if (lastIndex === -1) {
        return str;
    }
    return str.substring(0, lastIndex);
}

function refreshAssetDb(){
    return new Promise((resolve)=>{
        const options = {
            hostname: 'localhost',
            port: 7456,
            path: '/asset-db/refresh',
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.warn("http.request end", data); // 打印接收到的响应数据
                if (data == "success") {
                    resolve(true)
                }else{
                    resolve(false)
                }
                
            });
        });

        req.on('error', (error) => {
            console.error(error);
            resolve(false)
        });

        req.end();
    })
}

function getNodeComponents(node : Node, result : any[]) : any {
    console.warn("getNodeComponents node", node.name, node)
    let coms = node.components ?? []
    for (let index = 0; index < coms.length; index++) {
        const com = coms[index];
        // console.warn("getNodeComponents", com)
        if (!(com instanceof UITransform)) {
            result.push(com)
        }
        break
    }
    let children = node.children ?? []
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        getNodeComponents(child, result)
    }
}

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    log() {
        console.log("hello world")
    },

    asyncParentSize() {
        let nodes = Editor.Selection.getSelected("node")
        const { director } = require('cc');
        for (let index = 0; index < nodes.length; index++) {
            const uuid = nodes[index];
            console.log("rotateCamera uuid", index, uuid)
            let node = findByUUID(director.getScene(), uuid)
            console.log("rotateCamera node", node)
            if (node) {
                let p = findUITransform(node)
                if (!p) {
                    console.warn("没有找到UITransform")
                    return
                }
                let c = node.getComponent(UITransform)
                if (!c) {
                    c = node.addComponent(UITransform)
                }

                c.setContentSize(p.width, p.height)

                console.log("rotateCamera size", p.width, p.height)

                let com = node.getComponent(Widget)
                if (!com) {
                    com = node.addComponent(Widget)
                }
                console.log("rotateCamera com", com)
                com.isAlignTop = true
                com.isAlignBottom = true
                com.isAlignRight = true
                com.isAlignLeft = true
                com.editorLeft = 0
                com.editorRight = 0
                com.editorBottom = 0
                com.editorTop = 0
            }
        }

        return false;
    },

    createUIComponent() {
        const { director } = require('cc');
        let nodes = Editor.Selection.getSelected("node")
        console.warn("createUIComponent nodes", nodes)
        let parent = director.getScene()
        if (nodes.length == 1) {
            let uuid = nodes[0]
            parent = findByUUID(parent, uuid)
        }
        console.warn("createUIComponent parent", parent)
        if (!parent) {
            return
        }

        let node = new Node()
        node.addComponent(Sprite)
        node.addComponent(Widget)

        node.parent = parent
    },

    async createComponent(...args: any) {
        let name = args[0]
        let uuid = args[1]
        let prefabUuid = args[2]
        if (!name || !uuid || !prefabUuid) {
            console.warn("createComponent args is invalid", name, uuid, prefabUuid)
            return
        }

        let assetInfo = await Editor.Message.request("asset-db", "query-asset-info", prefabUuid)
        if (!assetInfo) {
            console.warn("createComponent query-asset-info error", assetInfo)
            return
        }

        let newFileName = name + ".ts"
        let newFile = getDbPath(assetInfo.url) + "/" + newFileName
        // let template = path.join(Editor.Project.path, ".creator", "asset-template", "typescript", "XComponent")
        // let template = await Editor.Message.request("asset-db", "query-path", "db://internal/default_file_content/ts")
        // if (!template) {
        //     console.warn("createComponent query-path error")
        //     return
        // }
        let template = path.join(Editor.Project.path, "extensions", "script-help", "template", "ts")
        try {
            let str = fs.readFileSync(template, 'utf8')
            str = str.replace(/<%UnderscoreCaseClassName%>/g, name)
            let newAssetInfo = await Editor.Message.request("asset-db", "create-asset", newFile, str)
            if (!newAssetInfo) {
                console.warn("createComponent create-asset error")
                return
            }

            await Editor.Message.request("asset-db", "refresh-asset", "db://assets")

            //编译代码
            await refreshAssetDb()

            let tryAddComponent = (times: number) => {
                times = times - 1
                console.warn("http.request end", times); // 打印接收到的响应数据
                setTimeout(async () => {
                    let class1 = js.getClassByName(name);
                    if (class1) {
                        let options : CreateComponentOptions = {
                            uuid : uuid,
                            component : name
                        }
                        Editor.Message.request("scene", "create-component", options)
                    }
                    else {
                        if (times > 0) {
                            tryAddComponent(times)
                            console.warn(`${name}脚本添加成功`)
                        } else {
                            console.warn(`${name}脚本没有添加到节点上`)
                        }
                    }
                }, 100);
            }

            tryAddComponent(10)
        } catch (error) {
            console.warn(`createComponent open ${template} fail`, error)
        }
    },

    //获取场景子节点自定脚本
    getSceneComponent(){
        let scene = director.getScene()
        let result : any[] = []
        let children = scene.children ?? []
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            getNodeComponents(child, result)
        }
        return result
    },

    async exportComToScript(...args: any){
        let scriptName = args[0] 
        let scriptID = args[1]
        let scriptAssetUuid = args[2]
        let propertyName = args[3]
        let exportType = args[4]
        let exportUuid = args[5]
        let isNode = args[6]
        let prefabUuid = args[7]

        console.log("exportComToScript", scriptName, scriptID, scriptAssetUuid, propertyName, exportType, exportUuid, isNode)

        let cls = js.getClassById(scriptID)
        let instance = new cls()
        let props = Object.getOwnPropertyNames(instance)
        if (props.indexOf(propertyName) != -1) {
            console.warn(`${scriptName} already has Property of ${propertyName}`)
            return
        }

        let path = await Editor.Message.request("asset-db", "query-path", scriptAssetUuid)
        try {
            let str = fs.readFileSync(path, 'utf8')
            str = str.replace("extends Component {", `extends Component {\n\t@property(${exportType})\n\t${propertyName} : ${exportType}\n`)
            let regex = /import \{[^}]*XXXX[^}]*\} from 'cc'/
            const modifiedRegex = new RegExp(regex.source.replace("XXXX", exportType), regex.flags);
            if (!modifiedRegex.test(str)) {
                str = `import { ${exportType} } from 'cc'\n` + str
            }

            console.debug("readFileSync", str)
            fs.writeFileSync(path, str)

            //刷新资源
            await Editor.Message.request("asset-db", "refresh-asset", "db://assets")

            //编译代码
            await refreshAssetDb()

            let node = director.getScene() as Node
            let coms = node.getComponentsInChildren(scriptName)
            console.warn("getComponentsInChildren", coms)

            let exportNode = findByUUID(node, exportUuid)
            console.warn("exportNode", exportNode)

            for (let index = 0; index < coms.length; index++) {
                const com = coms[index];
                console.warn("com", com)
                let props = Object.getOwnPropertyNames(com)
                if (props.indexOf(propertyName) != -1) {
                    console.warn("com", true)
                }
            }

            let prefabPath = await Editor.Message.request("asset-db", "query-path", prefabUuid)

            let prefabStr = fs.readFileSync(prefabPath, 'utf8')
            let prefabInfo = JSON.parse(prefabStr)
            console.log("prefabInfo", prefabInfo)

            for (let i = 0; i < prefabInfo.length; i++) {
                const info = prefabInfo[i];
                if (info.__type__ == scriptID) {
                    info[propertyName] = {
                        __id__ : 2
                    }
                }
            }
            
        } catch (error) {
            console.warn(`createComponent open ${path} fail`, error)
        }
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() { }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }
