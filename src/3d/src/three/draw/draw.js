import * as THREE from 'three';
//引入的顺序要注意，首先要运行initdata 和drawdata，然后才能是draw，然后servicemapping
//如果先引入servicemapping，那么此处有些函数需要的数据还没初始化就要被使用，会报错
import drawData from '../../data/drawData';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import myobj from '../../data/myobj.glb';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';node_modules\
// import {OBJLoader} from 'three-addons/node_modules/three/src/loaders/ObjectLoader.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import c from '../../data/c.obj'
import cloneDeep from 'lodash/cloneDeep'
import {
  createCamera,
  createLight,
  createBox,
  createCylinder,
  createSphere,
  createLine2,
  createPhysicLine2,
} from '../utils/createObj3D';
import { _userData, front_userData } from '../utils/userData';
import { deepClone } from '../../utils';

import switch2test from '../../../img/switch2test.png';
import switch2test2 from '../../../img/switch2test2.png';
import onOffGate from '../../../img/onOffGate.png';

import voltage from '../../../img/voltage.png';
import TWEEN from '@tweenjs/tween.js';

import arrowL from './image/arrowLL.png';
import arrowR from './image/arrowRR.png';
function drawCamera() {
  // left, right, top, bottom, near, far
  // 这六个参数定义了一个长方体，表示只渲染相对于摄像机的这个长方体内的场景
  const orthParams = [
    -drawData.SCREEN.w / 1.8,
    drawData.SCREEN.w / 1.8,
    drawData.SCREEN.h / 1.8,
    -drawData.SCREEN.h / 1.8,
    -3000,
    3000,
  ];
  const orth = createCamera('orth', orthParams);
  return {
    orth,
  };
}
function drawLight() {
  const { color, intensity } = drawData.ORIGINAL_LIGHT_AMBIENT; //color,intensity
  const ambient = createLight('ambient', [color, intensity]);
  return {
    ambient,
  };
}
function drawGridHelper() {
  const { size, divisions, color1, color2 } = drawData.ORIGINAL_GRIDHELPER;
  const obj = new THREE.GridHelper(size, divisions, color1, color2);
  return obj;
}
//画平面
function drawPlane(init, type) {
  // 普通层参数
  const originDefaultGeo = [
    drawData.ORIGINAL_GEO_PLANE.width,
    drawData.ORIGINAL_GEO_PLANE.height,
    drawData.ORIGINAL_GEO_PLANE.depth,
    drawData.ORIGINAL_GEO_PLANE.widthSegments,
    drawData.ORIGINAL_GEO_PLANE.heightSegments,
    drawData.ORIGINAL_GEO_PLANE.depthSegments,
  ];
  const defaultMat =
    type === 'service'
      ? drawData.ORIGINAL_MATERIAL_PLANE_OPACITY
      : drawData.ORIGINAL_MATERIAL_PLANE;
  const res = {};
  init.forEach(p => {
    let { pnId, pnName, level, locationX, locationY, locationZ, rotateX, rotateY, rotateZ, scale } =
      p;
    let defaultGeo = scaleOriginDefaultGeo(originDefaultGeo, scale);
    let obj3D = createBox(defaultGeo, defaultMat);
    obj3D.position.set(
      locationX,
      p.level == -1 ? drawData.ORIGINAL_POSITION_RATIO * p.level : 120,
      locationZ
    );

    // 先旋转y，再旋转x，否则无法对齐
    obj3D.rotateY(rotateY);
    obj3D.rotateX(rotateX);
    obj3D.rotateZ(rotateZ);
    front_userData(obj3D, 'id', p.pnId);
    front_userData(obj3D, 'name', p.pnName);
    front_userData(obj3D, 'draw', 'plane');
    front_userData(obj3D, 'type', p.type);
    front_userData(obj3D, 'level', p.level);
    front_userData(obj3D, 'area', p.area);
    res[p.pnId] = obj3D;
  });
  return res;
  function scaleOriginDefaultGeo(Geo, scale) {
    return [Geo[0] * scale, Geo[1], Geo[2] * scale, Geo[3], Geo[4], Geo[5]];
  }
}

