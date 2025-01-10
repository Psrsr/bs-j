import * as THREE from 'three';
//引入的顺序要注意，首先要运行initdata 和drawdata，然后才能是draw，然后servicemapping
//如果先引入servicemapping，那么此处有些函数需要的数据还没初始化就要被使用，会报错
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

function createCamera(type = '', params = []) {
  if (type === '' || params.length === 0) return null;
  let c;
  if (type === 'orth') {
    // 拓展运算符使用 返回数组中的各项 数组拆解
    c = new THREE.OrthographicCamera(...params);
  }
  return c;
}
function createLight(type = '', params = []) {
  if (type === '' || params.length === 0) return null;
  let l;
  if (type === 'ambient') {
    // 拓展运算符使用 返回数组中的各项 数组拆解
    l = new THREE.AmbientLight(...params);
  }
  return l;
}
function createBox(geoParams = [], matParams = {}) {
  const geo = new THREE.BoxGeometry(...geoParams);
  const mat = new THREE.MeshBasicMaterial(matParams); //MeshPhongMaterial
  return new THREE.Mesh(geo, mat);
}
function createSlope(geoParams = [], matParams = {}) {
  const geo = new THREE.PlaneGeometry(...geoParams);
  const mat = new THREE.MeshBasicMaterial(matParams);
  return new THREE.Mesh(geo, mat);
}
function createCircle(geoParams = [], matParams = {}) {
  const geo = new THREE.CircleGeometry(...geoParams);
  const mat = new THREE.MeshBasicMaterial(matParams);
  return new THREE.Mesh(geo, mat);
}

function createSphere(geoParams = [], matParams = {}) {
  const sphereGeo = new THREE.SphereGeometry(...geoParams);
  const sphereMa = new THREE.MeshBasicMaterial(matParams);
  const sphere = new THREE.Mesh(sphereGeo, sphereMa);
  return sphere;
}
function createShape(matParams = {}) {
  const acx1_1 = -10,
    acy1_1 = 9,
    acx2_1 = -4,
    acy2_1 = 8,
    x1 = -2,
    y1 = 6.5;
  const acx1_2 = 0,
    acy1_2 = 8,
    acx2_2 = 4,
    acy2_2 = 8,
    x2 = 6,
    y2 = 6;
  const acx1_3 = 12,
    acy1_3 = 8,
    acx2_3 = 12,
    acy2_3 = 1,
    x3 = 11,
    y3 = -1;
  const acx1_4 = 14,
    acy1_4 = -5,
    acx2_4 = 10,
    acy2_4 = -9,
    x4 = 5,
    y4 = -7;
  const acx1_5 = 3,
    acy1_5 = -9,
    acx2_5 = 0,
    acy2_5 = -9,
    x5 = -2,
    y5 = -7;
  const acx1_6 = -5,
    acy1_6 = -10,
    acx2_6 = -11,
    acy2_6 = -6,
    x6 = -10.5,
    y6 = -3.5;
  const acx1_7 = -15,
    acy1_7 = -1,
    acx2_7 = -15,
    acy2_7 = 1,
    x7 = -11,
    y7 = 2.5;
  const startx = -11,
    starty = 2.5;

  const mul = 10;
  const x = 0,
    y = 0;

  const heartShape = new THREE.Shape();

  heartShape.moveTo((x + startx) * mul, (y + starty) * mul);
  heartShape.bezierCurveTo(
    (x + acx1_1) * mul,
    (y + acy1_1) * mul,
    (x + acx2_1) * mul,
    (y + acy2_1) * mul,
    (x + x1) * mul,
    (y + y1) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_2) * mul,
    (y + acy1_2) * mul,
    (x + acx2_2) * mul,
    (y + acy2_2) * mul,
    (x + x2) * mul,
    (y + y2) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_3) * mul,
    (y + acy1_3) * mul,
    (x + acx2_3) * mul,
    (y + acy2_3) * mul,
    (x + x3) * mul,
    (y + y3) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_4) * mul,
    (y + acy1_4) * mul,
    (x + acx2_4) * mul,
    (y + acy2_4) * mul,
    (x + x4) * mul,
    (y + y4) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_5) * mul,
    (y + acy1_5) * mul,
    (x + acx2_5) * mul,
    (y + acy2_5) * mul,
    (x + x5) * mul,
    (y + y5) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_6) * mul,
    (y + acy1_6) * mul,
    (x + acx2_6) * mul,
    (y + acy2_6) * mul,
    (x + x6) * mul,
    (y + y6) * mul
  );
  heartShape.bezierCurveTo(
    (x + acx1_7) * mul,
    (y + acy1_7) * mul,
    (x + acx2_7) * mul,
    (y + acy2_7) * mul,
    (x + x7) * mul,
    (y + y7) * mul
  );
  const geometry = new THREE.ShapeGeometry(heartShape);
  const sphereMa = new THREE.MeshBasicMaterial(matParams);
  sphereMa.side = THREE.DoubleSide;
  const shape = new THREE.Mesh(geometry, sphereMa);
  return shape;
}
function createCylinder(geoParams = [], matParams = {}) {
  const geometry = new THREE.CylinderGeometry(...geoParams);
  const sphereMa = new THREE.MeshBasicMaterial(matParams);
  const cylinder = new THREE.Mesh(geometry, sphereMa);
  return cylinder;
}

