export function typeOf(obj) {
  const { toString } = Object.prototype;
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  return map[toString.call(obj)];
}

export function cloneDeep(data) {
  const t = typeOf(data);
  let o;

  if (t === 'array') {
    o = [];
  } else if (t === 'object') {
    o = {};
  } else {
    return data;
  }

  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(cloneDeep(data[i]));
    }
  } else if (t === 'object') {
    for (const i in data) {
      o[i] = cloneDeep(data[i]);
    }
  }
  return o;
}

export const postMsgToChild = (msg) => {
  document.getElementById('frame')?.contentWindow?.postMessage(JSON.parse(JSON.stringify(msg)), '*');
};

export const base64ToBlob = (urlData) => {
  let arr = urlData.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  // 去掉url的头，并转化为byte
  let bytes = window.atob(arr[1]);
  // 处理异常,将ascii码小于0的转换为大于0
  let ab = new ArrayBuffer(bytes.length);
  // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
  let ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ab], {
    type: mime
  });
};
