<template>
  <a-result status="403" title="403 禁止访问" sub-title="你没有此页面的访问权限">
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