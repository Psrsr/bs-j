import * as THREE from 'three';

import drawData from '../../data/drawData';

import { linkIdReverse, setLevelAndTypeOfLine } from '../utils/dataUtils';
import {
  createMoveSphere,
  disposeOutlineObjs,
  disposeTmpObjs,
  drawFatLine,
  hideNodesAndSprites,
  hideLinks,
} from '../draw/draw';

import { deepClone } from '../../utils';
import { front_userData, isType, _userData } from '../utils/userData';
import { memo_getVirtualPlaneId } from '../model/Plane';
import { createMoveByCurveAnime } from '../anime/anime';

const guideLink = [];

//由于同一位置的业务可能有多个，因此在创建辅助线的时候 避免重复
//guideline 需要两个特别的属性，offset和direction以设置业务线条的偏移
function createGuideLink(node1, node2) {
  const link = {
    id: node1.pnNodeId + '_' + node2.pnNodeId, //辅助线的id由两个端点生成，便于查找，如果生成uuid，则无法再查找到了
    level: [node1.level, node2.level],
    pos1: [node1.locationX, node1.locationY, node1.locationZ],
    pos2: [node2.locationX, node2.locationY, node2.locationZ],
    guideline: true,
    offset: drawData.SERVICE_LINE_PROPS.offset,
    direction: 0,
  };
  return link;
}

function setGuideline(line, flag) {
  line.guideline = flag;
}

function initServiceGuideLine(serviceData, data) {
  //由物理产生的辅助线
  data.link.forEach(v => {
    const { level, node1, node2, pos1, pos2 } = v;

    const link = createGuideLink(
      {
        pnNodeId: node1.id,
        level: level[0],
        locationX: pos1[0],
        locationY: pos1[1],
        locationZ: pos1[2],
      },
      {
        pnNodeId: node2.id,
        level: level[1],
        locationX: pos2[0],
        locationY: pos2[1],
        locationZ: pos2[2],
      }
    );
    addGuideLink(link, guideLink);
  });
  //由业务产生的辅助线
  serviceData.forEach((service, i) => {
    //vp层的线要画、vp——pp层之间的也要画
    //vp-pp
    const nodeIds = service.mapping.node;
    const vnodeIds = nodeIds.virtual;
    const pnodeIds = nodeIds.physical;

    for (let i = 0; i < vnodeIds.length; i++) {
      const node1 = nodeSearchInDataById(vnodeIds[i], data.node);
      const node2 = nodeSearchInDataById(pnodeIds[i], data.node);
      const link = createGuideLink(node1, node2);
      addGuideLink(link, guideLink);
    }
    //vp层则需要根据link来画
    const servicelinks = service.mapping.link.virtual;
    for (let i = 0; i < servicelinks.length; i++) {
      //对每个linkname进行处理
      const sl = servicelinks[i];
      const nodeId1 = sl.node1.id;
      const nodeId2 = sl.node2.id;
      const node1 = nodeSearchInDataById(nodeId1, data.node);
      const node2 = nodeSearchInDataById(nodeId2, data.node);
      const link = createGuideLink(node1, node2);
      addGuideLink(link, guideLink);
    }
  });
  function addGuideLink(link, guideLink) {
    if (
      link &&
      !guideLink.find(v => v.id === link.id) &&
      !guideLink.find(v => v.id === linkIdReverse(link.id))
    ) {
      guideLink.push(link);
    }
  }

  return guideLink;
}

