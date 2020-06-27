export default {
  created: function () {
    if (this.$data?.quickActions) {
      const quickActions = this.$data?.quickActions;
      if (!Array.isArray(quickActions)) {
        throw new TypeError(`Quick Actions may not be setup correctly. Expected Array<Object>, got ${typeof quickActions} instead.`);
      }
      if (quickActions?.length <= 0) {
        console.warn('No Quick Actions were passed!');
        return;
      }
      console.info(`${quickActions.length} Quick Actions detected. Registering...`);
      quickActions?.forEach((action) => {
        Vue.prototype.$quickAction?.registerAction(action);
      });
    }
  },
  destroyed: function () {
    if (this.$data?.quickActions) {
      console.info('Component destroyed. Deregistering Quick Actions, if any...');
      this.$data?.quickActions?.forEach?.((action) => {
        Vue.prototype.$quickAction?.deregisterAction(action?.actionId);
      });
    }
  }
};