import React, { useState, useEffect, useRef } from 'react';
import VirtualNetwork from './src/components/VirtualNetwork';
import DragBox from './src/components/DragBox';
import {
  node_link_local,
  change_nodesAlgo,
  change_linksAlgo,
  change_services,
} from './src/three/utils/dataUtils';
import './index.css';
import { fetch_getTopoInfo,fetch_getResultInfo} from '../3d/src/network/network.js';
import initInfo from './src/data/local/simulateNetData/initInfo.json';
import { nodes } from './src/data/local/trueNetData/nodes';

export default function Container3d(props) {
  const {
    type,
    history,
    netType,
    dragControl,
    nodeList,
    selectRow,
    controllerData,
  } = props;
  const [mode, setMode] = useState({
    drag: false,
  });
  const modeRef = useRef(mode);
  let [init, setInit] = useState([]);
  let [data, setData] = useState({});
  const [dataNL, setDataNL] = useState({});
  const [alarm, setAlarm] = useState([]);
  const [serviceData, setServiceData] = useState({});
  const [dataState, setDataState] = useState('@@init@@');
  const [draggable, setDraggable] = useState(false);
  const [selectId,setSelectId]=useState(0);
 
  useEffect(
    () => {
    async function fetchNetworkData() {
     
    //拓扑数据
    let nw_data={};
    nw_data["net_id"]=2;
    if(selectRow!=0){
      nw_data["net_id"]=selectRow;
      setSelectId(selectRow);
    }
    // let topoInfo= await fetch_getTopoInfo(nw_data).then(init => {
    // console.log("topoInfo is ",init);
    // return init;
    // });
    const topoInfo=require("../3d/topo.json");
    console.log("topoj is ",topoInfo);

    //规划数据
    let AlgoResult= undefined;
      
    //change
    let _nodes = [],_links = [],_alarms = [];
    let _init=initInfo;
  // {
  //   "pnId": "002-2",
  //   "pnName": "p2",
  //   "level": 0,
  //   "locationX": 0,
  //   "locationY": 0,
  //   "locationZ": 0,
  //   "rotateX": 0,
  //   "rotateY": 0,
  //   "rotateZ": 0,
  //   "scale": 0.75
  // }
    _nodes=change_nodesAlgo(topoInfo.nodes,AlgoResult,_init,type);

    _links=change_linksAlgo(topoInfo.links,topoInfo.nodes,AlgoResult);
      
    console.log("Nodeafter:",_nodes);
    
    //
    let _data = node_link_local(_nodes, _links); //这个部分如果拿到空
    setInit(_init);
    setData(_data);

    // console.log("1111",init);
 
    setDataState('@@ready@@');
      if(type=="service"){
        let temp=change_services(AlgoResult,topoInfo.nodes,_nodes,topoInfo);
        console.log("change_services: ",temp);
        setServiceData(temp);
      }
    }
    fetchNetworkData();
    
  }, [selectRow,selectId]);


  let widthRatio = '100%';

  return (
    <div
      style={{
        display: 'inline-block',
        height: '100%',
        width: widthRatio,
      }}
    >
      <div
        id="container"
        style={{ width: '100%', height: '70vh' }}
        // ondragover 事件在可拖动元素或选取的文本正在拖动到放置目标时触发。
        onDragOver={ev => {
          // preventDefault() 方法阻止元素发生默认的行为。
          ev.preventDefault();
          // draggable代表是否可拖动，初始情况下为false
          if (draggable) {
            ev.dataTransfer.dropEffect = 'move';
          }
        }}
      >
        {
          // data是否初始化
          dataState === '@@ready@@' ? (
            <>
              <VirtualNetwork
                init={init}
                data={data}
                alarm={alarm}
                serviceData={serviceData}
                modeRef={modeRef}
                netType={netType}
                type={type}
              />
              {/* 显示节点和链路信息详情的小卡片 */}
              {/* <DragBox draggable={draggable} setDraggable={setDraggable}>
                <DisplayCard history={history} />
              </DragBox> */}
            </>
          ) : (
            '图片加载中...'
          )
        }
      </div>
    </div>
  );
};
