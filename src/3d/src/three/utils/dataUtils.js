import * as THREE from 'three';
import { memo_getVirtualPlaneId } from '../model/Plane';
import { front_userData } from './userData';
import { deepClone } from '../../utils';
import drawData from '../../data/drawData';
import { node } from 'webpack';

//给link数据加上position
function calLine_new(links, nodes) {
  if (!links || links == []) return []; //对空结果进行处理
  let tmp = [];
  if (!Array.isArray(links)) {
    tmp.push(links);
    links = tmp;
  }
  //找到link中node1和node2的位置
  const link_with_pos_level = links.map(link => {
    let start = null;
    let end = null;
    let node1Pos, node2Pos;
    for (let j = 0; j < nodes.length; j++) {
      const node = nodes[j];
      if (node.nodeId === link.nodeId1) {
        start = node.nodeId;
        node1Pos = [node.locationX, node.locationY, node.locationZ];
      }
      if (node.nodeId === link.nodeId2) {
        end = node.nodeId;
        node2Pos = [node.locationX, node.locationY, node.locationZ];
      }
      if (start && end) {
        break;
      }
    }
    return {
      ...link,
      node1Pos,
      node2Pos,
    };
  });
  return link_with_pos_level;
}

function calLine(links, nodes) {
  let tmp = [];
  if (!Array.isArray(links)) {
    tmp.push(links);
    links = tmp;
  }
  //找到link中node1和node2的位置
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    let start = null,
      end = null;
    let node1level, node2level;
    for (let j = 0; j < nodes.length; j++) {
      const node = nodes[j];
      if (node.id === link.node1.id) {
        start = node.id;
        node1level = node.level;
        link.node1 = node.pos;
      }
      if (node.id === link.node2.id) {
        end = node.id;
        node2level = node.level;
        link.node2 = node.pos;
      }
      if (start && end) {
        link.level = [node1level, node2level];
        break;
      }
    }
  }
}

/*
根据linkp数据来找到type
*/
function findLinkType(link, init) {
  let linkType = 'physical';
  //三种type: physical\virtual\mapping
  init.forEach(plane => {
    const { pnId, type } = plane;
    const [node1level, node2level] = link.level; //两个id
    if (node1level === node2level && node1level === pnId.slice(0, 3)) linkType = type;
    else if (node1level !== node2level) {
      //不在同一层，则分为两种情况
      //有一个在虚拟层
      if (
        memo_getVirtualPlaneId(init).indexOf(node1level) !== -1 ||
        memo_getVirtualPlaneId(init).indexOf(node2level) !== -1
      )
        linkType = 'mapping';
    }
  });
  return linkType;
}
//方法适用于给drawFatLine后的 缺少level和type属性的线条添加属性
function setLevelAndTypeOfLine(linkp, init, line) {
  //type分三种 ： physical\virtual\mapping
  let linkType = findLinkType(linkp, init);
  //设定line层级
  front_userData(line, 'level', linkp.level);
  front_userData(line, 'type', linkType);
}

//根据controls中target为圆心,object.position为球上一点计算半径的 球极坐标系到xyz坐标转换
//             orgin                  point
function calbtSphereAndPos(phi, theta, origin, point) {
  const newphi = (phi * Math.PI) / 180;
  const newtheta = (theta * Math.PI) / 180;

  const r = point.distanceTo(origin);
  const x = r * Math.sin(newphi) * Math.sin(newtheta) + origin.x;
  const y = r * Math.cos(newphi) + origin.y;
  const z = r * Math.sin(newphi) * Math.cos(newtheta) + origin.z;
  return new THREE.Vector3(x, y, z);
}

//链接名 反过来
function linkIdReverse(linkId) {
  const i = linkId.search('_');
  if (i === -1) return null;
  const n1 = linkId.slice(0, i);
  const n2 = linkId.slice(i + 1);
  linkId = n2 + '_' + n1;
  return linkId;
}

