"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const cc_1 = require("cc");
const cc_2 = require("cc");
const cc_3 = require("cc");
const cc_4 = require("cc");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const cc_5 = require("cc");
const { director } = require('cc');
function findByUUID(node, uuid) {
    var _a;
    let findNode = node.getChildByUuid(uuid);
    if (findNode) {
        return findNode;
    }
    else {
        let children = (_a = node.children) !== null && _a !== void 0 ? _a : [];
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            let tNode = findByUUID(child, uuid);
            if (tNode) {
                return tNode;
            }
        }
    }
}
function findUITransform(node) {
    let c = node.getComponent(cc_4.UITransform);
    if (c) {
        return c;
    }
    else {
        return findUITransform(node.parent);
    }
}
function removeFileExtension(filename) {
    const lastIndex = filename.lastIndexOf(".");
    if (lastIndex === -1) {
        return filename;
    }
    return filename.substring(0, lastIndex);
}
function getDbPath(filename) {
    let str = removeFileExtension(filename);
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
        const req = http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.warn("http.request end", data); // 打印接收到的响应数据
                if (data == "success") {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
        req.on('error', (error) => {
            console.error(error);
            resolve(false);
        });
        req.end();
    });
}
//刷新属性面板
async function refreshInspector(node) {
    let nodes = Editor.Selection.getSelected("node");
    if (nodes.length == 1) {
        let uuid = nodes[0];
        let scene = director.getScene();
        let selectNode = findByUUID(scene, uuid);
        if (selectNode && selectNode === node) {
            // console.warn(`inspector:update`)
            //TODO暂时通过 取消/选中 的方式来刷新一下
            Editor.Selection.unselect('node', selectNode.uuid);
            setTimeout(async () => {
                Editor.Selection.select('node', selectNode.uuid);
            }, 300);
            //Editor.Message.send('inspector', "inspector:update", {id:selectNode.uuid, path = ? })
        }
    }
}
function findInspectorRootNode(node) {
    console.log("findInspectorRootNode", node);
    let parent = node.parent;
    if (!parent || parent.name == "should_hide_in_hierarchy") {
        return node;
    }
    else {
        return findInspectorRootNode(node.parent);
    }
}
function getValidCom(node, result) {
    var _a, _b;
    let components = (_a = node.components) !== null && _a !== void 0 ? _a : [];
    for (let index = 0; index < components.length; index++) {
        const component = components[index];
        let name = component.constructor.name;
        console.log("getValidCom", name);
        let cls = cc_5.js.getClassByName(name);
        console.log("getValidCom", cls);
        if (cls) {
            result.push(name);
        }
    }
    let children = (_b = node.children) !== null && _b !== void 0 ? _b : [];
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        getValidCom(child, result);
    }
}
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    getValidCom(...args) {
        console.log("hello world");
        let nodeUuid = args[0];
        let scene = director.getScene();
        let exportNode = findByUUID(scene, nodeUuid);
        if (!exportNode) {
            console.warn(`exportComToScript can't find node of $}`);
            return;
        }
        let node = findInspectorRootNode(exportNode);
        console.log("findInspectorRootNode res", node);
        let result = [];
        getValidCom(node, result);
        return result;
    },
    asyncParentSize() {
        let nodes = Editor.Selection.getSelected("node");
        const { director } = require('cc');
        for (let index = 0; index < nodes.length; index++) {
            const uuid = nodes[index];
            console.log("rotateCamera uuid", index, uuid);
            let node = findByUUID(director.getScene(), uuid);
            console.log("rotateCamera node", node);
            if (node) {
                let p = findUITransform(node);
                if (!p) {
                    console.warn("没有找到UITransform");
                    return;
                }
                let c = node.getComponent(cc_4.UITransform);
                if (!c) {
                    c = node.addComponent(cc_4.UITransform);
                }
                c.setContentSize(p.width, p.height);
                console.log("rotateCamera size", p.width, p.height);
                let com = node.getComponent(cc_1.Widget);
                if (!com) {
                    com = node.addComponent(cc_1.Widget);
                }
                console.log("rotateCamera com", com);
                com.isAlignTop = true;
                com.isAlignBottom = true;
                com.isAlignRight = true;
                com.isAlignLeft = true;
                com.editorLeft = 0;
                com.editorRight = 0;
                com.editorBottom = 0;
                com.editorTop = 0;
            }
        }
        return false;
    },
    createUIComponent() {
        const { director } = require('cc');
        let nodes = Editor.Selection.getSelected("node");
        console.warn("createUIComponent nodes", nodes);
        let parent = director.getScene();
        if (nodes.length == 1) {
            let uuid = nodes[0];
            parent = findByUUID(parent, uuid);
        }
        console.warn("createUIComponent parent", parent);
        if (!parent) {
            return;
        }
        let node = new cc_3.Node();
        node.addComponent(cc_2.Sprite);
        node.addComponent(cc_1.Widget);
        node.parent = parent;
    },
    async createComponent(...args) {
        let name = args[0];
        let uuid = args[1];
        let prefabUuid = args[2];
        if (!name || !uuid || !prefabUuid) {
            console.warn("createComponent args is invalid", name, uuid, prefabUuid);
            return;
        }
        let assetInfo = await Editor.Message.request("asset-db", "query-asset-info", prefabUuid);
        if (!assetInfo) {
            console.warn("createComponent query-asset-info error", assetInfo);
            return;
        }
        let newFileName = name + ".ts";
        let newFile = getDbPath(assetInfo.url) + "/" + newFileName;
        // let template = path.join(Editor.Project.path, ".creator", "asset-template", "typescript", "XComponent")
        // let template = await Editor.Message.request("asset-db", "query-path", "db://internal/default_file_content/ts")
        // if (!template) {
        //     console.warn("createComponent query-path error")
        //     return
        // }
        let template = path_1.default.join(Editor.Project.path, "extensions", "script-help", "template", "ts");
        try {
            let str = fs_1.default.readFileSync(template, 'utf8');
            str = str.replace(/<%UnderscoreCaseClassName%>/g, name);
            let newAssetInfo = await Editor.Message.request("asset-db", "create-asset", newFile, str);
            if (!newAssetInfo) {
                console.warn("createComponent create-asset error");
                return;
            }
            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
            //编译代码
            await refreshAssetDb();
            let tryAddComponent = (times) => {
                times = times - 1;
                console.warn("http.request end", times); // 打印接收到的响应数据
                setTimeout(async () => {
                    let class1 = cc_5.js.getClassByName(name);
                    if (class1) {
                        let options = {
                            uuid: uuid,
                            component: name
                        };
                        Editor.Message.request("scene", "create-component", options);
                    }
                    else {
                        if (times > 0) {
                            tryAddComponent(times);
                            console.warn(`${name}脚本添加成功`);
                        }
                        else {
                            console.warn(`${name}脚本没有添加到节点上`);
                        }
                    }
                }, 100);
            };
            tryAddComponent(10);
        }
        catch (error) {
            console.warn(`createComponent open ${template} fail`, error);
        }
    },
    async exportComToScript(...args) {
        let nodeUuid = args[0];
        let nodeName = args[1];
        let exportType = args[2];
        let scriptName = args[3];
        let scriptCid = args[4];
        let scriptUuid = args[5];
        console.log("exportComToScript", nodeUuid, nodeName, exportType, scriptName, scriptCid, scriptUuid);
        let cls = cc_5.js.getClassById(scriptCid);
        let instance = new cls();
        let props = Object.getOwnPropertyNames(instance);
        if (props.indexOf(nodeName) != -1) {
            console.warn(`${scriptName} already has Property of ${nodeName}`);
            return;
        }
        let path = await Editor.Message.request("asset-db", "query-path", scriptUuid);
        try {
            let str = fs_1.default.readFileSync(path, 'utf8');
            //引擎自带脚本/Node
            if (exportType.startsWith("cc.") || exportType == "Node") {
                let exportTypeWithOutCC = exportType.replace('cc.', '');
                str = str.replace("extends Component {", `extends Component {\n\t@property(${exportTypeWithOutCC})\n\t${nodeName} : ${exportTypeWithOutCC}\n`);
                let regex = /import \{[^}]*XXXX[^}]*\} from 'cc'/;
                const modifiedRegex = new RegExp(regex.source.replace("XXXX", exportTypeWithOutCC), regex.flags);
                if (!modifiedRegex.test(str)) {
                    str = `import { ${exportTypeWithOutCC} } from 'cc'\n` + str;
                }
            }
            else {
            }
            console.debug("readFileSync", str);
            fs_1.default.writeFileSync(path, str);
            //刷新资源
            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
            //编译代码
            await refreshAssetDb();
            let scene = director.getScene();
            let coms = scene.getComponentsInChildren(scriptName);
            if (coms.length < 0) {
                console.warn(`exportComToScript can't find component of ${scriptName}`);
                return;
            }
            let exportNode = findByUUID(scene, nodeUuid);
            if (!exportNode) {
                console.warn(`exportComToScript can't find node of ${nodeName}`);
                return;
            }
            for (let index = 0; index < coms.length; index++) {
                const com = coms[index];
                let props = Object.getOwnPropertyNames(com);
                if (props.indexOf(nodeName) != -1) {
                    if (exportType == "Node") {
                        com[nodeName] = exportNode;
                        refreshInspector(com.node);
                    }
                    else {
                        if (exportNode.getComponent(exportType)) {
                            com[nodeName] = exportNode.getComponent(exportType);
                            refreshInspector(com.node);
                        }
                        else {
                            console.warn(`exportComToScript can't find component of ${exportType} in ${nodeName}`);
                        }
                    }
                }
                else {
                }
            }
        }
        catch (error) {
            console.error(`exportComToScript open ${path} fail`, error);
        }
    }
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() { }
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
