import http from '../http';

const env = import.meta.env;

const baseUrl = env.VITE_API_URL;

export default {
  /**
   * 保存dsl
   * @param {*} params
   * @returns
   */
  updateDSL(params) {
    const url = `${baseUrl}/d2c/updateDSL`;
    return http({
      url,
      params,
      method: 'post'
    });
  },
  /**
   * 获取列表/详情
   * @param {*} params
   * @returns
   */
  getCodePages(params) {
    const url = `${baseUrl}/d2c/queryPages`;
    return http({
      url,
      params,
      method: 'get'
    });
  },
  generatorVueCode(params) {
    const url = `${baseUrl}/d2c/generatorVueCode`;
    return http({
      url,
      params,
      method: 'post'
    });
  }
};