//将链接名分开成两个节点名称
function linkIdSplit(linkId) {
  if (!(typeof linkId === 'string')) return null;

  const i = linkId.search('_');
  if (i === -1) return null;
  const n1 = linkId.slice(0, i);
  const n2 = linkId.slice(i + 1);
  return [n1, n2];
}
function change_linksTSN(links) {
  let linksCopy = deepClone(links);

  for (let k = 0; k < linksCopy.length; k++) {
    linksCopy[k].nodeId1 = linksCopy[k].src_node_id;
    linksCopy[k].nodeId2 = linksCopy[k].dst_node_id;
    linksCopy[k].connectionId = linksCopy[k].link_id;
  }
  return linksCopy;
}
function change_linksAlgo(links,nodes,res) {
  let linksCopy = deepClone(links);
  let nodesCopy = deepClone(nodes);

  for (let k = 0; k < linksCopy.length; k++) {
    linksCopy[k].nodeId1 = linksCopy[k].source;
    linksCopy[k].nodeId2 = linksCopy[k].target;
    linksCopy[k].connectionId = linksCopy[k].id;
  }

  //加控制信道
  // if(res!=undefined){
  //   res=res[0];
  //   let X=res.length;
  //   let nc= Math.max((nodes.length/10),1);   
  //   let ns=nodes.length;
  //   for(let i=0;i<res.length;i++){

  //     linksCopy.push({
  //       linksCopy[k].nodeId1 : linksCopy[k].source,
  //       linksCopy[k].nodeId2 : linksCopy[k].target,
  //       linksCopy[k].connectionId : linksCopy[k].id,
  //     });
  //   }
  // }
  return linksCopy;
}
function change_nodesAlgo(nodes,res,init,type) {

  let nodesCopy = deepClone(nodes);
  let lev = -1;

  for (let k = 0; k < nodesCopy.length; k++) {
    let newY = [];
    if (lev == 0) {
      newY = 120;
    } else {
      newY = drawData.ORIGINAL_POSITION_RATIO * lev;
    }
    nodesCopy[k].location_y = newY; //这里改成按照节点层数修改y坐标以匹配不同平面
    nodesCopy[k].level = lev;

    nodesCopy[k].locationX = nodesCopy[k].locationX*(30)-3000;
    nodesCopy[k].locationZ = nodesCopy[k].locationY*(30)-1200;
    nodesCopy[k].locationY = nodesCopy[k].location_y;
    nodesCopy[k].nodeId = nodesCopy[k].id;
    nodesCopy[k].nodeType='bridge';
    nodesCopy[k].nodeName = nodesCopy[k].name;
  }
  if(res!=undefined&&type=="service"){
    res=res[0];
    let X=res.length;
    let nc= Math.floor(Math.max((nodes.length/10),1));   
    let ns=nodes.length;
    for(let i=1;i<=nc;i++){
      nodesCopy.push({
        location_y: -270,
        level : 0,
        locationX : res[2*i]*(600/180),
        locationZ : res[2*i+1]*(600/180),
        locationY : -270,
        nodeId : nodes.length+1,
        nodeType:'controller',
        nodeName : 'Controller'+i,
        id: nodes.length+1,
        name: 'Controller'+i,
      });
    }
  }
  return nodesCopy;

}
function change_nodes(nodes, init) {
  let nodesCopy = deepClone(nodes);
  let lev = -1;

  for (let k = 0; k < nodesCopy.length; k++) {
    lev = -1;
    if (nodesCopy[k].node_type == 'end' && nodesCopy[k].node_name != '柱状开关') {
      lev = 0;
    }
    let newY = [];
    if (lev == 0) {
      newY = 120;
    } else {
      newY = drawData.ORIGINAL_POSITION_RATIO * lev;
    }
    nodesCopy[k].location_y = newY; //这里改成按照节点层数修改y坐标以匹配不同平面
    nodesCopy[k].level = lev;

    nodesCopy[k].locationX = nodesCopy[k].location_x;
    nodesCopy[k].locationY = nodesCopy[k].location_y;
    nodesCopy[k].locationZ = nodesCopy[k].location_z;
    nodesCopy[k].nodeId = nodesCopy[k].node_id;
    nodesCopy[k].nodeType = nodesCopy[k].node_type;
    nodesCopy[k].nodeName = nodesCopy[k].node_name;
  }
  return nodesCopy;
}
//整理拓扑上的告警信息数据
function sortAlarmInfo(data, alarms) {
  let alarmsCopy = deepClone(alarms);
  const node = data.node;
  const link = data.link;
  const alarmNodes = [];
  const alarmLinks = [];
  alarmsCopy.forEach(item => {
    if (item.objectType === 'node') alarmNodes.push(item);
    else if (item.objectType === 'link') alarmLinks.push(item);
  });
  const posWithAlarmNodes = alarmNodes.map(aNode => {
    let nodeInfo = null;
    for (let i = 0; i < node.length; i++) {
      if (aNode.alarmObjectId === node[i].nodeId) {
        nodeInfo = node[i];
      }
    }
    return {
      ...aNode,
      ...nodeInfo,
    };
  });
  const posWithAlarmLinks = alarmLinks.map(aLink => {
    let linkfo = null;
    for (let i = 0; i < link.length; i++) {
      if (aLink.alarmObjectId === link[i].connectionId) {
        linkfo = link[i];
      }
    }
    return {
      ...aLink,
      ...linkfo,
    };
  });
  const res = posWithAlarmNodes.concat(posWithAlarmLinks);
  return res;
}

