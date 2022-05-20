<template>
  <div class="index">
    <Header />
    <div class="list-container">
      <div class="content-loading" v-if="loading">
        <a-skeleton active v-for="(item, i) in 10" :key="i" />
      </div>
      <div class="content-list" v-else>
        <a-empty v-if="!list.length" style="margin: 100px 0" description="暂无项目" />
        <template v-else>
          <div class="content-item" v-for="(item, index) in list" :key="item.id">
            <div class="content-item-cover" :style="{ backgroundImage: `url(${item.preview})` }">
            </div>
            <div class="content-item-info">
              <div class="item-info-main">
                <div class="item-info-title">{{ item.name }}</div>
                <div class="item-info-desc">{{ `更新时间：${dateFormat(item.updatedAt)}` }}</div>
                <div class="item-info-desc">{{ `创建时间：${dateFormat(item.createdAt)}` }}</div>
              </div>
              <div class="item-info-btns">
                <router-link :to="`/edit?id=${item.id}`" class="info-btn">
                  <Icon type="icon-edit-square" />
                  编辑页面
                </router-link>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import Header from '@/components/Header.vue'
import { edit as editApi } from '@/api'
import dayjs from 'dayjs'

export default {
  components: { Header },
  setup() {
    const state = reactive({
      loading: true,
      list: []
    })

    const init = async () => {
      try {
        state.list = await editApi.getCodePages()
        state.loading = false
      } catch (error) {
        state.loading = false
      }
      
    }

    init()

    const dateFormat = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')

    return {
      ...toRefs(state),
      dateFormat
    }
  },
}
</script>

<style lang="less" scoped>
.index {
  height: 100%;
  background: #fff;
  .list-container {
    min-height: 100vh;
    padding-top: @header-height;
    overflow: auto;
    .content-loading {
      padding: 16px 32px;
    }
    .content-list {
      .content-item:hover {
        background-color: rgba(235, 248, 255, 0.6);;
      }
      .content-item {
        display: flex;
        padding: 16px 32px;
        .content-item-cover {
          position: relative;
          width: 90px;
          height: 160px;
          margin-right: 24px;
          background-color: #d9d9d9;
          background-size: 100%;
          background-repeat: no-repeat;
        }
        .content-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          .item-info-main {
            .item-info-title {
              color: #262626;
              font-weight: 500;
              line-height: 22px;
              margin-bottom: 8px;
            }
            .item-info-desc {
              color: #8c8c8c;
              line-height: 22px;
              margin-bottom: 8px;
            }
          }
          .item-info-btns {
            .info-btn {
              display: inline-flex;
              align-items: center;
              color: #1E8DFF;
              cursor: pointer;
              line-height: 22px;
              margin-right: 24px;
              .icon {
                font-size: 20px;
                margin-right: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>