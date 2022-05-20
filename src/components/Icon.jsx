import { createFromIconfontCN } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
const Icon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3322261_b71y4i6pdq.js', // 在 iconfont.cn 上生成
});

export default defineComponent({
  setup() {
    return () => <Icon class="icon" />;
  },
});