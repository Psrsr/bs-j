import * as THREE from 'three';
//绘制物体的相关几何体和材质的数据

const drawData = {
  // 屏幕属性
  SCREEN: {
    w: window.innerWidth,
    h: window.innerHeight,
    p: window.devicePixelRatio,
  },

  // 摄像机角度
  ORIGINAL_POSITION_ORTHCAMERA: {
    x: 600,
    y: 150,
    z: 900,
  },
  //系数为180 层级*系数=位置
  ORIGINAL_POSITION_RATIO: 270,

  // 环境光的颜色和强度
  ORIGINAL_LIGHT_AMBIENT: {
    color: 0x444444,
    intensity: 1,
  },

  SERVICE_LINE_PROPS: {
    offset: 6,
  },
  // 使线条向上偏移 否则不便于点击
  ORIGINAL_POSITION_LINE2_OFFSET: {
    y: 3,
  },
  // 正常连接线
  ORIGINAL_MATERIAL_LINE2: {
    color: 0xdddddd,
    resolution: { x: window.innerWidth, y: window.innerHeight },
    dashed: false,
    visible: true,
    linewidth: 4,
    dashSize: 6,
    gapSize: 6,
  },

  //连接省会城市和下属城市云的链接
  //业务拓扑连线
  ORIGINAL_MATERIAL_LINE_CLOUDTOPROVINCE: {
    color: 'yellow',
    resolution: { x: window.innerWidth, y: window.innerHeight },
    dashed: true,
    visible: true,
    linewidth: 3,
    dashSize: 6,
    gapSize: 6,
  },
  // 云中的连接
  ORIGINAL_MATERIAL_LINE_CLOUD: {
    color: 0xdddddd,
    resolution: { x: window.innerWidth, y: window.innerHeight },
    dashed: false,
    visible: false,
    linewidth: 3,
    dashSize: 6,
    gapSize: 6,
  },

  //球体
  ORIGINAL_GEO_SPHERE: {
    radius: 12,
    widthSegments: 30,
    heightSegments: 30,
  },
  // 球体的材料
  ORIGINAL_MATERIAL_SPHERE: {
    color: 'rgb(21,210,210)',
    side: THREE.DoubleSide,
  },
  //斜面
  ORIGINAL_GEO_SLOPE: {
    width: 35,
    height: 35, //y方向 厚度
    widthSegments: 4,
    heightSegments: 4,
  },
  // 斜面材料
  ORIGINAL_MATERIAL_SLOPE: {
    color: 'rgb(74,103,146)',
    side: THREE.DoubleSide,
  },
  //圆柱
  ORIGINAL_GEO_CYLINDER: {
    radiusTop: 20,
    radiusBottom: 20,
    height: 27,
    radialSegments: 30,
    heightSegments: 1,
  },
  // 圆柱体材料
  ORIGINAL_MATERIAL_CYLINDER: {
    color: 'rgb(255,255,255)',
    side: THREE.DoubleSide,
  },
  // 业务起点与终点
  SERVICEEND_MATERIAL_CYLINDER: {
    color: '#ff0000',
    side: THREE.DoubleSide,
  },
  // 链接的材料
  ORIGINAL_MATERIAL_LINK: {
    color: 0x24c9fe,
  },

  //圆锥
  ORIGINAL_GEO_CONE: {
    radius: 12,
    height: 24,
    radialSegments: 20,
    heightSegments: 1,
  },
  // 圆锥的材料
  ORIGINAL_MATERIAL_CONE: {
    color: 'rgb(255,255,255)',
    side: THREE.DoubleSide,
  },
  ORIGINAL_POS_OFFSET_CONE: {
    y: 12,
  },

  //长方体
  ORIGINAL_GEO_BOX: {
    width: 16,
    height: 36,
    depth: 16,
  },
  // 长方体材料
  ORIGINAL_MATERIAL_BOX: {
    color: 'rgb(151,173,172)',
    side: THREE.DoubleSide,
  },

  //子网图层
  ORIGINAL_GEO_SUBNET3: {
    radiusTop: 200,
    radiusBottom: 200,
    height: 2,
    radialSegments: 32,
    heightSegments: 1,
  },
  //子网材质
  ORIGINAL_MATERIAL_SUBNET: {
    color: new THREE.Color(0xe0ccff),
    side: THREE.DoubleSide,
    opacity: 0.1,
  },

  //平面
  ORIGINAL_GEO_PLANE: {
    width: 3250,
    height: 3, //y方向 厚度
    depth: 3250,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  },
  // 专门为第二层做的参数
  ORIGINAL_GEO_PLANE2: {
    width: 400,
    height: 3, //y方向 厚度
    depth: 400,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  },
  ORIGINAL_GEO_PLANE2_cloud: {
    width: 200,
    height: 3, //y方向 厚度
    depth: 200,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  },
  ORIGINAL_GEO_PLANE2_CENTER: {
    radiusTop: 200,
    radiusBottom: 200,
    height: 1, //y方向 厚度
    radialSegments: 3,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 6.3,
  },
  //Sprite
  ORIGINAL_PARAMS_SPRITE: {
    fontSize: 90,
    borderColor: { r: 255, g: 0, b: 0, a: 0.4 } /* 边框黑色 */,
    backgroundColor: { r: 255, g: 255, b: 255, a: 0 } /* 背景颜色 */,
    fontColor: 'rgba(0, 0, 0, 1.0)',
  },
  ORIGINAL_OPTIONS_SPRITE: {
    scale: 45,
  },
  // 平面的材料
  ORIGINAL_MATERIAL_PLANE: {
    color: new THREE.Color(0x24c9fe),
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 0.6,
  },
  // 透明平面的材料
  ORIGINAL_MATERIAL_PLANE_OPACITY: {
    color: new THREE.Color(0x24c9fe),
    side: THREE.DoubleSide,
    transparent: true, //是否透明
    opacity: 0.1, //透明度
  },

  //网格
  ORIGINAL_GRIDHELPER: {
    size: 1000,
    divisions: 20,
    color1: 'white',
    color2: 'black',
  },
};

export default drawData;
