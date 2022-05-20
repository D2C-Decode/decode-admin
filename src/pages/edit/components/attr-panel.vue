<template>
  <div class="attr-panel">
    <a-tabs v-model:activeKey="active">
      <a-tab-pane key="style" tab="样式">
        <div class="style-header">
          <div class="class-name-input" v-if="isEditClassName">
            <a-input
              ref="classNameInput"
              v-model:value="className"
              size="small"
              @keyup.enter="handleEditClassName"
              @blur="handleEditClassName"
            />
          </div>
          <div class="class-name-edit" v-else>
            <div class="class-name-text">
              {{ `.${className}` }}
            </div>
            <EditOutlined class="style-icon" @click="showClassNameEdit" />
          </div>
          <div class="css-code-edit">

          </div>
          <a-button 
            type="primary" 
            size="small" 
            @click="handleEditCss"
            v-if="options.readOnly"
            >
            <template #icon><EditOutlined /></template>
            修改样式
          </a-button>
          <a-button 
            type="primary" 
            size="small" 
            @click="handleSaveCss"
            v-else
            >
            <template #icon><SaveOutlined /></template>
            保存
          </a-button>
        </div>
        <code-editor
          ref="codeEditorRef"
          style="height: 300px" 
          :options="options" 
          v-model:value="cssValue"
          @save="handleSaveCss"
          />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>


<script>
import { reactive, toRefs, watch, ref, nextTick } from 'vue'
import { CopyOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons-vue'
import CodeEditor from '@/components/CodeEditor.vue'
import { message } from 'ant-design-vue';
import { object2Css, css2Object } from './util'

export default {
  components: { CopyOutlined, CodeEditor, EditOutlined, SaveOutlined },
  props: {
    data: {
      type: Object,
    },
    validator: Function
  },
  setup(props, { emit }) {
    const state = reactive({
      active: 'style',
      data: {},
      cssValue: '',
      className: '',
      isEditClassName: false,
      options: {
        language: 'css',
        readOnly: true
      },
    })

    const codeEditorRef = ref()

    watch(
      () => props.data,
      (data) => {
        init(data)
      }
    )
    
    const init = (data) => {
      state.data = data
      state.className = data.className
      state.cssValue = object2Css(`.${data.className}`, data.nodeStyle)
      state.options = {
        language: 'css',
        readOnly: true
      }
    }

    init(props.data)

    const classNameInput = ref()

    const showClassNameEdit = () => {
      state.isEditClassName = true
      nextTick(() =>  classNameInput.value?.focus())
    }

    const handleEditClassName = () => {
      props.validator(state.data.id, state.className).then(() => {
        state.isEditClassName = false
        emit('update', {
          id: state.data.id,
          key: 'className',
          value: state.className,
          nodeData: state.data
        })
      }).catch(err => message.warning(err))
    }

  
    const handleEditCss = () => {
      state.options.readOnly = false
      const editorInstance = codeEditorRef.value.getEditorInstance()
      // 自动聚焦
      editorInstance?.focus()
    }


    const handleSaveCss = () => {
      state.options.readOnly = true
      emit('update', {
        id: state.data.id,
        key: 'nodeStyle',
        value: css2Object(state.cssValue)[`.${state.data.className}`]
      })
    }

    return {
      ...toRefs(state),
      codeEditorRef,
      classNameInput,
      showClassNameEdit,
      handleEditClassName,
      handleEditCss,
      handleSaveCss,
    }
  },
}
</script>

<style lang="less" scoped>
.attr-panel {
  .ant-tabs {
    padding: 0 12px;
    .style-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 32px;
      margin-bottom: 4px;
      .class-name-input {
        display: flex;
      }
      .class-name-edit {
        font-size: 16px;
        width: calc(100% - 100px);
        display: flex;
        align-items: center;
        .class-name-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .style-icon {
          font-size: 16px;
          margin-left: 4px;
          transition: all 0.3s;
          cursor: pointer;
        }
      }
      .css-code-edit {

      }
    }
  }
}
</style>