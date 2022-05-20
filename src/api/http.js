import axios from 'axios';
import { message } from 'ant-design-vue';
const env = import.meta.env;

const http = ({ url, method, params, headers = {}, options = {} }) => {
  const reqOpts = {
    url,
    method: method === 'upload' ? 'post' : method.toLocaleLowerCase(),
    params,
    data: method === 'upload' ? params : JSON.stringify(params),
    ...options
  };

  if (method.toLocaleLowerCase() === 'get') delete reqOpts.data;
  else if (method.toLocaleLowerCase() === 'post' || method.toLocaleLowerCase() === 'upload') delete reqOpts.params;

  return new Promise((resolve, reject) => {
    const instance = axios.create(reqOpts);
    instance.interceptors.request.use(
      (conf) => {
        conf.headers['Content-Type'] = 'application/json';
        if (headers) Object.keys(headers).forEach((key) => (conf.headers[key] = headers[key]));

        return conf;
      },
      (error) => {
        Promise.reject(error);
      }
    );

    instance(reqOpts)
      .then((res) => {
        if (res.data.ok || res.data.success) {
          resolve(res.data.result);
        }
        if (res.data.error) {
          if (res.data.error.message) message.error(res.data.error.message);
          reject(res.data);
        }
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          window.location.replace(`${env.VITE_LOGIN_URL}?redirect=${window.location.href}`);
        } else if (error && error.code === 'ECONNABORTED') {
          message.error('服务器开小差了，请稍后再试');
        } else {
          message.error('请求失败');
        }
        reject(error);
      });
  });
};

export default http;