//scene用于查找线
function initServiceMapping(scene, serviceData, data, init) {
  //显示所有的业务及其映射
  let mapLines = [];
  let vLines = [];
  let pLines = [];
  //初始不可见，之后通过业务名查找来一条条显示出来
  const visible = false;
  serviceData.forEach((service, i) => {
    const randomColor = 0xffffff * Math.random();

    const nodeMapping = service.mapping.node;
    const linkMapping = service.mapping.link;
    // 0xFFFFFF*Math.random() 生成随机颜色
    //为对应的节点画虚线
    const nodev = nodeMapping.virtual;
    const nodep = nodeMapping.physical;
    const map = createMappingLine(
      nodev,
      nodep,
      randomColor,
      scene,
      service.serviceid,
      visible,
      data,
      init
    );
    mapLines.push(...map);

    //为对应的链接画线,需要计算点的偏移以使线条偏移
    //两个对象数组
    const linkv = linkMapping.virtual;
    const linkp = linkMapping.physical;
    //画线需要端点
    //vp层链接
    const nodedata = data.node;
    const vp = createServiceLine(
      nodedata,
      linkv,
      randomColor,
      scene,
      service.serviceid,
      visible,
      init
    );
    vLines.push(...vp);
    //PP层链接(不止于p2在内的所有物理层链接)
    const pp = createServiceLine(
      nodedata,
      linkp,
      randomColor,
      scene,
      service.serviceid,
      visible,
      init
    );
    pLines.push(...pp);
  });

  return {
    mapLines,
    vLines,
    pLines,
  };
}

/*
v: (3) ["31", "32", "33"]
p: (3) ["26", "24", "28"]
*/
function createMappingLine(nodev, nodep, color, scene, serviceid, visible, data, init) {
  const res = [];
  for (let i = 0; i < nodev.length; i++) {
    //通过name找到对应的dashline
    const node1Id = nodev[i];
    const node2Id = nodep[i];

    const node1data = nodeSearchInDataById(node1Id, data.node);
    const node2data = nodeSearchInDataById(node2Id, data.node);

    //仅需要id来查询 物理线或辅助线， 然后计算新pos并返回
    //mappingline 一定没有物理线路的，物理线路跨层级只会存在于p1.p2之间
    const guideLinkId = node1data.pnNodeId + '_' + node2data.pnNodeId;
    const tmp = calLineOffset(guideLinkId);
    if (!tmp || tmp.length === 0) return [];
    //根据节点生成的link数据并没有node1和node2属性
    const newlink = {
      id: guideLinkId, //有待商榷
      level: [node1data.level, node2data.level],
      node1: { id: node1data.pnNodeId, port: undefined },
      node2: { id: node2data.pnNodeId, port: undefined },
      pos1: tmp[0],
      pos2: tmp[1],
    };

    const line = drawFatLine(newlink, { color, dashed: true }, { serviceid, visible });

    //设置level和type属性
    setLevelAndTypeOfLine(newlink, init, line);

    res.push(line);
  }

  return res;
}
/*
Array
0:
    id: "***"
    node1: {id: "31", port: ""}
    node2: {id: "32", port: ""}
1: {id: "***", node1: {…}, node2: {…}}
2: {id: "***", node1: {…}, node2: {…}}
*/
function createServiceLine(nodedata, linkservicedata, color, scene, serviceid, visible, init) {
  const res = [];
  for (let i = 0; i < linkservicedata.length; i++) {
    const serviceLink = linkservicedata[i];
    const { id } = serviceLink;

    let node1, node2;
    for (let i = 0; i < nodedata.length; i++) {
      if (nodedata[i].pnNodeId === serviceLink.node1.id) node1 = nodedata[i];
      if (nodedata[i].pnNodeId === serviceLink.node2.id) node2 = nodedata[i];
      if (node1 && node2) break;
    }
    const guideLinkId = serviceLink.node1.id + '_' + serviceLink.node2.id;

    if (node1 && node2) {
      const tmp = calLineOffset(guideLinkId);
      if (!tmp || tmp.length === 0) return [];
      const newlink = {
        id: id, //业务线直接使用后台传入的id
        level: [node1.level, node2.level],
        node1: serviceLink.node1,
        node2: serviceLink.node2,
        pos1: tmp[0],
        pos2: tmp[1],
      };
      const line = drawFatLine(newlink, { color }, { serviceid, visible });

      setLevelAndTypeOfLine(newlink, init, line);

      res.push(line);
    }
  }
  return res;
}

