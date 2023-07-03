"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAssetMenu = exports.onCreateMenu = void 0;
function onCreateMenu(assetInfo) {
    console.warn("assets-menu onCreateMenu");
    return [
        {
            label: 'i18n:script-help.menu.createAsset',
            click() {
                if (!assetInfo) {
                    console.log('get create command from header menu');
                }
                else {
                    console.log('get create command, the detail of diretory asset is:');
                    console.log(assetInfo);
                }
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onAssetMenu(assetInfo) {
    console.warn("assets-menu onAssetMenu", assetInfo);
    return [
        {
            label: 'i18n:script-help.menu.assetCommandParent',
            submenu: [
                {
                    label: 'i18n:script-help.menu.assetCommand1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'i18n:script-help.menu.assetCommand2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
}
exports.onAssetMenu = onAssetMenu;
;
