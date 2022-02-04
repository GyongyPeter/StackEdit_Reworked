const origin = `${window.location.protocol}//${window.location.host}`;

export default {
  cleanTrashAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
  origin,
  oauth2RedirectUri: `${origin}/oauth2/callback`,
  types: [
    'contentState',
    'syncedContent',
    'content',
    'file',
    'folder',
    'syncLocation',
    'data',
  ],
  localStorageDataIds: [
    'workspaces',
    'settings',
    'layoutSettings',
    'tokens',
    'serverConf',
  ],
  textMaxLength: 250000,
  defaultName: 'Untitled',
};
