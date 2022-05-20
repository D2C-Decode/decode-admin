<template>
  <div class="edit">
    <Header>
      <template #right>
        <a-button @click="save">保存</a-button>
        <a-button type="primary" style="margin-left: 12px" @click="toggleCodeVisible(true)">代码</a-button>
      </template>
    </Header>
    <div class="edit-container">
      <div class="edit-left">
        <node-tree
          :data="codeDSL"  
          :selectedKey="selectedNode ? selectedNode.key : ''"
          @select="handleSelectNode"
          @update="handleUpdateCodeDSL"
          :validator="componentNamedValidator"
        />
      </div>
      <div class="edit-center">
        <a-spin :spinning="spinning">
        <div class="frame-wrap">
          <iframe 
            id="frame" 
            :src="url" 
            v-if="!!DSL"
            @load="onLoad"  
            :style="{
              height: containerHeight + 'px'
            }"
          />
          <div id="frame-canvas"></div>
        </div>
        </a-spin>
      </div>
      <div class="edit-right">
        <attr-panel
          v-if="selectedNode"
          :data="selectedNode"
          @update="handleUpdate"
          :validator="classNameEditValidator"
          />
      </div>
    </div>

    <a-drawer
      title="代码预览"
      placement="bottom" 
      :visible="codeVisible"
      @close="toggleCodeVisible(false)"
      :height="codeDrawerHeight"
      :closable="false"
      destroyOnClose
      :bodyStyle="{
        padding: 0
      }"
    >
    <Code :dsl="DSL" />
    </a-drawer>
  </div>
</template>

