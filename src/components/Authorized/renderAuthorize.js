/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable import/no-mutable-exports */
let CURRENT = 'NULL';

/**
 * Use authority or getAuthority
 *
 * @param {string|()=>String} currentAuthority
 */
// 高阶函数，接受Authorized组件和currentAuthority作为参数
// 根据传入的currentAuthority来解析当前用户的权限
// CURRENT变量缓存解析结果，暴露给模块外部使用
const renderAuthorize = (Authorized) => (currentAuthority) => {
  if (currentAuthority) {
    if (typeof currentAuthority === 'function') {
      CURRENT = currentAuthority();
    }

    if (
      Object.prototype.toString.call(currentAuthority) === '[object String]' ||
      Array.isArray(currentAuthority)
    ) {
      CURRENT = currentAuthority;
    }
  } else {
    CURRENT = 'NULL';
  }

  return Authorized;
};

export { CURRENT };
export default (Authorized) => renderAuthorize(Authorized);
