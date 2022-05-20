<template>
  <div class="code-wrap">
    <a-spin :spinning="loading" wrapperClassName="code-spin">
      <div class="code">
        <div class="code-left">
          <div 
            :class="['code-file', active === i && 'active']" 
            v-for="(file, i) in files" 
            :key="i"
            @click="handleChangeFile(i)"
            >
            <Icon :type="`icon-${file.type}`" />
            {{ `${file.name}.${file.type}` }}
          </div>
        </div>
        <div class="code-right">
          <code-editor style="height: 100%" :options="options" v-model:value="code" />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import { edit as editApi } from '@/api'

export default {
  components: { CodeEditor },
  props: {
    dsl: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const state = reactive({
      loading: true,
      files: [],
      options: {
        language: 'javascript',
        readOnly: true
      },
      active: 0,
      code: '',
    })

    const init = async () => {
      state.loading = true
      try {
        const res = await editApi.generatorVueCode({ DSL: props.dsl })
        state.files = res.vueCode
        handleChangeFile(0)
        state.loading = false
      } catch (error) {
        state.loading = false
      }
    }

    init()

    const handleChangeFile = (i = 0) => {
      state.active = i
      state.code = state.files[i].code
    }
    return {
      ...toRefs(state),
      handleChangeFile
    }
  },
}
</script>

<style lang="less" scoped>
.code-wrap {
  height: 100%;
  .code-spin {
    height: 100%;
    /deep/.ant-spin-container {
      height: 100%;
    }
  }
  .code {
    display: flex;
    height: 100%;
    .code-left {
      width: 240px;
      border-right: 1px solid #ccc;
      .code-file {
        padding: 0 12px;
        height: 32px;
        line-height: 32px;
        cursor: pointer;
        &:hover {
          background: rgb(230, 247, 253);
        }
        .icon {
          margin-right: 8px;
        }
      }
      .active {
        background: rgb(230, 247, 253);
      }
    }
    .code-right {
      flex: 1;
    }
  }
}
</style>