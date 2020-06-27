<template>
  <v-dialog
    v-model="dialog"
    v-hotkey.stop="keymap"
    scrollable
    width="500px"
  >
    <v-card>
      <v-card-title>
        <v-text-field
          ref="quickActionTextField"
          v-model="search"
          autocomplete="off"
          label="Search Quick Actions"
          hide-details="auto"
          single-line
          clearable
          outlined
          autofocus
          @keydown="listNavigation"
          @blur="keepFocus"
        />
      </v-card-title>
      <v-divider />
      <v-card-text style="height: 300px;">
        <div>
          <v-list
            dense
          >
            <v-list-item
              v-for="(action, index) in filteredQuickActionList"
              :key="index"
              :input-value="currentItem === index"
              @click="invokeActionEvent(action.actionId)"
            >
              <v-list-item-avatar>
                <v-icon
                  v-text="action.icon"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-html="action.displayHTML || action.displayText" />
              </v-list-item-content>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-list-item-action>
                    <v-icon
                      v-on="on"
                    >
                      info
                    </v-icon>
                  </v-list-item-action>
                </template>
                <span>{{ action.description }}</span>
              </v-tooltip>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <div class="caption">
          <span class="font-weight-bold">Tip: </span><kbd>/</kbd> opens this dialog box, <kbd>Esc</kbd> closes it.
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
const Keys = {
  ArrowUp: 38,
  ArrowDown: 40,
  Enter: 13
};
const replaceAtIndex = (string, index, replace) => string.slice(
  0,
  Math.max(
    0,
    index
  )
) + replace + string.slice(Math.max(
  0,
  index + 1
));
export default {
  data () {
    return {
      dialog: false,
      search: '',
      quickActionList: [],
      currentItem: 0
    };
  },
  computed: {
    keymap () {
      return {
        '/': this.toggleQuickActions
      };
    },
    filteredQuickActionList () {
      this.currentItem = 0;
      return this.quickActionList.filter((qa) => this.isSearchMatch(
        qa.displayText,
        this.search
      ))
        .map((qa) => ({
          ...qa,
          displayHTML: this.highlightSearch(
            qa.displayText,
            this.search
          )
        }));
    }
  },
  watch: {
    '$route.name': {
      handler (routeName) {
        console.log(`Route changed to ${routeName}, updating view`);
        this.loadQuickActions(routeName);
      },
      deep: true
    },
    '$quickAction.list': {
      handler (newList) {
        console.log('New action(s) registered, updating view');
        this.loadQuickActions(this.$route.name);
      },
      deep: true
    }
  },
  created () {
    // this.fetchQuickActions();
  },
  methods: {
    keepFocus () {
      if (this.dialog) {
        this.$refs.quickActionTextField.focus();
      }
    },
    isSearchMatch (content, search) {
      if (!search) return true;
      let i, j;
      for (i = 0, j = 0; i < search.length && j < content.length; j++) {
        if (search[i].toLowerCase() === content[j].toLowerCase()) {
          i++;
        }
      }
      return i === search.length;
    },
    highlightSearch (content, search) {
      if (!search) return content;
      let highlightedContent = content;
      let i, j;
      for (i = 0, j = 0; i < search.length && j < content.length; j++) {
        if (search[i].toLowerCase() === content[j].toLowerCase()) {
          i++;
          const replaceAt = j + (highlightedContent.length - content.length);
          const replacement = `<span class="highlightText">${content[j]}</span>`;
          highlightedContent = replaceAtIndex(
            highlightedContent,
            replaceAt,
            replacement
          );
        }
      }
      return highlightedContent;
    },
    toggleQuickActions () {
      this.search = '';
      this.currentItem = 0;
      this.dialog = !this.dialog;
    },

    invokeActionEvent (actionId) {
      this.toggleQuickActions();
      const action = this.filteredQuickActionList.find((quickAction) => quickAction.actionId === actionId);
      action.event(this);
    },
    async fetchQuickActions () {
      try {
        const app = process.env.VUE_APP_NAME;
        const environment = process.env.NODE_ENV?.toUpperCase();
        const filter = {
          app: { equalTo: app }
        };
        if (environment === 'PRODUCTION') {
          filter.env = { equalTo: environment };
        }
        const result = await this.$apollo.query({
          query: allQuickActions,
          variables: { filter }
        });
        if (result.errors) throw 'Quick action fetching failed!';
        const data = result.data?.allQuickActions?.nodes;
        data?.forEach((quickAction) => {
          this.$quickAction.registerAction({
            ...quickAction,
            routeNameList: quickAction.quickActionMapsByActionId?.nodes.map((routeNode) => routeNode.routeName)
          });
        });
      } catch (error) {
        console.error(error);
      }
    },
    loadQuickActions (routeName) {
      try {
        console.info(`Filtering actions for route \"${routeName}\"`);
        const quickActionList = this.$quickAction.getActionList();
        this.quickActionList = quickActionList
          .filter((quickAction) => quickAction.routeNameList?.includes(routeName) ?? true)
          .map((action) => ({
            ...action,
            displayHTML: `${action.groupName}: ${action.name}`,
            displayText: `${action.groupName}: ${action.name}`
          }));
      } catch (error) {
        console.error(error);
        this.quickActionList = [];
      }
    },
    listNavigation (event) {
      if (event.keyCode === Keys.ArrowUp) {
        if (this.currentItem > 0) {
          this.currentItem--;
        } else {
          this.currentItem = this.filteredQuickActionList.length - 1;
        }
      } else if (event.keyCode === Keys.ArrowDown) {
        if (this.currentItem < this.filteredQuickActionList.length - 1) {
          this.currentItem++;
        } else {
          this.currentItem = 0;
        }
      } else if (event.keyCode === Keys.Enter) {
        this.invokeActionEvent(this.filteredQuickActionList[this.currentItem].actionId);
      }
    }
  }
};
</script>
<style scoped>
.v-list--dense .v-list-item,
.v-list-item--dense {
  min-height: 20px;
  height: 30px;
}
</style>
<style>

.highlightText {
  background-color: #bbeffd;
}
</style>