//画子网
function drawSubNets(subNet) {
  const res = {};
  subNet.forEach(p => {
    let { subnetId, subName, type, geoSet, locationX, locationY, locationZ } = p;
    let defaultGeo = geoSet;
    let defaultMat = drawData.ORIGINAL_MATERIAL_SUBNET;
    let obj3D = null;
    if (type === 'Ellipse') {
      const curve = new THREE.EllipseCurve(...defaultGeo);
      const points = curve.getPoints(50);
      const geometry = new THREE.Shape(points);
      const shapeGeo = new THREE.ShapeGeometry(geometry);
      const material = new THREE.MeshBasicMaterial(defaultMat);
      obj3D = new THREE.Mesh(shapeGeo, material);
      obj3D.position.set(locationX, locationY, locationZ);
      obj3D.rotateX(Math.PI / 2);
    } else if (type === 'Circle') {
      //展示保留 确定后删除
      obj3D = createCylinder(defaultGeo, defaultMat);
      obj3D.position.set(locationX, locationY, locationZ);
      obj3D.rotateY(0);
      obj3D.rotateX(0);
      obj3D.rotateZ(0);
    }
    obj3D.position.set(locationX, locationY, locationZ);
    front_userData(obj3D, 'id', subnetId);
    front_userData(obj3D, 'subName', subName);
    front_userData(obj3D, 'geoType', type);
    front_userData(obj3D, 'draw', 'subNets');
    res[p.subnetId] = obj3D;
  });
  return res;
}

//画节点的贴图函数
function drawGeneralSwitch(net_id,nodeType) {
  let indexOfColor = 0;
  switch (nodeType) {
    case 'bridge':
      indexOfColor = 0;
      break;
    case 'controller':
      indexOfColor = 2;
      break;
    default:
      indexOfColor = 0;
      break;
  }
  let color = ['#CCFFFF', '#99CCFF', '#8411F7', '#0f7c03'];
  const defaultGeo = [
    drawData.ORIGINAL_GEO_CYLINDER.radiusTop,
    drawData.ORIGINAL_GEO_CYLINDER.radiusBottom,
    drawData.ORIGINAL_GEO_CYLINDER.height,
    drawData.ORIGINAL_GEO_CYLINDER.radialSegments,
  ];
  const defaultMat = drawData.ORIGINAL_MATERIAL_CYLINDER;
  const gs = createCylinder(defaultGeo, defaultMat);

  const m = new THREE.MeshBasicMaterial({ color: color[indexOfColor] });

  const topTexture = new THREE.TextureLoader().load(switch2test);
  const topMaterial = new THREE.MeshBasicMaterial({ color: 'lavender', map: topTexture });
  const bottomTexture = new THREE.TextureLoader().load(switch2test2);
  const bottomMaterial = new THREE.MeshBasicMaterial({ color: 'lavender', map: bottomTexture });
  const newMaterials = [m, topMaterial, bottomMaterial];
  gs.material = newMaterials;
  return gs;
}
// function drawOtherNode(typeOfNode) {

// }
// async function Load() {
//   let mode = [];
//   const gltfLoader = new GLTFLoader();
//   gltfLoader.load(
//     // 模型的URL或者文件路径
//     myobj,
//     gltf => {
//       mode = gltf.scene.children[0];
//     },
//     progress => {
//       console.log(progress);
//     },
//     error => {
//       console.log(error);
//     }
//   );
//   return mode;
// }


