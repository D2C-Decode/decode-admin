<template>
  <div class="node-tree">
    <a-tree 
      v-if="treeData.length"
      defaultExpandAll
      draggable
      :tree-data="treeData" 
      :selectedKeys="selectedKeys"
      @select="handleSelectTreeNode"
      @drop="onDrop"
      @check="handeCheckNodes"
      >
      <template #title="{ key: treeKey, dataRef }">
        <a-dropdown :trigger="['contextmenu']">
            <div class="node-tree-title">
              <span class="node-tree-tag">
                <a-tag v-if="dataRef.tag === 'v-for'" size="mini" color="blue">v-for</a-tag>
                <Icon :type="'icon-' + getNodeIcon(dataRef)" />
                {{ dataRef.componentName || getNodeIcon(dataRef) }}
              </span>
              <span class="node-tree-classname">
                {{ `.${dataRef.className}` }}
              </span>
              <a-tag color="orange" v-if="dataRef.userNamed">{{ dataRef.userNamed }}</a-tag>
            </div>
            <template #overlay>
              <a-menu @click="({ key: menuKey }) => onContextMenuClick(dataRef, menuKey)">
                <a-menu-item key="component" :disabled="!dataRef.children || !dataRef.children.length">命名组件</a-menu-item>
                <a-menu-item key="add">插入节点</a-menu-item>
                <a-menu-item key="combine">合并节点</a-menu-item>
                <a-menu-item key="dismantle" :disabled="!dataRef.nativeNode">拆解节点</a-menu-item>
                <a-menu-item key="delete">删除节点</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
    </template>
    </a-tree>
    <a-modal title="组件命名" v-model:visible="namedComponentVisible" width="375px">
      <a-input v-model:value="namedComponent.userNamed" placeholder="请输入组件名" />
      <template #footer>
        <a-button @click="namedComponentVisible = false">取消</a-button>
        <a-button type="primary" :loading="namedComponentLoading" @click="handleNamedComponentSubmit">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import { AppstoreAddOutlined } from '@ant-design/icons-vue'
import { v4 as uuidv4 } from 'uuid';
import { message, Modal } from 'ant-design-vue';
import { useStore } from 'vuex'
import { cloneDeep, postMsgToChild, base64ToBlob } from '@/utils/utils'
import { common as commonApi } from '@/api'


