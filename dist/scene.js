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
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    log() {
        console.log("hello world");
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
                        }
                        else {
                            console.warn("组件没有添加到节点上");
                        }
                    }
                }, 100);
            };
            tryAddComponent(10);
        }
        catch (error) {
            console.warn(`createComponent open ${template} fail`, error);
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
