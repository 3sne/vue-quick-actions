import 'vuetify/dist/vuetify.min.css';
// import 'material-design-icons-iconfont/dist/material-design-icons.css';
import QuickActions from './component/QuickActions.vue';
import Vuetify from './plugins/vuetify';
import VueHotkey from 'v-hotkey';
import QuickActionsMixin from './mixin/QuickActionsMixin';
import { QuickActionList } from './QuickActionList';

const Plugin = {
  install (Vue, options) {
    try {
      if (this.installed) return;

      Vue.use(Vuetify);
      Vue.use(VueHotkey);
      Vue.prototype.$quickAction = Vue.observable(new QuickActionList());
      Vue.mixin(QuickActionsMixin);

      Vue.component(
        'quick-actions',
        QuickActions
      );

      this.installed = true;
      console.log('QuickActions plugin was installed successfully!');
    } catch {
      console.error('Quick Actions plugin installation may be broken, please refresh.');
    }
  }
};
export default Plugin;
