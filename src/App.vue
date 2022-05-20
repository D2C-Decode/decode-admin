<template>
  <a-config-provider :locale="zhCN">
    <div class="main-app">
      <router-view v-if="showView" />
    </div>
  </a-config-provider>
</template>

<script>
import { reactive, toRefs } from 'vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

export default {
  setup() {
    const state = reactive({
      showView: false,
    })

    const init = async () => {
      state.showView = true
    }

    init()

    return {
      ...toRefs(state),
      zhCN
    }
  },
}
</script>

<style lang="less">

</style>
