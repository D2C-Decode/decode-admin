import { reactive } from 'vue';

const getFrameApp = () => window.document.getElementById('frame')?.contentWindow.document.getElementById('app');

export function useEditor() {
  const state = reactive({
    containerHeight: 667,
    domTree: []
  });

  const dom2Object = (dom) => {
    if (!dom.getBoundingClientRect) return null;
    const { x, y, width, height } = dom.getBoundingClientRect();
    const className = dom.className.split(' ').filter((c) => !c.includes('van-'))[0];
    if (className === undefined) return null;
    return {
      tag: dom.tagName,
      className,
      id: dom.id,
      x,
      y,
      width,
      height
    };
  };

  // 将dom 转成树对象
  const dom2Tree = (domTree) => {
    let tree = [];
    domTree.forEach((dom) => {
      const domObj = dom2Object(dom);
      if (domObj) {
        if (dom.childNodes && dom.childNodes.length) domObj.children = dom2Tree(dom.childNodes);
        tree.push(domObj);
      }
    });

    return tree;
  };

  const init = () => {
    const app = getFrameApp();
    state.domTree = dom2Tree([app]);
    const containerHeight = document.getElementById('frame')?.contentWindow.document.body.scrollHeight;
    state.containerHeight = containerHeight > 667 ? containerHeight : 667;
  };

  return {
    editorState: state,
    init
  };
}
