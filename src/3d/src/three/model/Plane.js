import { memorize } from '../../utils';

// 只提取id的前三个字符
function getVirtualPlaneId(init) {
  // init为平面
  return init.filter(v => v.type === 'virtual').map(v => v.level);
}

function getPhysicalPlaneId(init) {
  return init.filter(v => v.type === 'physical').map(v => v.level);
}

function getCloudPlaneId(init) {
  return init.filter(v => v.type === 'cloud').map(v => v.level);
}

const memo_getCloudPlaneId = memorize(getCloudPlaneId);
const memo_getVirtualPlaneId = memorize(getVirtualPlaneId);
const memo_getPhysicalPlaneId = memorize(getPhysicalPlaneId);

export { memo_getVirtualPlaneId, memo_getPhysicalPlaneId, memo_getCloudPlaneId };
