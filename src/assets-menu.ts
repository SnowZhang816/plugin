import { AssetInfo } from "../@types/packages/asset-db/@types/public";

export function onCreateMenu(assetInfo: AssetInfo) {
  console.warn("assets-menu onCreateMenu")
  return [
    {
      label: 'i18n:simple-1687856477446.menu.createAsset',
      click() {
        if (!assetInfo) {
          console.log('get create command from header menu');
        } else {
          console.log('get create command, the detail of diretory asset is:');
          console.log(assetInfo);
        }
      },
    },
  ];
};

export function onAssetMenu(assetInfo: AssetInfo) {
  console.warn("assets-menu onAssetMenu", assetInfo)
  return [
    {
      label: 'i18n:simple-1687856477446.menu.assetCommandParent',
      submenu: [
        {
          label: 'i18n:simple-1687856477446.menu.assetCommand1',
          enabled: assetInfo.isDirectory,
          click() {
            console.log('get it');
            console.log(assetInfo);
          },
        },
        {
          label: 'i18n:simple-1687856477446.menu.assetCommand2',
          enabled: !assetInfo.isDirectory,
          click() {
            console.log('yes, you clicked');
            console.log(assetInfo);
          },
        },
      ],
    },
  ];
};