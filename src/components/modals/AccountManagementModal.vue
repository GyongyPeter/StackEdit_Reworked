<template>
  <modal-inner class="modal__inner-1--account-management" aria-label="Manage external accounts">
    <div class="modal__content">
      <div class="modal__image">
        <icon-key></icon-key>
      </div>
      <p v-if="entries.length">StackEdit has access to the following external accounts:</p>
      <p v-else>StackEdit has no access to any external account yet.</p>
      <div>
        <div class="account-entry flex flex--column" v-for="entry in entries" :key="entry.token.sub">
          <div class="account-entry__header flex flex--row flex--align-center">
            <div class="account-entry__icon flex flex--column flex--center">
              <icon-provider :provider-id="entry.providerId"></icon-provider>
            </div>
            <div class="account-entry__description">
              {{entry.name}}
            </div>
            <div class="account-entry__buttons flex flex--row flex--center">
              <button class="account-entry__button button" @click="remove(entry)" v-title="'Remove access'">
                <icon-delete></icon-delete>
              </button>
            </div>
          </div>
          <div class="account-entry__row">
            <span class="account-entry__field" v-if="entry.userId">
              <b>User ID:</b>
              {{entry.userId}}
            </span>
            <span class="account-entry__field" v-if="entry.url">
              <b>URL:</b>
              {{entry.url}}
            </span>
            <span class="account-entry__field" v-if="entry.scopes">
              <b>Scopes:</b>
              {{entry.scopes.join(', ')}}
            </span>
          </div>
        </div>
      </div>
      <menu-entry @click.native="addGoogleDriveAccount">
        <icon-provider slot="icon" provider-id="googleDrive"></icon-provider>
        <span>Add Google Drive account</span>
      </menu-entry>
      <menu-entry @click.native="addGooglePhotosAccount">
        <icon-provider slot="icon" provider-id="googlePhotos"></icon-provider>
        <span>Add Google Photos account</span>
      </menu-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button button--resolve" @click="config.resolve()">Close</button>
    </div>
  </modal-inner>
</template>

<script>
import { mapGetters } from 'vuex';
import ModalInner from './common/ModalInner';
import MenuEntry from '../menus/common/MenuEntry';
import store from '../../store';
import utils from '../../services/utils';
import googleHelper from '../../services/providers/helpers/googleHelper';;

export default {
  components: {
    ModalInner,
    MenuEntry,
  },
  computed: {
    ...mapGetters('modal', [
      'config',
    ]),
    entries() {
      return [
        ...Object.values(store.getters['data/googleTokensBySub']).map(token => ({
          token,
          providerId: 'google',
          userId: token.sub,
          name: token.name,
          scopes: ['openid', 'profile', ...token.scopes
            .map(scope => scope.replace(/^https:\/\/www.googleapis.com\/auth\//, ''))],
        }))
      ];
    },
  },
  methods: {
    async remove(entry) {
      const tokensBySub = utils.deepCopy(store.getters[`data/${entry.providerId}TokensBySub`]);
      delete tokensBySub[entry.token.sub];
      await store.dispatch('data/patchTokensByType', {
        [entry.providerId]: tokensBySub,
      });
    },
    async addGoogleDriveAccount() {
      try {
        await store.dispatch('modal/open', { type: 'googleDriveAccount' });
        await googleHelper.addDriveAccount(!store.getters['data/localSettings'].googleDriveRestrictedAccess);
      } catch (e) { /* cancel */ }
    },
    async addGooglePhotosAccount() {
      try {
        await googleHelper.addPhotosAccount();
      } catch (e) { /* cancel */ }
    }
  }
};
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.account-entry {
  margin: 1.5em 0;
  height: auto;
  font-size: 17px;
  line-height: 1.5;
}

$button-size: 30px;

.account-entry__header {
  line-height: $button-size;
}

.account-entry__row {
  border-top: 1px solid $hr-color;
  font-size: 0.67em;
  padding: 0.25em 0;
}

.account-entry__field {
  opacity: 0.5;
}

.account-entry__icon {
  height: 22px;
  width: 22px;
  margin-right: 0.75rem;
  flex: none;
}

.account-entry__description {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.account-entry__buttons {
  margin-left: 0.75rem;
}

.account-entry__button {
  width: $button-size;
  height: $button-size;
  padding: 4px;
  background-color: transparent;
  opacity: 0.75;

  &:active,
  &:focus,
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