//对line.drawoffset进行加一 以控制偏移量
//通过line.drawDirection来控制偏移方向
/*
四个方向偏移
0 右 1左 2右上 3左上
line.drawDirection++以后 对4取余数 来决定方向
        const node2 = {
            id: node2Id,
            pos: node2pos,
        };
输入原始data中的端点，找到最初连线的lineObj3D，根据
*/
function calLineOffset(linkId) {
  //根据名称找到lineObj3D
  let link = linkSearchInGuideLink(linkId);
  if (!link) return null;

  let offset = link.offset;
  let direction = link.direction;

  const tmpPos1 = deepClone(link.pos1);
  const tmpPos2 = deepClone(link.pos2);
  //计算line与x轴的夹角 +-45以内 变动x  以外变动z
  const angle = calAngleWithX(tmpPos1, tmpPos2);
  let state;
  if (angle <= 45 && angle >= -45) state = 'z';
  else state = 'x';
  //0右 x++
  //1左 x--
  //2右上 x++ y++
  //3左上 x-- y++
  switch (direction) {
    case 0:
      if (state === 'x') {
        tmpPos1[0] += offset;
        tmpPos2[0] += offset;
      } else if (state === 'z') {
        tmpPos1[2] += offset;
        tmpPos2[2] += offset;
      }
      break;
    case 1:
      if (state === 'x') {
        tmpPos1[0] -= offset;
        tmpPos2[0] -= offset;
      } else if (state === 'z') {
        tmpPos1[2] -= offset;
        tmpPos2[2] -= offset;
      }
      break;
    case 2: //右上
      offset = offset / Math.sqrt(2);
      if (state === 'x') {
        tmpPos1[0] += offset;
        tmpPos2[0] += offset;

        tmpPos1[1] += offset / 2;
        tmpPos2[1] += offset / 2;
      } else if (state === 'z') {
        tmpPos1[2] += offset;
        tmpPos2[2] += offset;

        tmpPos1[1] += offset / 2;
        tmpPos2[1] += offset / 2;
      }
      break;
    case 3: //左上
      offset = offset / Math.sqrt(2);
      if (state === 'x') {
        tmpPos1[0] -= offset;
        tmpPos2[0] -= offset;

        tmpPos1[1] += offset / 2;
        tmpPos2[1] += offset / 2;
      } else if (state === 'z') {
        tmpPos1[2] -= offset;
        tmpPos2[2] -= offset;

        tmpPos1[1] += offset / 2;
        tmpPos2[1] += offset / 2;
      }
      break;
    default:
      break;
  }
  link.direction = (link.direction + 1) % 4;

  if (link.direction === 0) {
    link.offset += drawData.SERVICE_LINE_PROPS.offset;
  }

  return [tmpPos1, tmpPos2];
}

//计算某个平面上的线与x轴的夹角，直接当成二维平面进行计算
//输入两个端点的原始data,返回角度 -90~+90
function calAngleWithX(a, b) {
  let v;
  if (a[0] > b[0]) v = new THREE.Vector2(a[0] - b[0], a[2] - b[2]);
  else v = new THREE.Vector2(b[0] - a[0], b[2] - a[2]);
  const angle = (v.angle() * 180) / Math.PI;
  return angle;
}

function nodeSearchInDataById(nodeId, nodesdata) {
  const l = nodesdata.length;
  for (let i = 0; i < l; i++) {
    const nodedata = nodesdata[i];
    if (nodedata.pnNodeId === nodeId) return nodedata;
  }
  return null;
}
//应该有两种查找link的方法：1.查找映射线条，这种线条没有

function linkSearchInGuideLink(linkId) {
  const id = linkId;
  const idR = linkIdReverse(linkId);
  for (let i = 0; i < guideLink.length; i++) {
    const gl = guideLink[i];

    if (!gl.guideline) continue;

    if (gl.id === id) {
      return gl;
    } else if (gl.id === idR) {
      //说明应该返回的是反向的link，这样link的方向就不会发生错误
      /*辅助线数据结构
             * {
                    id: node1.id + '_' + node2.id,
                    level: [node1.level, node2.level],
                    pos1: node1.pos,
                    pos2: node2.pos,
                    guideline: true,
                    offset: drawData.SERVICE_LINE_PROPS.offset,
                    direction: 0,
                }
             */
      return {
        ...gl,
        level: [gl.level[1], gl.level[0]],
        pos1: gl.pos2,
        pos2: gl.pos1,
      };
    }
  }
  return null;
}

function setServiceid(line, serviceid) {
  front_userData(line, 'serviceid', serviceid);
}

