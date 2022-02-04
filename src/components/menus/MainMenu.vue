<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <div class="side-bar__info">
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="loginToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <user-image :user-id="userId"></user-image>
        </div>
        <span>Signed in as <b>{{loginToken.name}}</b>.</span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="syncToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <icon-provider :provider-id="currentWorkspace.providerId"></icon-provider>
        </div>
        <span v-if="currentWorkspace.providerId === 'googleDriveAppData'">
          <b>{{currentWorkspace.name}}</b> synced with your Google Drive app data folder.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'googleDriveWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with a <a :href="workspaceLocationUrl" target="_blank">Google Drive folder</a>.
        </span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-else>
        <div class="menu-entry__icon menu-entry__icon--disabled">
          <icon-sync-off></icon-sync-off>
        </div>
        <span><b>{{currentWorkspace.name}}</b> not synced.</span>
      </div>
    </div>
    <menu-entry @click.native="setPanel('workspaces')">
      <icon-database slot="icon"></icon-database>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="workspaceCount">{{workspaceCount}}</div> Workspaces</div>
      <span>Switch to another workspace.</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('history')">
      <icon-history slot="icon"></icon-history>
      <div>History</div>
      <span>Track and restore file revisions.</span>
    </menu-entry>
    <menu-entry @click.native="fileProperties">
      <icon-view-list slot="icon"></icon-view-list>
      <div>File properties</div>
      <span>Add metadata and configure extensions.</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('toc')">
      <icon-toc slot="icon"></icon-toc>
      Table of contents
    </menu-entry>
    <menu-entry @click.native="setPanel('help')">
      <icon-help-circle slot="icon"></icon-help-circle>
      Markdown cheat sheet
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('importExport')">
      <icon-content-save slot="icon"></icon-content-save>
      Import/export
    </menu-entry>
    <menu-entry @click.native="print">
      <icon-printer slot="icon"></icon-printer>
      Print
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('workspaceBackups')">
      <icon-content-save slot="icon"></icon-content-save>
      Workspace backups
    </menu-entry>
    <menu-entry @click.native="reset">
      <icon-logout slot="icon"></icon-logout>
      Reset application
    </menu-entry>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MenuEntry from './common/MenuEntry';
import providerRegistry from '../../services/providers/common/providerRegistry';
import UserImage from '../UserImage';
import googleHelper from '../../services/providers/helpers/googleHelper';
import syncSvc from '../../services/syncSvc';
import userSvc from '../../services/userSvc';
import store from '../../store';

export default {
  components: {
    MenuEntry,
    UserImage,
  },
  computed: {
    ...mapGetters('workspace', [
      'currentWorkspace',
      'syncToken',
      'loginToken',
    ]),
    userId() {
      return userSvc.getCurrentUserId();
    },
    workspaceLocationUrl() {
      const provider = providerRegistry.providersById[this.currentWorkspace.providerId];
      return provider.getWorkspaceLocationUrl(this.currentWorkspace);
    },
    workspaceCount() {
      return Object.keys(store.getters['workspace/workspacesById']).length;
    },
  },
  methods: {
    ...mapActions('data', {
      setPanel: 'setSideBarPanel',
    }),
    async fileProperties() {
      try {
        await store.dispatch('modal/open', 'fileProperties');
      } catch (e) {
        // Cancel
      }
    },
    print() {
      window.print();
    },
    async reset() {
      try {
        await store.dispatch('modal/open', 'reset');
        localStorage.setItem('resetStackEdit', '1');
        window.location.reload();
      } catch (e) { /* Cancel */ }
    }
  },
};
</script>