function createCone(geoParams = [], matParams = {}) {
  const geometry = new THREE.ConeGeometry(...geoParams);
  const material = new THREE.MeshNormalMaterial(matParams);
  const cone = new THREE.Mesh(geometry, material);
  return cone;
}

function createLine(link = {}, matParams = {}) {
  const points = [];
  points.push(new THREE.Vector3(link.node1[0], link.node1[1], link.node1[2]));
  points.push(new THREE.Vector3(link.node2[0], link.node2[1], link.node2[2]));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial(matParams);
  const line = new THREE.Line(geometry, material);
  return line;
}
function createLine2(link = {}, randOfLine, matParams = {}) {
  const points = [];
  if (link.pos1[1] === link.pos2[1]) {
    //x,y,z  pos:x,y,z   y是一样的 x与z平面,
    const x = (link.pos1[0] + link.pos2[0]) / 2;
    const z = (link.pos1[2] + link.pos2[2]) / 2;
    let rand = randOfLine;

    const y = -265 + rand * 15;
    points.push(link.pos1[0], link.pos1[1], link.pos1[2]);
    points.push(x, y, z);

    points.push(link.pos2[0], link.pos2[1], link.pos2[2]);
    //gemoetry控制线段的断点位置
  } else {
    //x,y,z  pos:x,y,z   y是一样的 x与z平面,
    const x = (link.pos1[0] + link.pos2[0]) / 2;
    const z = (link.pos1[2] + link.pos2[2]) / 2;
    const y = (link.pos1[1] + link.pos2[1]) / 2;
    points.push(link.pos1[0], link.pos1[1], link.pos1[2]);
    points.push(x + 5, y, z);

    points.push(link.pos2[0], link.pos2[1], link.pos2[2]);
    //gemoetry控制线段的断点位置
  }
  const geometry = new LineGeometry();
  geometry.setPositions(points);
  //材质控制颜色
  const material = new LineMaterial(matParams);
  //虚线选项
  if (matParams.dashed) {
    material.dashed = true;
    material.linewidth = 3;
    material.defines.USE_DASH = '';
    material.needsUpdate = true;
  }

  const line2 = new Line2(geometry, material);
  line2.computeLineDistances();
  line2.scale.set(1, 1, 1);
  return line2;
}

 

function createPhysicLine2(link = {}, matParams = {}) {
  const points = [];
  points.push(link.pos1[0], link.pos1[1], link.pos1[2]);
  points.push(link.pos2[0], link.pos2[1], link.pos2[2]);
  //gemoetry控制线段的断点位置
  const geometry = new LineGeometry();
  geometry.setPositions(points);
  //材质控制颜色
  let material = new LineMaterial(matParams);
  if (link.pos1[1] != link.pos2[1]) {
    material = new LineMaterial({
      color: 0xababab,
      resolution: { x: window.innerWidth, y: window.innerHeight },
      dashed: false,
      visible: true,
      linewidth: 3,
      dashSize: 6,
      gapSize: 6,
    });
  }
  //虚线选项
  if (matParams.dashed) {
    material.dashed = true;
    material.linewidth = 8;
    material.defines.USE_DASH = '';
    material.needsUpdate = true;
  }
  const line2 = new Line2(geometry, material);
  line2.computeLineDistances();
  line2.scale.set(1, 1, 1);
  return line2;
}

export {
  createCamera,
  createLight,
  createBox,
  createSlope,
  createCircle,
  createShape,
  createSphere,
  createCylinder,
  createCone,
  createLine,
  createLine2,
  createPhysicLine2,
};
