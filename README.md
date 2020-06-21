# Vue Quick Actions

A simple Vue.js plugin that overlays a shortcut accessible quick actions screen over your Vue.js application.

### Usage

Add the plugin as a dependency to your vue app.
```sh
$ npm install vue-quick-actions --save
```
Then, register the plugin to your app via `Vue.use()` API
```js
import Vue from 'vue';
import VueQuickActions from 'vue-quick-actions';

Vue.use(VueQuickActions);
```


### Action Payload Structure

| Property    | Type       | Description                                                                             |
|-------------|------------|-----------------------------------------------------------------------------------------|
| `actionId`  | Number!    | Uniquely identifies an action                                                           |
| `name`      | String     | An action name                                                                          |
| `data`      | String!    | A valid `js` action logic injected at runtime. Use `context` to access the Vue instance |
| `metadata`  | Object     | Read section below                                                                      |
| `createdAt` | Timestamp! | Action creation time                                                                    |
| `app`       | String!    | Target app for which action is made                                                     |
| `env`       | String!    | Environment where this action will be available                                         |

### The `metadata` Property

It is a JSON object, the structure of which is defined below.

```js
{
  version: "0.0.1",
  cmd: {
    pre: "goto",
    target: "sms"
  },
  icon: 'search'
}
```