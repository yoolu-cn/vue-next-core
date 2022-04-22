import { App } from './app.js';
import { createApp } from '../../lib/guide-vue-next-core.esm.js';

const rootContainer = document.querySelector('#app');
createApp(App).mount(rootContainer);
