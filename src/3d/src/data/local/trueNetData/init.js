//初始化整体数据：平面数量、名称、层级等等
//level为系数，乘以比例即可得到位置，例如 vp:1*50=50
// 对应数据库的initPlane_front表
const init = {
  code: 1,
  msg: '成功',
  data: [
    {
      pnId: 'odl_real',
      pnName: 'ODL',
      subId: 1,
      type: 'physical',
      area: '',
      level: 0,
      locationX: 0,
      locationY: 0,
      locationZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      pnNodesForShow: null,
    },
    {
      pnId: 'sr_real',
      pnName: 'SR',
      subId: 1,
      type: 'physical',
      area: '',
      level: -1,
      locationX: 0,
      locationY: 0,
      locationZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      pnNodesForShow: null,
    },
    {
      pnId: 'virtual_real',
      pnName: 'p0',
      subId: 1,
      type: 'virtual',
      area: '',
      level: 1,
      locationX: 0,
      locationY: 0,
      locationZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      pnNodesForShow: null,
    },
  ],
};

exports.init = init;

//commonjs require输出的，是一个值的拷贝，而es6 import输出的是值的引用；

// 若两个文件同时引用一个模块，改变模块内的值时，
//require引入的模块内的值不会改变
//import引入的模块内的值会改变。
