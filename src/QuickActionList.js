import { Logger } from '@aws-amplify/core';
const logger = new Logger(
  'QuickActionList',
  'INFO'
);

export class QuickActionList {
  
  constructor() {
    this.list = new Array();
  }
  
  registerAction(action) {
    const { actionId, name } = action;
    const isDuplicate = this.list.findIndex(action => action.actionId === actionId) !== -1;
    if (isDuplicate) {
      logger.error(`Registration of action ${name} with ID ${actionId} skipped: Duplicate action ID!`);
      return;
    }
    action.icon = action.metadata?.icon;
    action = this.evalActionString(action);
    this.list.push(action);
    logger.info(`Action ID ${actionId} was REGISTERED`);
  }

  deregisterAction (actionId) {
    this.list = this.list.filter(action => action.actionId !== actionId);
    logger.info(`Action ID ${actionId} was DEREGISTERED`);
  }
  
  evalActionString (action) {
    let { event } = action;
    if (!event) {
      if (typeof action.data === 'function') {
        event = action.data;
      } else {
        logger.info(`Performing function string eval for action ${action.name} with ID ${action.actionId}`);
        event = new Function(`
          const context = arguments[0];
          try {
            ${action.data};
          } catch (error) {
            context.logger.error('[Action ID: ${action.actionId}] Error:', error);
            context.$snotify.error('Could not execute the action!');
          }
        `);
      }
    }
    return {
      ...action,
      event: event,
      cmd: action.metadata?.cmd
    }
  }

  getActionList () {
    return this.list;
  }
}