function findServiceDataById(serviceid, servicedata, data) {
  const length = servicedata.length;
  for (let i = 0; i < length; i++) {
    let res = servicedata[i];

    if (res.stream_id === serviceid) {
      return res;
    }
  }
  return null;
}
//TSN
function findServiceDataById3(serviceid, servicedata, data) {
  const points = []; //存储所有经过的点
  const length = servicedata.length;
  for (let i = 0; i < length; i++) {
    let res = servicedata[i];

    if (res.stream_id === serviceid) {
      let serviceLinks = [];
      //对当前业务相关的link进行提取
      const stream_id = res.stream_id;
      serviceLinks = res.serviceChannelTable.map(service => {
        if (res.linkColor === undefined) res.linkColor = '#ff33cc'; //缺省颜色（用于业务详情页面）
        return {
          connectionId: service.connection_id,
          nodeId1: service.src_node_id,
          nodeId2: service.dst_node_id,
          node1Pos: service.linkSourceNodePos,
          node2Pos: service.linkTargetNodePos,
          linkColor: res.linkColor,
          randOfLine: res.randOfLine,
          serviceid: stream_id,
        };
      });
      console.log('serviceLinks', serviceLinks);
      //对提取的links的每一段进行重复计算，复现拐点
      serviceLinks.forEach((link, index) => {
        let offsety = 3;
        let pos1 = link.node1Pos;
        let pos2 = link.node2Pos;
        if (pos1[1] === pos2[1]) {
          pos1[1] = pos1[1] + offsety;
          pos2[1] = pos2[1] + offsety;
        }
        if (pos1[1] === pos2[1]) {
          //x,y,z  pos:x,y,z   y是一样的 x与z平面,
          const x = (pos1[0] + pos2[0]) / 2;
          const z = (pos1[2] + pos2[2]) / 2;
          let rand = link.randOfLine;
          const y = -265 + rand * 15;
          points.push({
            x: pos1[0],
            y: pos1[1],
            z: pos1[2],
          });
          points.push({ x: x, y: y, z: z });

          points.push({
            x: pos2[0],
            y: pos2[1],
            z: pos2[2],
          });
          //gemoetry控制线段的断点位置
        } else {
          //x,y,z  pos:x,y,z   y是一样的 x与z平面,
          const x = (pos1[0] + pos2[0]) / 2;
          const z = (pos1[2] + pos2[2]) / 2;
          const y = (pos1[1] + pos2[1]) / 2;
          points.push({
            x: pos1[0],
            y: pos1[1],
            z: pos1[2],
          });
          points.push({ x: x + 5, y: y, z: z });

          points.push({
            x: pos2[0],
            y: pos2[1],
            z: pos2[2],
          });
          //gemoetry控制线段的断点位置
        }
      });
      res = {
        posArray: points,
        mappingPoint: [],
      };

      return res;
    }
  }
  return null;
}
function findServiceDataById2(serviceid, servicedata, data) {
  const length = servicedata.length;
  for (let i = 0; i < length; i++) {
    let res = servicedata[i];
    //console.log('before', servicedata);
    if (res.stream_id === serviceid) {
      let serviceLinks = [];
      //对当前业务相关的link进行分端点提取
      const stream_id = res.stream_id;
      let src_node = res.talker.node_id;
      let newTableOfConnection = res.serviceChannelTable;
      serviceLinks = res.listeners.map(listener => {
        let aMultiCastLink = [];
        let tar_node = listener.node_id;
        let temp_node = tar_node;
        let count1 = 0;
        while (temp_node != src_node && count1 < 1000) {
          count1++;
          for (let j = 0; j < res.serviceChannelTable.length; j++) {
            if (res.serviceChannelTable[j].dst_node_id == temp_node) {
              temp_node = res.serviceChannelTable[j].src_node_id;
              aMultiCastLink.push(res.serviceChannelTable[j]);
            }
          }
        }
        if (temp_node == src_node) if (res.linkColor === undefined) res.linkColor = '#ff33cc'; //缺省颜色（用于业务详情页面）
        //console.log('aMultiCastLink', aMultiCastLink);
        let re = aMultiCastLink.map(service => {
          return {
            connectionId: service.connection_id,
            nodeId1: service.src_node_id,
            nodeId2: service.dst_node_id,
            node1Pos: service.linkSourceNodePos,
            node2Pos: service.linkTargetNodePos,
            linkColor: res.linkColor,
            randOfLine: res.randOfLine,
            serviceid: stream_id,
          };
        });
        return re;
      });

      //console.log('serviceLinks', serviceLinks);
      let result = [];
      //对提取的links的每一段进行重复计算，复现拐点
      serviceLinks.forEach(serviceLink => {
        let points = []; //存储所有经过的点
        serviceLink.forEach((link, index) => {
          let offsety = 3;
          let pos1 = link.node1Pos;
          let pos2 = link.node2Pos;
          if (pos1[1] === pos2[1]) {
            pos1[1] = pos1[1] + offsety;
            pos2[1] = pos2[1] + offsety;
          }
          if (pos1[1] === pos2[1]) {
            //x,y,z  pos:x,y,z   y是一样的 x与z平面,
            const x = (pos1[0] + pos2[0]) / 2;
            const z = (pos1[2] + pos2[2]) / 2;
            let rand = link.randOfLine;
            //const y = -265 + Math.random() * 15;
            const y = -265 + rand * 15;
            points.push({
              x: pos2[0],
              y: pos2[1],
              z: pos2[2],
            });
            points.push({ x: x, y: y, z: z });
            //console.log(pos1[1]);
            points.push({
              x: pos1[0],
              y: pos1[1],
              z: pos1[2],
            });
            //gemoetry控制线段的断点位置
          } else {
            //x,y,z  pos:x,y,z   y是一样的 x与z平面,
            const x = (pos1[0] + pos2[0]) / 2;
            const z = (pos1[2] + pos2[2]) / 2;
            const y = (pos1[1] + pos2[1]) / 2;
            points.push({
              x: pos2[0],
              y: pos2[1],
              z: pos2[2],
            });
            points.push({ x: x + 5, y: y, z: z });
            //console.log(link.pos1[1]);
            points.push({
              x: pos1[0],
              y: pos1[1],
              z: pos1[2],
            });
            //gemoetry控制线段的断点位置
          }
        });
        let aRes = {
          posArray: points,
          mappingPoint: [],
        };
        //console.log('points:', aRes);
        result.push(aRes);
      });
      return result;
    }
  }
  return null;
}
//TSN
function chooseServiceData(dbclicked, type = 'all', scene, serviceData, data) {
  if (!_userData(dbclicked, 'front', 'serviceid'))
    return { mappingLink: [], mappingPoint: [], mappingService: [], posArray: [] };
  const chooseServiceId = _userData(dbclicked, 'front', 'serviceid');
  //通过serviceid找到业务数据
  const service = findServiceDataById2(chooseServiceId, serviceData, data);
  if (!service) return { mappingLink: [], mappingPoint: [], mappingService: [], posArray: [] };

  //如果是sub  但是数据里面没有sub 也是全部显示
  //点击面板触发全部业务线条和节点显示
  let res = [];
  service.forEach(element => {
    res.push({
      mappingPoint: element.mappingPoint,
      mappingService: [chooseServiceId],
      posArray: element.posArray,
    });
  });
  console.log('gggggggg', res);
  return res;
  // return {
  //   mappingPoint: service.mappingPoint, //getServiceNodeId(plinks, vlinks), //所有的业务相关节点id
  //   mappingService: [chooseServiceId], //
  //   posArray: service.posArray, //getServiceNodePositionInP(plinks, chooseServiceId, scene), //业务节点的顺序位置(包括产生弧度的虚拟节点)
  // };
}
//业务线的名称需要结合serviceid，以选中单个业务线而不是两点之间所有的线
//从vp层开始弄的
function chooseServiceMapping(dbclicked, type = 'all', scene, serviceData) {
  if (!_userData(dbclicked, 'front', 'serviceid'))
    return { mappingLink: [], mappingPoint: [], mappingService: [], posArray: [] };
  const chooseServiceId = _userData(dbclicked, 'front', 'serviceid');
  //通过serviceid找到业务数据
  const service = findServiceDataById(chooseServiceId, serviceData);
  if (!service) return { mappingLink: [], mappingPoint: [], mappingService: [], posArray: [] };

  const { mapping } = service;

  //如果是sub  但是数据里面没有sub 也是全部显示
  //点击面板触发全部业务线条和节点显示

  let plinks = mapping.link.physical;
  let vlinks = mapping.link.virtual;

  return {
    mappingPoint: getServiceNodeId(plinks, vlinks), //所有的业务相关节点id
    mappingService: [chooseServiceId], //
    posArray: getServiceNodePositionInP(plinks, chooseServiceId, scene), //业务节点在物理层的顺序位置
  };

  function getServiceNodeId(plinks, vlinks) {
    const res = [];
    vlinks.concat(plinks).forEach(v => {
      res.push(v.node1.id, v.node2.id);
    });
    //去重
    return Array.from(new Set(res));
  }

  //使小球根据业务线移动,找到业务线 然后从recordPos中取出位置即可
  function getServiceNodePositionInP(plinks, chooseServiceId, scene) {
    const res = [];
    for (let i = 0; i < plinks.length; i++) {
      const line = searchServiceLineInScene(plinks[i].id, chooseServiceId, scene);
      const pos6 = _userData(line, 'front', 'recordPos');
      if (!pos6) console.log('pos error');
      const pos = {
        node1: [pos6[0], pos6[1], pos6[2]],
        node2: [pos6[3], pos6[4], pos6[5]],
      };
      res.push(pos);
    }
    return res;
  }
}
// 立即执行函数，定义的时候立即执行，返回了一个新函数。。。。
// 不知道为什么这样定义。。。。
const showService = (function () {
  let recordNodesAndSprites = [];
  let recordLines = [];
  let recordServiceId = null;

  return (chooseServiceRes, outlinePass, scene, serviceId, init, data, serviceData) => {
    //当初始显示业务后，点击frame时，会产生这种情况
    if (recordServiceId === serviceId) return;

    //隐藏由于单击产生的outlinePass效果
    disposeOutlineObjs(outlinePass);

    //隐藏上次显示的service
    if (recordServiceId) {
      hideNodesAndSprites(recordNodesAndSprites);
      hideLinks(recordLines);
      // 隐藏业务信息时，把业务层也一起隐藏
      scene.children.forEach(obj => {
        if (
          _userData(obj, 'front', 'draw') === 'plane' &&
          _userData(obj, 'front', 'type') === 'virtual'
        )
          obj.material.opacity = 0;
      });
      scene.children.forEach(obj => {
        if (
          _userData(obj, 'front', 'draw') === 'Line2' &&
          _userData(obj, 'front', 'cloud') !== ''
        ) {
          let area = obj.userData.front.cloud;
          scene.children.forEach(obj2 => {
            // 隐藏相关云
            if (
              _userData(obj2, 'front', 'draw') === 'plane' &&
              _userData(obj2, 'front', 'area') === area
            )
              obj2.material.opacity = 0;
          });
        }
      });
      recordLines = [];
      recordNodesAndSprites = [];
      disposeOutlineObjs(outlinePass);
      disposeTmpObjs(outlinePass.selectedObjects, outlinePass.recordAnime, scene);
    }
    if (!serviceId) {
      recordServiceId = null;
      return;
    }

    //显示本次service
    const { mappingPoint, posArray } = chooseServiceRes;
    if (!posArray || posArray.length === 0) return;
    const circleP = createMoveSphere(posArray);
    scene.add(circleP);
    //标记 便于在outlinepass中dispose
    circleP.tmp = true;
    const anime = createMoveByCurveAnime(posArray, circleP);
    outlinePass.selectedObjects.push(circleP);
    //记录一下动画，便于之后stop
    if (Array.isArray(outlinePass.recordAnime)) {
      outlinePass.recordAnime.push(anime);
    } else {
      outlinePass.recordAnime = [anime];
    }

    scene.children.forEach(obj => {
      // 显示业务中节点对应的云
      for (let i = 0; i < mappingPoint.length; i++) {
        if (
          mappingPoint[i] === _userData(obj, 'front', 'id') &&
          _userData(obj, 'front', 'cloud') !== ''
        ) {
          let area = obj.userData.front.cloud;
          scene.children.forEach(obj2 => {
            if (
              _userData(obj2, 'front', 'draw') === 'plane' &&
              _userData(obj2, 'front', 'area') === area
            ) {
              obj2.material.opacity = 0.6;
            }
          });
        }
      }
    });

    scene.children.forEach(obj => {
      // 显示业务中节点对应的云中的其他节点、链接和云与三个大端口的链接
      for (let i = 0; i < mappingPoint.length; i++) {
        if (
          mappingPoint[i] === _userData(obj, 'front', 'id') &&
          _userData(obj, 'front', 'cloud') !== ''
        ) {
          let area = obj.userData.front.cloud;
          scene.children.forEach(obj2 => {
            // 点亮其他节点
            if (
              (_userData(obj2, 'front', 'draw') === 'node' ||
                _userData(obj2, 'front', 'draw') === 'nodeSprite') &&
              _userData(obj2, 'front', 'cloud') === area
            ) {
              obj2.visible = true;

              recordNodesAndSprites.push(obj2);
            }
            // 点亮链接
            if (
              _userData(obj2, 'front', 'draw') === 'Line2' &&
              _userData(obj2, 'front', 'cloud') === area
            ) {
              // 链接的显示与隐藏有一些问题，两种方式都可以隐藏，都写上吧
              obj2.material.visible = true;
              obj2.visible = true;
              recordLines.push(obj2);
            }
          });
        }
      }
    });

    const l2 = mappingPoint.length;
    scene.children.forEach((obj, index) => {
      if (
        _userData(obj, 'front', 'draw') === 'plane' &&
        _userData(obj, 'front', 'type') === 'virtual'
      ) {
        obj.material.opacity = 0.6;
      }
      // 将业务涉及到的节点全部高亮
      for (let i = 0; i < mappingPoint.length; i++) {
        if (mappingPoint[i] === _userData(obj, 'front', 'id')) {
          if (memo_getVirtualPlaneId()[0] === _userData(obj, 'front', 'level')) continue;
          //重复添加至outlinePass会导致物体隐形
          outlinePass.selectedObjects.push(obj);
        }
      }

      for (let j = 0; j < l2; j++) {
        // 如果是业务有关的节点
        if (_userData(obj, 'front', 'id') === mappingPoint[j]) {
          // 物理层的节点不需要记录
          if (_userData(obj, 'front', 'type') === 'physical') return;
          const sprite = _userData(obj, 'front', 'sprite');
          obj.visible = true;
          sprite.visible = true;
          recordNodesAndSprites.push(obj, sprite);
        }
      }

      if (_userData(obj, 'front', 'serviceid') === serviceId) {
        obj.visible = true;
        recordLines.push(obj);
      }

      recordServiceId = serviceId;
    });
  };
})();

