const state = {
  reDrawTime: null,
  combineNode: {}
};

const actions = {
  reDraw({ commit, state }) {
    commit('updateReDrawTime');
  },
  combineNodesToImage({ commit, state }, data) {
    commit('updateCombineNode', data);
    // const url = `//apigw.qa.91fkys.com/api/file-ue/1.0/h5_upload`;
    // const formData = new FormData();
    // formData.append(
    //   'uploadParam',
    //   JSON.stringify({
    //     scene: 'static_file',
    //     appName: 'kaer-admin',
    //     fileName: 'file.png'
    //   })
    // );
    // formData.append('fileStream', base64ToBlob(data.imageUrl));
    // http({
    //   url,
    //   method: 'upload',
    //   params: formData,
    //   options: {
    //     withCredentials: true
    //   }
    // });
  }
};

const mutations = {
  updateReDrawTime(state, payload) {
    state.reDrawTime = Date.now();
  },
  updateCombineNode(state, payload) {
    state.combineNode = payload;
  }
};

export default {
  namespace: true,
  state,
  actions,
  mutations
};
