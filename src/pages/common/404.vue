<template>
  <a-result status="404" title="404资源不存在" sub-title="此页面未找到">
    <template #extra>
      <a-button type="default" @click="goBack">返回上级</a-button>
      <a-button type="primary" @click="goHome">回到首页</a-button>
    </template>
  </a-result>
</template>

<script>
import { useRouter } from 'vue-router'
export default {
  setup() {
    const router = new useRouter()

    const goHome = () => {
      router.replace('/')
    }
    const goBack = () => {
      router.back()
    }

    return {
      goHome,
      goBack
    }
  },
}
</script>