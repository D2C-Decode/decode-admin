import { createStore, createLogger } from 'vuex';
import index from './modules/index';
import edit from './modules/edit';

const debug = process.env.NODE_ENV !== 'production';

const store = createStore({
  modules: {
    edit,
    index
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
});

// 监听事件
window.addEventListener('message', (e) => {
  // 不接受消息源来自于当前窗口的消息
  if (e.source === window || e.data === 'loaded') {
    return;
  }
  return store.dispatch(e.data.type, e.data.data);
});

export default store;
