import Css2Object from 'css2object';

export const css2Object = (cssData) => {
  const obj = new Css2Object(cssData);
  obj.read();
  return obj.cssRecord;
};

export const object2Css = (classname, obj = {}) => {
  let css = `${classname} {`;
  Object.keys(obj).forEach((k) => {
    css += `\n  ${k}: ${obj[k]};`;
  });
  css += `\n}`;
  return css;
};