export default {
  components: { AppstoreAddOutlined },
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    selectedKey: String,
    validator: Function
  },
  setup(props, { emit }) {
    const state = reactive({
      treeData: [],
      classNameList: [],
      isEdit: false,
      selectedNode: null,
      checkedKeys: [],
      checkedNodes: [],
      selectedKeys: props.selectedKey ? [props.selectedKey] : [],
      namedComponent: {},
      namedComponentVisible: false,
      namedComponentLoading: false
    })

    const {state: { edit: editState }, dispatch, commit} = useStore();

    watch(() => props.data, () => init(), { deep: true })
    watch(() => props.selectedKey, (val) => state.selectedKeys = val ? [val] : [])

    const init = () => {
      state.treeData = cloneDeep(props.data)
    }

    init()

    const getNodeIcon = (node) => {
      let icon = 'div'
      if (node.componentName) {
        icon = 'component'
      } else if (node.type === 'Container') {
        icon = 'div'
      } else if (node.type === 'Text') {
        icon = node.children?.length ? 'div' : 'text'
      } else if (node.type === 'Image') {
        icon = 'img'
      }

      return icon
    }


    // 选择节点
    const handleSelectTreeNode = (selectedKeys, { selected, selectedNodes, node }) => {
      state.selectedNode = node
      emit('select', selected ? node.dataRef : null)
    }

    const handeCheckNodes = (checkedKeys, e) => {
      state.checkedNodes = e.checkedNodes
    }

    // 命名组件
    const handleNamedComponent = (node) => {
      state.namedComponent = {
        ...cloneDeep(node),
        userNamed: node.userNamed || ''
      }
      state.namedComponentVisible = true
    }

    const handleNamedComponentSubmit = () => {
      const { key, userNamed } = state.namedComponent

      props.validator(key, userNamed).then(() => {
        state.namedComponentLoading = true
        const node = cloneDeep(state.namedComponent)
        replaceNode(state.treeData, node)
        emit('update', state.treeData)
        state.namedComponentLoading = false
        state.namedComponentVisible = false
      }).catch(err => {
         message.warning(err)
         state.namedComponentLoading = false
      })
    }
    // 新增节点
    const handleAddNode = (node) => {
      if (node.componentName) {
        message.warning('组件节点无法新增子节点')
        return
      }

      appendChildNode(state.treeData, node.key)
      emit('update', state.treeData)
    }

    // 添加子节点
    const appendChildNode = (data, key) => {
      data.forEach(item => {
        if (item.key === key) {
          const id = uuidv4()
          const name = `block-${Date.now()}`
          const node = {
            type: 'Container',
            id,
            key: id,
            children: [],
            name,
            className: name,
            nativeChildren: [],
            nodeStyle: {},
            panel: {},
            panelData: {},
            structure: {}
          }
          item.children.unshift(node)
        } else if (item.children) appendChildNode(item.children, key)
      })
    }

    // 发送节点合并通知给子页面
    const handleCombine = (treeNode) => {
      message.loading({
          content: '节点合并中...',
          key: 'combine',
          duration: 0
        })
        postMsgToChild({
          type: 'combineNodesToImage',
          data: treeNode
        })
    }

    // 监听子页面图片生成
    watch(() => editState.combineNode, async (data) => {
      
      try {
        const url = await handleUploadImage(data.imageUrl)
        const node = {
          ...cloneDeep(data.node),
          type: 'Image',
          isItem: false,
          value: url,
          children: [],
          nativeChildren: [],
          nativeNode: cloneDeep(data.node)  // 备份节点数据  便于恢复
        }
        replaceNode(state.treeData, node)
        emit('update', state.treeData)
        message.success({
          content: '节点合并成功',
          key: 'combine',
          duration: 2
        })
      } catch (error) {
        message.error({
          content: error,
          key: 'combine',
          duration: 2
        })
      }
    })

    // 替换node
    const replaceNode = (data, node) => {
      data.forEach((item, i) => {
        if (item.key === node.key) {
          data[i] = node
        } else if (item.children) replaceNode(item.children, node)
      })
    }

    // 上传图片
    const handleUploadImage = async (imageUrl) => {
      const formData = new FormData();
      formData.append(
        'uploadParam',
        JSON.stringify({
          scene: 'static_file',
          appName: 'kaer-admin',
          fileName: 'file.png'
        })
      );
      formData.append('fileStream', base64ToBlob(imageUrl));

      try {
        const res = await commonApi.uploadFile(formData)
        const url = res?.data?.url
        if (url) return Promise.resolve(url)
        else return Promise.reject(res.message)
      } catch (error) {
        return Promise.reject(error.message)
      }
    }

    const handleDismantle = (treeNode) => {
      message.loading({
        content: '节点拆解中...',
        key: 'dismantle',
        duration: 0
      })
      replaceNode(state.treeData, treeNode.nativeNode)
      emit('update', state.treeData)
      message.success({
        content: '节点拆解成功',
        key: 'dismantle',
        duration: 2
      })
    }

    // 删除节点提示
    const confirmDeleteNode = node => {
      Modal.confirm({
        title: '提示',
        content: '该操作将会删除该节点下所有子节点，是否继续？',
        cancelText: '取消',
        okText: '继续',
        onOk: () => {
          handleDeleteNode(state.treeData, node.key)
          emit('update', state.treeData)
        }
      })
    }

    // 删除节点
    const handleDeleteNode = (data, key) => {
      data.forEach((item) => {
        (item.children || []).forEach((child, i) => {
          if (child.key === key) {
            item.children.splice(i, 1)
          }
        })
        handleDeleteNode(item.children || [], key)
      })
    }

    const onContextMenuClick = (treeNode, menuKey) => {
      if (menuKey === 'component') {
        handleNamedComponent(treeNode)
      } else if (menuKey === 'add') {
        handleAddNode(treeNode)
      } else if (menuKey === 'combine') {
        handleCombine(treeNode, menuKey)
      } else if (menuKey === 'dismantle') {
        handleDismantle(treeNode)
      } else if (menuKey === 'delete') {
        confirmDeleteNode(treeNode)
      }
    }

    // 拖拽节点
    const onDrop = (info) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const loop = (data, key, callback) => {
        data.forEach((item, index) => {
          if (item.key === key) {
            return callback(item, index, data);
          }
          if (item.children) {
            return loop(item.children, key, callback);
          }
        });
      };
      const data = [...state.treeData];

      // Find dragObject
      let dragObj;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          /// where to insert 示例添加到头部，可以是随意位置
          item.children.unshift(dragObj);
        });
      } else if (
        (info.node.children || []).length > 0 && // Has children
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          // where to insert 示例添加到头部，可以是随意位置
          item.children.unshift(dragObj);
        });
      } else {
        let ar = [];
        let i = 0;
        loop(data, dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }
      state.treeData = data
      emit('update', data)
    }

    return {
      ...toRefs(state),
      getNodeIcon,
      onContextMenuClick,
      handleAddNode,
      handleSelectTreeNode,
      handeCheckNodes,
      onDrop,
      handleNamedComponentSubmit
    }
    
  },
}
</script>

<style lang="less" scoped>
.node-tree {
  overflow: auto;
  height: 100%;
  position: relative;
  padding: 20px 8px;
  .node-tree-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
  }
  .node-tree-title {
    display: flex;
    align-items: center;
    white-space: nowrap;
    .node-tree-tag {
      margin-right: 8px;
    }
    .node-tree-classname {
      font-size: 12px;
      color: #ccc;
      margin-right: 8px;
    }
  }

  /deep/ .icon {
    font-size: 20px;
    margin-right: 4px;
  }

  .node-tree-tag {
    display: flex;
    align-items: center;
  }
}
</style>