//在plane上画结点
function drawNodes(nodes,dataModel) {
   console.log("drawnodes:111",nodes);
  const nodemodels = [];
  const spritemodels = [];
  if (nodes === null || nodes === [] || nodes === undefined) return {};
  for (let n in nodes) {
    const node = nodes[n];
    let model = null;
    // sprite
    const sprite = makeTextSprite(node.nodeName, drawData.ORIGINAL_PARAMS_SPRITE, {
      scale: 20,
    });
    sprite.position.set(node.locationX, node.locationY + 40, node.locationZ);
    model = drawGeneralSwitch(node.net_id,node.nodeType); 
    model.position.set(
      node.locationX,
      node.locationY + drawData.ORIGINAL_POS_OFFSET_CONE.y,
      node.locationZ
    );
    model.name = 'bridge';
    nodemodels.push(model);
    spritemodels.push(sprite);
    front_userData(model, 'id', node.nodeId);
    front_userData(model, 'name', node.nodeName);
    front_userData(model, 'net_id', node.net_id);
    front_userData(model, 'draw', 'node');
    front_userData(model, 'level', node.level);
    front_userData(model, 'sprite', sprite);
  }
  return {
    nodemodels,
    spritemodels,
  };
}
//画业务两端节点
function drawService2Nodes(serviceData) {
  const serviceDataCopy = deepClone(serviceData);
  const nodemodels = [];
  serviceDataCopy.forEach(service => {
    let sourceNodePos = service.sourceNodePos;
    let targetNodePos = service.targetNodePos;
    let sourceModel = drawService2NodesDetail();
    let targetModel = drawService2NodesDetail();
    sourceModel.position.set(...service.sourceNodePos);
    targetModel.position.set(...service.targetNodePos);
    if (sourceModel.geometry.type === 'CylinderGeometry') {
      sourceModel.position.set(sourceNodePos[0], sourceNodePos[1] + 20, sourceNodePos[2]);
    }
    if (targetModel.geometry.type === 'CylinderGeometry') {
      targetModel.position.set(targetNodePos[0], targetNodePos[1] + 20, targetNodePos[2]);
    }
    nodemodels.push(sourceModel, targetModel);
  });
  return nodemodels;
}
//画业务的起点和终点的两个节点的具体路由器
function drawService2NodesDetail() {
  const defaultGeo = [
    drawData.ORIGINAL_GEO_CYLINDER.radiusTop,
    drawData.ORIGINAL_GEO_CYLINDER.radiusBottom,
    drawData.ORIGINAL_GEO_CYLINDER.height,
    drawData.ORIGINAL_GEO_CYLINDER.radialSegments,
  ];
  const defaultMat = drawData.ORIGINAL_MATERIAL_CYLINDER;
  const gs = createCylinder(defaultGeo, defaultMat);
  const m = new THREE.MeshBasicMaterial({ color: '#CE0000' });
  const topTexture = new THREE.TextureLoader().load(switch2test);
  const topMaterial = new THREE.MeshBasicMaterial({ color: 'lavender', map: topTexture });
  const bottomTexture = new THREE.TextureLoader().load(switch2test2);
  const bottomMaterial = new THREE.MeshBasicMaterial({ color: 'lavender', map: bottomTexture });
  const newMaterials = [m, topMaterial, bottomMaterial];
  gs.material = newMaterials;
  return gs;
}
//画告警link和node
function drawAlarms(alarmInfo) {
  if (alarmInfo === null || alarmInfo === undefined) return [];
  const models = [];
  alarmInfo.forEach((alarm, index) => {
    let model = null;
    let { alarmObjectId, objectType, alarmLevel } = alarm;
    if (objectType === 'node') {
      model = drawAlarmNode();
      model.position.set(
        alarm.locationX,
        alarm.locationY + drawData.ORIGINAL_POS_OFFSET_CONE.y,
        alarm.locationZ
      );
    } else if (objectType === 'link') {
      model = drawAlarmLink(alarm);
    }
    models.push(model);
    //在这里set一些属性
    objectType = objectType === 'node' ? objectType : 'line2';
    front_userData(model, 'id', alarmObjectId);
    front_userData(model, 'name', alarmObjectId);
    front_userData(model, 'draw', objectType);
    front_userData(model, 'type', 'alarm');
  });
  return models;
}
//画告警闪烁节点
function drawAlarmNode() {
  const defaultGeo = [
    drawData.ORIGINAL_GEO_CYLINDER.radiusTop,
    drawData.ORIGINAL_GEO_CYLINDER.radiusBottom,
    drawData.ORIGINAL_GEO_CYLINDER.height,
    drawData.ORIGINAL_GEO_CYLINDER.radialSegments,
  ];
  const alarmMat = {
    color: new THREE.Color(0xf6c204),
    side: THREE.DoubleSide,
  };
  const gs = createCylinder(defaultGeo, alarmMat);
  //闪烁效果开启
  let intervalID = setInterval(() => {
    let curColor = gs.material.color;
    const yellow = 0xf6c204;
    const normal = 0xf8f8a0;
    curColor = curColor.getHex() === yellow ? normal : yellow;
    gs.material.color.setHex(curColor);
    gs.material.needsUpdate = true;
  }, 150);
  return gs;
}
//画告警闪烁链路
function drawAlarmLink(alarm) {
  const { alarmObjectId, node1Pos, node2Pos } = alarm;
  if (alarmObjectId === null || alarmObjectId === undefined) return [];
  const defaultMat = { ...drawData.ORIGINAL_MATERIAL_LINE2 };
  //同一个平面上的线条需要提升高度，以显示在平面之上
  let offsety = 3;
  let pos1 = node1Pos;
  let pos2 = node2Pos;
  if (pos1[1] === pos2[1]) {
    pos1[1] = pos1[1] + offsety;
    pos2[1] = pos2[1] + offsety;
  }
  //返回3D线条  pos:x,y,z   y是一样的 x与z平面,
  let line = createPhysicLine2({ pos1: pos1, pos2: pos2 }, defaultMat);
  let intervalID = setInterval(() => {
    let curColor = line.material.color;
    const red = 0xf81919;
    const normal = 0xfdbdbd;
    curColor = curColor.getHex() === normal ? red : normal;
    line.material.color.setHex(curColor);
    line.material.needsUpdate = true;
  }, 150);
  return line;
}