//初始化node数据和link数据
function node_link_local(nodes, links) {
  let linksCopy = deepClone(links);
  let nodesCopy = deepClone(nodes);
  linksCopy = calLine_new(linksCopy, nodesCopy);
  const node = nodesCopy;
  const link = linksCopy;
  return {
    node,
    link,
  };
}
function change_init(init) {
  const initCopy = deepClone(init);
  const new_init = initCopy.map(plane => {
    let {
      pnId,
      subId,
      pnName,
      type,
      area,
      level,
      locationX,
      locationY,
      locationZ,
      rotateX,
      rotateY,
      rotateZ,
      scale,
    } = plane;
    return {
      pnId,
      subid: subId,
      pnName,
      type,
      area,
      level,
      locationX,
      locationY,
      locationZ,
      rotateX,
      rotateY,
      rotateZ,
      scale,
    };
  });
  return new_init;
}

function change_links(links) {
  const linksCopy = deepClone(links);
  const new_links = linksCopy.map(link => {
    let {
      pnLinkId,
      pnNodeId1,
      pnPortId1,
      pnNodeId2,
      pnPortId2,
      pnType1,
      pnType2,
      pnName1,
      pnName2,
    } = link;
    return {
      id: pnLinkId,
      node1: {
        nodeType: pnType1,
        nodeName: pnName1,
        id: pnNodeId1,
        port: pnPortId1,
      },
      node2: {
        nodeType: pnType2,
        nodeName: pnName2,
        id: pnNodeId2,
        port: pnPortId2,
      },
    };
  });
  return new_links;
}

function change_services(services, nodes, changedNodes,topoInfo) {
  if (services === null || services === undefined) return [];
  console.log("ss",services);

  let res={
    sourceNodePos: [0,0,0],
    targetNodePos: [0,0,0],
    stream_id:topoInfo.nid,
    serviceChannelTable: [],
  };
  let service=services[0];
  let X=service.length;
  let nc= Math.floor(Math.max((nodes.length/10),1));   
  let ns=nodes.length;
  console.log("X:",nc,ns,X);
  for(let i=0;i<nc;i++){
    let c=changedNodes[i+nodes.length];//控制器i,对应的连接关系位于X【 nc*2+ns+i*s : nc*2+ns+(i+1)*s 】
    let s=[];
    for(let j=0; j<ns; j++){
      let ts= nc*2+ns+i*ns+j;
      if(service[ts]==1){
        s=changedNodes[j];//控制器i直连的 交换机节点
        // j=ns;//跳出
        //把cs链接加入
        let node1Pos=[];let node2Pos=[];
        node1Pos.push(c.locationX,c.locationY,c.locationZ);
        node2Pos.push(s.locationX,s.locationY,s.locationZ);  
        res.serviceChannelTable.push({
          linkSourceNodePos: node1Pos,
          linkTargetNodePos: node2Pos,
          dst_node_id:i+nodes.length,
          src_node_id:j,
        })
      }
    }
  }
  return res;
  // const servicesCopy = deepClone(services);

  // const new_services = servicesCopy.map(service => {
  //   let node1Pos = [];
  //   let node2Pos = [];



  //   //业务起止点
  //   for (let i = 0; i < nodes.length; i++) {
  //     if (nodes[i].nodeId === service.serviceSourceNodeId)
  //       node1Pos.push(nodes[i].locationX, nodes[i].locationY, nodes[i].locationZ);
  //     else if (service.serviceTargetNodeId.includes(nodes[i].nodeId))
  //       node2Pos.push([nodes[i].locationX, nodes[i].locationY, nodes[i].locationZ]);
  //   }
  //   //在connections中加入pos
  //   service.connections['node1Pos'] = node1Pos;
  //   service.connections['node2Pos'] = node2Pos;


  //   //每条链路的起止点
  //   const channelTable = service.connections;
  //   const serviceChannelTableAddPos = channelTable.map(link => {
  //     let linkNode1Pos = [];
  //     let linkNode2Pos = [];
  //     for (let k = 0; k < nodes.length; k++) {
  //       if (nodes[k].nodeId === link.src_node_id)
  //         linkNode1Pos.push(nodes[k].locationX, nodes[k].locationY, nodes[k].locationZ);
  //       else if (nodes[k].nodeId === link.dst_node_id)
  //         linkNode2Pos.push(nodes[k].locationX, nodes[k].locationY, nodes[k].locationZ);
  //     }
  //     return {
  //       ...link,
  //       linkSourceNodePos: linkNode1Pos,
  //       linkTargetNodePos: linkNode2Pos,
  //     };
  //   });
  //   return {
  //     ...service,
  //     sourceNodePos: node1Pos,
  //     targetNodePos: node2Pos,
  //     serviceChannelTable: serviceChannelTableAddPos,
  //   };
  // });

  // return new_services;
}

export {
  calbtSphereAndPos,
  linkIdReverse,
  linkIdSplit,
  findLinkType,
  setLevelAndTypeOfLine,
  node_link_local,
  sortAlarmInfo,
  change_init,
  change_nodes,
  change_links,
  change_linksTSN,
  change_services,
  change_nodesAlgo,
  change_linksAlgo
};
