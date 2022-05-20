import { createApp } from 'vue';
import Antd from 'ant-design-vue';

import './assets/styles/common.less';
import store from './store';
import { VueClipboard } from '@soerenmartius/vue3-clipboard';
import App from './App.vue';
import router from './router';
import Icon from '@/components/Icon';

const app = createApp(App);

app.use(router);
app.use(Antd);
app.use(store);
app.use(VueClipboard);

app.component('Icon', Icon);

app.mount('#app');