//画链路
function drawLinks(links, type) {
  if (links === null || links === undefined) return [];
  const models = [];

  links.forEach((link, index) => {
    if (type === 'service2') {
      const tubeLine = drawFatLine2(link, type);
      models.push(...tubeLine);
      front_userData(tubeLine[0], 'name', link.link_name);
      front_userData(tubeLine[0], 'id', link.connectionId);
      front_userData(tubeLine[0], 'draw', 'Line2');
      front_userData(tubeLine[0], 'node1', link.nodeId1);
      front_userData(tubeLine[0], 'node2', link.nodeId2);
      front_userData(tubeLine[1], 'name', link.link_name);
      front_userData(tubeLine[1], 'id', link.connectionId);
      front_userData(tubeLine[1], 'draw', 'Line2');
      front_userData(tubeLine[1], 'node1', link.nodeId1);
      front_userData(tubeLine[1], 'node2', link.nodeId2);
    } else {
      const line = drawFatLine(link);
      models.push(line);
      front_userData(line, 'name', link.link_name);
      front_userData(line, 'id', link.connectionId);
      front_userData(line, 'draw', 'Line2');
      front_userData(line, 'node1', link.nodeId1);
      front_userData(line, 'node2', link.nodeId2);
    }
  });
  return models;
}
//画业务链路
function drawServiceLinks(links, init) {
  if (!links) return [];
  const models = [];
  links.forEach((link, index) => {
    const line = drawServiceLine(link);
    models.push(line);

    // front_userData(line, 'id', link.connectionId);
    front_userData(line, 'draw', 'Line2');
    front_userData(line, 'node1', link.nodeId1);
    front_userData(line, 'node2', link.nodeId2);
    front_userData(line, 'serviceid', link.serviceid);
  });
  return models;
}

//物理链路具体实现函数
function drawFatLine(_link, mat = {}, options = {}) {
  var defaultMat = { ...drawData.ORIGINAL_MATERIAL_LINE2 };
  var serviceMat = { ...drawData.ORIGINAL_MATERIAL_LINE_CLOUDTOPROVINCE };
  const link = deepClone(_link);
  //同一个平面上的线条需要提升高度，以显示在平面之上
  let offsety = 3;
  let pos1 = link.node1Pos;
  let pos2 = link.node2Pos;
  if (pos1[1] === pos2[1]) {
    pos1[1] = pos1[1] + offsety;
    pos2[1] = pos2[1] + offsety;
  }
  //返回3D线条  pos:x,y,z   y是一样的 x与z平面,
  let line1 = createPhysicLine2({ pos1: pos1, pos2: pos2 }, defaultMat);
  return line1;
}
//业务仿真物理链路具体实现函数
function drawFatLine2(_link, type) {
  const link = deepClone(_link);
  let pos1 = link.node1Pos;
  let pos2 = link.node2Pos;
  let line1;
  let line2;
  if (pos1[1] === pos2[1]) {
    if (pos1[0] < pos2[0]) {
      line1 = createTubeLine(
        [pos1[0], pos1[1] + 6, pos1[2]],
        [pos2[0], pos2[1] + 6, pos2[2]],
        'right'
      );
      line2 = createTubeLine(
        [pos1[0], pos1[1] + 15, pos1[2]],
        [pos2[0], pos2[1] + 15, pos2[2]],
        'left'
      );
    } else {
      line1 = createTubeLine(
        [pos2[0], pos2[1] + 6, pos2[2]],
        [pos1[0], pos1[1] + 6, pos1[2]],
        'right'
      );
      line2 = createTubeLine(
        [pos2[0], pos2[1] + 15, pos2[2]],
        [pos1[0], pos1[1] + 15, pos1[2]],
        'left'
      );
    }
  } else {
    if (pos1[1] < pos2[1]) {
      line1 = createTubeLine(
        [pos1[0] + 9, pos1[1] + 2, pos1[2]],
        [pos2[0] + 9, pos2[1] + 2, pos2[2]],
        'right'
      );
      line2 = createTubeLine(
        [pos1[0] - 9, pos1[1], pos1[2]],
        [pos2[0] - 9, pos2[1], pos2[2]],
        'left'
      );
    } else {
      line1 = createTubeLine(
        [pos2[0] + 9, pos2[1] + 2, pos2[2]],
        [pos1[0] + 9, pos1[1] + 2, pos1[2]],
        'right'
      );
      line2 = createTubeLine(
        [pos2[0] - 9, pos2[1], pos2[2]],
        [pos1[0] - 9, pos1[1], pos1[2]],
        'left'
      );
    }
  }
  return [line1, line2];
}

