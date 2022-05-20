<template>
  <header class="header">
    <div class="logo" @click="goHome">D2C</div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'
export default {
  setup() {
    const router  = useRouter()
    const goHome = () => {
      router.replace('/')
    }
    return {
      goHome
    }
  },
}
</script>

<style lang="less" scoped>
.header {
  width: 100%;
  height: @header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  box-shadow: 0px 1px 4px 0px #EEEEEE;
  .logo {
    cursor: pointer;
  }
}
</style>