<script>
import { reactive, toRefs, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue';
import Header from '@/components/Header.vue'
import NodeTree from './components/node-tree.vue'
import AttrPanel from './components/attr-panel.vue'
import Code from './components/code.vue'
import { cloneDeep, postMsgToChild } from '@/utils/utils'
import { useEditor } from './hooks'
import { useStore } from 'vuex'
import { picassoCode } from 'decode-code-browser'
import { edit as editApi } from '@/api'
import { useRoute } from 'vue-router'

document.domain = "91fkys.com" // 设置同域

export default {
  components: { Header, NodeTree,  AttrPanel, Code },
  setup() {
    const route = useRoute()
    const {state: { edit: editState }, dispatch, commit} = useStore();
    const { editorState, init: editorInit } = useEditor()

    const state = reactive({
      id: route.query.id,
      spinning: true,
      url: import.meta.env.VITE_PREVIEW_URL,
      selectedNode: null,
      DSL: '',
      codeDSL: [],
      flattenList: [],
      codeVisible: false,
      codeDrawerHeight: window.innerHeight - 100
    })


    const convertDsl = (data) => {
      let list = []
      data.forEach(item => {
        const row = {
          ...item,
          key: item.id,
          nodeStyle: item.style,
          nativeChildren: item.children,
          children: item.componentName ? [] : item.children
        }
        // 先删除 style属性  否则tree 组件渲染有误
        delete row.style
        if (row.children) row.children = convertDsl(row.children)
        list.push(row)
      })
      return list
    }

    const revertDsl = (data) => {
      let list = []
      data.forEach(item => {
        const row = {
          ...item,
          style: item.nodeStyle,
          children: item.componentName ? item.nativeChildren : item.children
        }
        // 删除部分字段
        delete row.key
        delete row.nodeStyle
        delete row.nativeChildren
        delete row.nativeNode
        if (row.children && !item.componentName) row.children = revertDsl(row.children)
        list.push(row)
      })
      return list
    }

    const getFlattenList = (data, arr) => {
      let list = arr || []
      data.forEach(item => {
        if (!list.find(row => row.id === item.id)) list.push(item)
        if (item.children) list = getFlattenList(item.children, list)
      })
      return list
    }


    watch(() => editState.reDrawTime, (time) => {
      editorInit()
      drawing(editorState.domTree, true)
    })

    const init = async () => {
      const res = await editApi.getCodePages({ id: state.id })
      if (!res) {
        message.error('未获取到数据，请检查id是否有误！')
        return
      }
      state.DSL = JSON.parse(res.dsl)
      // todo 获取并转换codeDS
      state.codeDSL = convertDsl([state.DSL])
      state.flattenList = getFlattenList(state.codeDSL)
    }

    init()

    const sendCodeMessage = async () => {
      // 获取code
      const code = await picassoCode([state.DSL], 750, 'webpx', 'vue');
      // 发送给preview 生成页面
      postMsgToChild({
        type: 'init',
        data: code
      })
    }

    const onLoad = async () => {
      state.spinning = false
      // 发送code
      sendCodeMessage()

      const el = document.getElementById('frame-canvas')
      el.addEventListener('click', e => {
        const node = e.target
        const cls = node.className.split(' ').filter(c => c.includes('rect-'))[0].slice(5)
        setActiveCanvasRect(cls, 'canvas')
      })
    }
    const drawing = (domTree, init) => {
      const el = document.getElementById('frame-canvas')
      if (init) el.innerHTML = ''
      nextTick(() => {
        domTree.forEach(dom => {
          if (dom.className) {
            const node = document.createElement('div')
            node.className = `rect-${dom.className}`
            node.id = 'rect'
            node.style.left = dom.x + 'px'
            node.style.top = dom.y + 'px'
            node.style.width = dom.width + 'px'
            node.style.height = dom.height + 'px'
            el.appendChild(node)
            if (dom.children) drawing(dom.children)
            if (dom.className === state.selectedNode?.className) {
              // 如果当前绘制的节点为选中的节点  则更新选中节点
              handleSelectNode(state.selectedNode)
            }
          } else {
            if (dom.children) drawing(dom.children)
          }
        })
      })
    }

    const findSelectedNodeByKey = (data, key, value) => {
      if (!value) {
        // 清空选择
        state.selectedNode = null
        return
      }
      data.forEach(item => {
        if (item[key] === value) {
          state.selectedNode = cloneDeep(item)
        } else if (item.children) findSelectedNodeByKey(item.children, key, value)
      })
    }

    const setActiveCanvasRect = (cls, from) => {
      const className = cls || state.selectedNode?.className
      // 如果是点击canvas 则根据className设置选中节点
      if (from === 'canvas') findSelectedNodeByKey(state.codeDSL, 'className', className)
      const nodes = document.getElementById('frame-canvas').childNodes
      nodes.forEach(node => {
        node.className = node.className.replace(/active/g, '').trim()
        if (className && node.className.split(' ').includes(`rect-${className}`)) {
          node.className += ' active'
        }
      })      
    }

    const handleSelectNode = (node) => {
      findSelectedNodeByKey(state.codeDSL, 'key', node?.key)
      setActiveCanvasRect()
    }

    const updateDSL = (dsl, data) => {
      const { id, key, value } = data
      // 递归查找id 并更新对应key value
      dsl.forEach(item => {
        if (item.id === id) {
          item[key] = value
        }
        if (item.children) updateDSL(item.children, data)
      })
    }
    const handleUpdate = async data => {
      updateDSL(state.codeDSL, data)
      // 重新生成flattenList
      state.flattenList = getFlattenList(state.codeDSL)
      state.DSL = revertDsl(state.codeDSL)[0]
      // 发送code
      sendCodeMessage()
    }

    const handleUpdateCodeDSL = async data => {
      state.codeDSL = data
      // 重新生成flattenList
      state.flattenList = getFlattenList(state.codeDSL)
      state.DSL = revertDsl(state.codeDSL)[0]
      // 发送code
      sendCodeMessage()
    }
    const toggleCodeVisible = async (visible) => {
      if (visible) await save()
      state.codeDrawerHeight = window.innerHeight - 100
      state.codeVisible = visible
    }

    const classNameEditValidator = (key, className) => {
      return new Promise((resolve, reject) => {
        if (!className) reject('类名不能为空')
        const sameClassNameNode = state.flattenList.find(item => item.id !== key && className === item.className)
        if (sameClassNameNode) {
          reject('该类名已定义，请重新输入！')
        } else {
          resolve()
        }
      })
    }

    const componentNamedValidator = (key, componentName) => {
      return new Promise((resolve, reject) => {
        if (!componentName) {
          //  允许组件名为空，为空则表示不命名组件
          resolve()
          return
        }
        const sameNode = state.flattenList.find(item => item.id !== key && componentName === item.userNamed)
        if (sameNode) {
          reject('该组件名已定义，请重新输入！')
        } else {
          resolve()
        }
      })
    }


    const save = async () => {
      state.DSL = revertDsl(state.codeDSL)[0]
      const params = {
        id: state.id,
        dsl: JSON.stringify(state.DSL),
      }
      await editApi.updateDSL(params)
      message.success('保存成功')
    }


    return {
      ...toRefs(state),
      ...toRefs(editorState),
      onLoad,
      handleSelectNode,
      handleUpdate,
      handleUpdateCodeDSL,
      toggleCodeVisible,
      classNameEditValidator,
      componentNamedValidator,
      save,
    }
  },
  
}
</script>

<style lang="less" scoped>
.edit {
  height: 100%;
  background: #f5f5f5;
  .edit-container {
    min-height: 100vh;
    padding-top: @header-height;
    display: flex;
    overflow: auto;
    .edit-left {
      width: 340px;
      height: calc(100vh - 48px);
      background: #fff;
      box-shadow: 2px 0 8px rgb(0 0 0 / 15%);
      z-index: 9;
      position: fixed;
      left: 0;
      top: 48px;
      overflow: auto;
    }
    .edit-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      .frame-wrap {
        margin: 80px 0;
        #frame {
          width: 375px;
          min-height:667px;
        }
        #frame-canvas {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          /deep/ #rect {
            position: absolute;
            border: 1px solid transparent;
            transition: all 0.3s, border 0s, line-height 0s, box-shadow 0s;
            &:hover {
              border-color: @primary-color;
            }
          }
          /deep/ .active {
            border: 1px solid @error-color !important;
          }
        }
      }
    }
    .edit-right {
      width: 340px;
      height: calc(100vh - 48px);
      background: #fff;
      box-shadow: -2px 0 8px rgb(0 0 0 / 15%);
      z-index: 9;
      position: fixed;
      right: 0;
      top: 48px;
    }
  }
}
</style>