function createTubeLine(src, dst, type) {
  // 创建线条路径
  //src,dst要严格区分
  let curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...src), new THREE.Vector3(...dst)]);
  //依据线条路径创建管道几何体
  let tubeGeometry = new THREE.TubeGeometry(curve, 1, 2, 6, false);
  //加载纹理
  let flowingLineTexture = new THREE.TextureLoader().load(
    type === 'left' ? arrowL : arrowR,
    function (flowingLineTexture) {
      flowingLineTexture.wrapS = THREE.RepeatWrapping;
      flowingLineTexture.wrapT = THREE.RepeatWrapping;
      flowingLineTexture.repeat.set(30, 4); //水平重复8次
      flowingLineTexture.needsUpdate = true;
    }
  );

  //创建纹理贴图材质
  let material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0xffffff,
    map: flowingLineTexture,
  });

  let mesh1 = new THREE.Mesh(tubeGeometry, material);
  //纹理流动
  const tween = new TWEEN.Tween(flowingLineTexture.offset).to(
    { x: type === 'left' ? 1 : -1 },
    1000
  );
  tween.repeat(Infinity);
  tween.start();

  return mesh1;
}
//业务链路具体实现函数
function drawServiceLine(_link) {
  var serviceMat = { ...drawData.ORIGINAL_MATERIAL_LINE_CLOUDTOPROVINCE, color: _link.linkColor };
  const link = deepClone(_link);
  //同一个平面上的线条需要提升高度，以显示在平面之上
  let offsety = 3;
  let pos1 = link.node1Pos;
  let pos2 = link.node2Pos;
  if (pos1[1] === pos2[1]) {
    pos1[1] = pos1[1] + offsety;
    pos2[1] = pos2[1] + offsety;
  }
  //返回3D线条  pos:x,y,z   y是一样的 x与z平面,
  let line = createLine2({ pos1: pos1, pos2: pos2 }, _link.randOfLine, serviceMat);
  return line;
}
//平面侧文字解释函数
function drawPlaneSprite(init) {
  const x = -drawData.ORIGINAL_GEO_PLANE.width / 2;
  const z = drawData.ORIGINAL_GEO_PLANE.depth / 2;
  const res = {};
  init.forEach(p => {
    const { pnId, pnName, area } = p;
    const sprite = makeTextSprite(
      pnName,
      drawData.ORIGINAL_PARAMS_SPRITE,
      drawData.ORIGINAL_OPTIONS_SPRITE
    );
    const setId = `sprite${pnId}`;
    sprite.center = new THREE.Vector2(0, 0);
    sprite.position.set(x, drawData.ORIGINAL_POSITION_RATIO * p.level, z);
    res[setId] = sprite;
    front_userData(sprite, 'name', setId);
    front_userData(sprite, 'belongto', pnId);
    front_userData(sprite, 'area', area);
  });
  return res;
}
function drawBusinessNode(geo = {}, mat = {}, pos = {}) {
  //两个对象：{x:1,...a} 不覆盖前面的1 增量更新  {...a,...b}后面的覆盖前面的
  const geometry = { ...drawData.ORIGINAL_GEO_SPHERE, ...geo };
  const defaultGeo = [geometry.radius, geometry.widthSegments, geometry.heightSegments];
  const defaultMat = { ...drawData.ORIGINAL_MATERIAL_SPHERE, ...mat };
  const bn = createSphere(defaultGeo, defaultMat);
  if (Object.keys(pos).length > 0) bn.position.set(pos.x, pos.y, pos.z);
  return bn;
}
//移动小光点
function createMoveSphere(posArray) {
  //此处用bn省事，免得再写一个方法
  const circleP = drawBusinessNode(
    {
      radius: 2.5,
      widthSegments: 5,
      heightSegments: 5,
    },
    {
      color: 'black',
      side: THREE.DoubleSide,
    },
    {
      x: posArray[0].x,
      y: posArray[0].y + drawData.ORIGINAL_POSITION_LINE2_OFFSET.y,
      z: posArray[0].z,
    }
  );
  return circleP;
}