function highlightNode(obj3D, outlinePass, scene) {
  if (isType(obj3D, 'node')) {
    const { selectedObjects } = outlinePass;
    disposeTmpObjs(selectedObjects, outlinePass.recordAnime, scene);
    outlinePass.selectedObjects = [obj3D];
  }
}

function appendHighlightNode(obj3D, outlinePass, scene) {
  if (isType(obj3D, 'node')) {
    const { selectedObjects } = outlinePass;
    disposeTmpObjs(selectedObjects, outlinePass.recordAnime, scene);
    if (selectedObjects.indexOf(obj3D) === -1) selectedObjects.push(obj3D);
  }
}

function searchServiceLineInScene(id, serviceid, scene) {
  // 名称和业务id查找obj
  const objs = scene.children;
  const l = objs.length;
  for (let i = 0; i < l; i++) {
    const obj = objs[i];
    if (_userData(obj, 'front', 'id') === id) {
      // debugger
      if (_userData(obj, 'front', 'serviceid') === serviceid) return objs[i];
    }
  }
  //找不到
  return null;
}

export {
  initServiceGuideLine,
  chooseServiceData,
  chooseServiceMapping,
  initServiceMapping,
  setServiceid,
  setGuideline,
  showService,
  highlightNode,
  appendHighlightNode,
};
