import http from '../http';

const env = import.meta.env;

export default {
  /**
   * 文件上传
   * @param {*} params
   * @returns
   */
  uploadFile(params) {
    const url = `//apigw${env.VITE_APP_ENV === 'prod' ? '' : '.qa'}.91fkys.com/api/file-ue/1.0/h5_upload`;
    return http({
      url,
      method: 'upload',
      params,
      options: {
        withCredentials: true
      }
    });
  }
};