//以下均为不引用别的函数的函数
//给创建字体精灵用：圆角矩形，矩形大小随文字长度改变
function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();

  ctx.setLineDash([2]);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
/* 创建字体精灵 */
function makeTextSprite(message, parameters, options = {}) {
  if (parameters === undefined) parameters = {};

  var fontFace = parameters.hasOwnProperty('fontFace') ? parameters['fontFace'] : 'Arial';

  /* 字体大小 */
  var fontSize = parameters.hasOwnProperty('fontSize') ? parameters['fontSize'] : 18;

  //字体颜色
  var fontColor = parameters.hasOwnProperty('fontColor')
    ? parameters['fontColor']
    : 'rgba(222, 222, 222, 1.0)';

  /* 边框厚度 */
  var borderThickness = parameters.hasOwnProperty('borderThickness')
    ? parameters['borderThickness']
    : 2;

  /* 边框颜色 */
  var borderColor = parameters.hasOwnProperty('borderColor')
    ? parameters['borderColor']
    : { r: 0, g: 0, b: 0, a: 1.0 };

  /* 背景颜色 */
  var backgroundColor = parameters.hasOwnProperty('backgroundColor')
    ? parameters['backgroundColor']
    : { r: 0, g: 0, b: 0, a: 1.0 };

  /* 创建画布 */
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  /* 字体加粗 */
  context.font = 'Bold ' + fontSize + 'px ' + fontFace;
  /* 获取文字的大小数据，高度取决于文字的大小 */
  var metrics = context.measureText(message);
  var textWidth = metrics.width;

  //注意设置宽高后 画布会重设 所以需要重新设置字体
  canvas.width = textWidth + borderThickness * 2;
  canvas.height = fontSize * 1.4 + borderThickness * 2;
  context.font = 'Bold ' + fontSize + 'px ' + fontFace;

  /* 背景颜色 */
  context.fillStyle =
    'rgba(' +
    backgroundColor.r +
    ',' +
    backgroundColor.g +
    ',' +
    backgroundColor.b +
    ',' +
    backgroundColor.a +
    ')';

  /* 边框的颜色 */
  context.strokeStyle =
    'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
  context.lineWidth = borderThickness;

  /* 绘制圆角矩形 ctx, x, y, w=textWidth + borderThickness, h=fontSize * 1.4 + borderThickness, r */
  if (options.rect === true) {
    drawRoundRect(
      context,
      borderThickness / 2,
      borderThickness / 2,
      textWidth + borderThickness,
      fontSize * 1.4 + borderThickness,
      6
    );
  }

  /* 字体颜色 */
  context.fillStyle = fontColor;
  context.fillText(message, borderThickness, fontSize + borderThickness);

  /* 画布内容用于纹理贴图 */
  var texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  spriteMaterial.transparent = true;
  spriteMaterial.sizeAttenuation = false;
  spriteMaterial.opacity = 0.8;
  // Whether rendering this material has any effect on the depth buffer. Default is true.
  spriteMaterial.depthWrite = false; //用于避免他的深度影响后面的平面的渲染
  var sprite = new THREE.Sprite(spriteMaterial);

  /* 缩放比例 */
  const ratio = canvas.width / canvas.height;
  sprite.scale.set(ratio * options.scale, options.scale, 0);

  return sprite;
}

