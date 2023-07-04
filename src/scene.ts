
import { Widget } from "cc";
import { Sprite } from "cc";
import { Node } from "cc";

import { UITransform } from "cc";
import path from "path";
import fs from 'fs'
import { CreateComponentOptions } from "../@types/packages/scene/@types/public";
import http from 'http';
import { js } from "cc";
import { Component } from "cc";
import { __private } from "cc";
import { Constructor } from "cc";
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

//编译代码
function refreshAssetDb() {
    return new Promise((resolve) => {
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
                } else {
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

//刷新属性面板
async function refreshInspector(node: Node) {
    let nodes = Editor.Selection.getSelected("node")
    if (nodes.length == 1) {
        let uuid = nodes[0]
        let scene = director.getScene() as Node
        let selectNode = findByUUID(scene, uuid)
        if (selectNode && selectNode === node) {
            // console.warn(`inspector:update`)
            //TODO暂时通过 取消/选中 的方式来刷新一下
            Editor.Selection.unselect('node', selectNode.uuid)
            setTimeout(async () => {
                Editor.Selection.select('node', selectNode.uuid)
            }, 300);

            //Editor.Message.send('inspector', "inspector:update", {id:selectNode.uuid, path = ? })
        }
    }
}

function findInspectorRootNode(node: Node): Node {
    console.log("findInspectorRootNode", node)
    let parent = node.parent
    if (!parent || parent.name == "should_hide_in_hierarchy") {
        return node
    } else {
        return findInspectorRootNode(node.parent as Node)
    }
}

function getValidCom(node: Node, result: any[]) {
    let components = node.components ?? []
    for (let index = 0; index < components.length; index++) {
        const component = components[index];
        let name = component.constructor.name
        console.log("getValidCom", name)
        let cls = js.getClassByName(name)
        console.log("getValidCom", cls)
        if (cls) {
            result.push(name)
        }
    }
    let children = node.children ?? []
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        getValidCom(child, result)
    }
}

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    getValidCom(...args: any) {
        console.log("hello world")
        let nodeUuid = args[0]
        let scene = director.getScene() as Node
        let exportNode = findByUUID(scene, nodeUuid) as Node
        if (!exportNode) {
            console.warn(`exportComToScript can't find node of $}`)
            return
        }

        let node = findInspectorRootNode(exportNode) as Node
        console.log("findInspectorRootNode res", node)
        let result: any[] = []
        getValidCom(node, result)

        return result
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
                        let options: CreateComponentOptions = {
                            uuid: uuid,
                            component: name
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

    async exportComToScript(...args: any) {
        let nodeUuid = args[0]
        let nodeName = args[1]
        let exportType = args[2] as string
        let scriptName = args[3]
        let scriptCid = args[4]
        let scriptUuid = args[5]


        console.log("exportComToScript", nodeUuid, nodeName, exportType, scriptName, scriptCid, scriptUuid)

        let cls = js.getClassById(scriptCid)
        let instance = new cls()
        let props = Object.getOwnPropertyNames(instance)
        let writeScript = true
        if (props.indexOf(nodeName) != -1) {
            console.warn(`${scriptName} already has Property of ${nodeName}`)
            writeScript = false
        }

        if (writeScript) {
            try {
                let path = await Editor.Message.request("asset-db", "query-path", scriptUuid)
                let str = fs.readFileSync(path, 'utf8')
                //引擎自带脚本/Node
                if (exportType.startsWith("cc.") || exportType == "Node") {
                    let exportTypeWithOutCC = exportType.replace('cc.', '')
                    str = str.replace("extends Component {", `extends Component {\n\t@property(${exportTypeWithOutCC})\n\t${nodeName} : ${exportTypeWithOutCC}\n`)
                    let regex = /import \{[^}]*XXXX[^}]*\} from 'cc'/
                    const modifiedRegex = new RegExp(regex.source.replace("XXXX", exportTypeWithOutCC), regex.flags);
                    if (!modifiedRegex.test(str)) {
                        str = `import { ${exportTypeWithOutCC} } from 'cc'\n` + str
                    }
                } else {

                }

                console.debug("readFileSync", str)
                fs.writeFileSync(path, str)

                //刷新资源
                await Editor.Message.request("asset-db", "refresh-asset", "db://assets")

                //编译代码
                await refreshAssetDb()
            }
            catch (error) {
                console.error(`exportComToScript open ${path} fail`, error)
            }
        }

        let scene = director.getScene() as Node
        let coms = scene.getComponentsInChildren(scriptName)
        if (coms.length < 0) {
            console.warn(`exportComToScript can't find component of ${scriptName}`)
            return
        }

        let exportNode = findByUUID(scene, nodeUuid) as Node
        if (!exportNode) {
            console.warn(`exportComToScript can't find node of ${nodeName}`)
            return
        }

        for (let index = 0; index < coms.length; index++) {
            const com = coms[index] as any;
            let props = Object.getOwnPropertyNames(com)
            console.error("props11111111111")
            if (props.indexOf(nodeName) != -1) {
                console.error("props222222222")
                if (exportType == "Node") {
                    com[nodeName] = exportNode
                    refreshInspector(com.node)
                } else {
                    if (exportNode.getComponent(exportType)) {
                        com[nodeName] = exportNode.getComponent(exportType)
                        refreshInspector(com.node)
                    } else {
                        console.warn(`exportComToScript can't find component of ${exportType} in ${nodeName}`)
                    }
                }
            } else {

            }
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