function setPointY(nodes, init) {
  const l = nodes.length;
  for (let i = 0; i < l; i++) {
    let flag = 0;
    const node = nodes[i];
    //根据level来与drawData匹配
    init.forEach(p => {
      if (p.level == node.level) {
        flag = 1;
        node.locationY = drawData.ORIGINAL_POSITION_RATIO * p.level;
      } else if (typeof node.level === 'number') {
        flag = 1;
        node.locationY = drawData.ORIGINAL_POSITION_RATIO * node.level;
      }
    });
    if (flag === 0) {
      node.locationY = undefined;
    }
  }
}

function dispose(param, scene) {
  let objs = [];
  if (Object.prototype.toString.call(param) === '[object Object]') {
    objs = [param];
  }

  while (objs && objs.length) {
    const tmp = objs[objs.length - 1];
    if (tmp.hasOwnProperty('geometry')) tmp.geometry.dispose();
    if (tmp.hasOwnProperty('material')) {
      const material = tmp.material;
      if (Object.prototype.toString.call(material) === '[object Array]') {
        material.forEach(m => m.dispose());
      } else {
        tmp.material.dispose();
      }
    }
    tmp.userData = {};
    scene.remove(tmp);
    objs.pop();
  }
}

function disposeTmpObjs(objs, anime = [], scene) {
  if (anime.length > 0) {
    anime.forEach(v => {
      v.stop();
      TWEEN.remove(v);
    });
    anime.pop();
  }
  if (objs.length > 0) {
    objs.forEach(obj => {
      if (obj.hasOwnProperty('tmp') && obj.tmp) {
        obj.tmp = false;
        if (obj.hasOwnProperty('geometry')) obj.geometry.dispose();
        if (obj.hasOwnProperty('material')) obj.material.dispose();
        scene.remove(obj);
      }
    });
  }
}

function disposeOutlineObjs(outlinePass) {
  if (!outlinePass.selectedObjects || !outlinePass.selectedObjects.length) return;

  const { selectedObjects } = outlinePass;
  let target = [];
  for (let i = 0; i < selectedObjects.length; i++) {
    if (selectedObjects[i].tmp) {
      //将移动小球装入数组，以便后续删除
      target.push(selectedObjects[i]);
    }
  }
  outlinePass.selectedObjects = target;
}

function hideObj3D() {
  const _arguments = arguments;
  const _length = _arguments.length;
  for (let i = 0; i < _length; i++) {
    invisible(_arguments[i]);
  }
  function invisible(objs) {
    objs.forEach(o => (o.visible = false));
  }
}
function hideNodesAndSprites() {
  const _arguments = arguments;
  const _length = _arguments.length;
  for (let i = 0; i < _length; i++) {
    invisible(_arguments[i]);
  }
  function invisible(objs) {
    objs.forEach(o => (o.visible = false));
  }
}
function hideLinks() {
  const _arguments = arguments;
  const _length = _arguments.length;
  for (let i = 0; i < _length; i++) {
    invisible(_arguments[i]);
  }
  function invisible(objs) {
    objs.forEach(o => {
      o.visible = false;
    });
  }
}
function initVisual(orbitControl, planePos) {
  let min = 0,
    max = 0;
  for (let i in planePos) {
    if (min > planePos[i]) min = planePos[i];
    if (max < planePos[i]) max = planePos[i];
  }
  const mid = (min + max) / 2;
  orbitControl.object.position.set(
    drawData.ORIGINAL_POSITION_ORTHCAMERA.x,
    mid + 150,
    drawData.ORIGINAL_POSITION_ORTHCAMERA.z
  );
  orbitControl.target.set(0, mid, 0);
  orbitControl.update();
}

export {
  makeTextSprite,
  drawCamera,
  drawLight,
  drawPlane,
  drawSubNets,
  drawFatLine,
  setPointY,
  drawPlaneSprite,
  drawNodes,
  drawLinks,
  drawAlarms,
  drawServiceLinks,
  drawService2NodesDetail,
  drawService2Nodes,
  createMoveSphere,
  drawGridHelper,
  disposeTmpObjs,
  disposeOutlineObjs,
  hideObj3D,
  dispose,
  initVisual,
  hideNodesAndSprites,
  hideLinks,
};
