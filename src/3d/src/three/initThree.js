import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import {
  drawCamera,
  drawLight,
  drawLinks,
  drawServiceLinks,
  drawPlane,
  drawSubNets,
  drawNodes,
  drawAlarms,
} from './draw/draw';
import { initServiceGuideLine } from './service/serviceMapping';
import { linkIdSplit } from './utils/dataUtils';
import { front_userData, _userData } from './utils/userData';
import svg from '../../img/arrowDownYellow.svg';
import { dispose } from './draw/draw';
import { tipArrowAnime } from './anime/anime';

class VN_Threejs {
  constructor(container) {
    //renderer设置背景颜色
    this.bgColor = 0x14446a;
    this.scene = new THREE.Scene();
    // 创建了render，因此有了render.DOMElement
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.init(container);
  }
  // 类块内的方法，加到了VN_Threejs实例的原型对象上

  // 初始化一个dom元素
  init(container) {
    // 如果该dom元素为空，则该元素设置为window
    if (!container) container = window;
    this.container = container;
    this.setContainerProps(container);
    this.initRendererProps();
  }
  reset() {
    this.init(); //重置为window
    const initProps = ['bgColor', 'scene', 'renderer', 'w', 'h', 'p'];
    for (let i in this) {
      if (initProps.indexOf(i) === -1) {
        delete this[i];
      }
    }
  }

  setContainerProps(container) {
    if (!container) {
      return;
    }
    if (container === window) {
      this.w = container.innerWidth;
      this.h = container.innerHeight;
    } else {
      this.w = container.offsetWidth;
      this.h = container.offsetHeight;
    }

    // window.devicePixelRatio：设备上物理像素和设备独立像素的比例。
    this.p = window.devicePixelRatio;
  }

  initRendererProps() {
    // 如果three对象中有render属性
    if (this.hasOwnProperty('renderer')) {
      //setSize： 将输出canvas的大小调整为(width, height)并考虑设备像素比，
      this.renderer.setSize(this.w, this.h);
      this.renderer.setViewport(this.w / 2, this.h / 2);
      // 设置颜色及其透明度
      this.renderer.setClearColor(this.bgColor, 1);
      // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      this.renderer.setPixelRatio(this.p);
    }
  }

  initCamera() {
    const camera = drawCamera();
    this.camera = camera.orth;
    this.setProps('cameras', camera);

    camera.orth.position.set(0, 0, 1);
    return this;
  }

  initLight() {
    // 环境光
    const light = drawLight();
    this.setProps('lights', light);
    return this;
  }

  initPlanes(init, type) {
    const planes = drawPlane(init, type);
    this.setProps('planes', planes);
    return this;
  }

  initSubNetsPlanes(subNet) {
    const subNets = drawSubNets(subNet);
    this.setProps('subNets', subNets);
    return this;
  }

  initNodes(nodes,dataModel) {
    const models =   drawNodes(nodes,dataModel);
    const { nodemodels } = models;
    const { spritemodels } = models;
    //传入两个数组
    console.log("modes:",nodemodels);
    this.setProps('nodes', nodemodels);
    this.setProps('nodeSprites', spritemodels);
    return this;
  }

  // 根据映射的物理节点，来生成虚拟节点的坐标
  initVirtualNodes(serviceData, scene, data, init) {
    let virtualNodes = [];
    let level;
    init.forEach(p => {
      if (p.type === 'virtual') level = p.level;
    });
    serviceData.forEach(service => {
      const nodes = service.mapping.node;
      //为对应的节点画虚线
      const nodep = nodes.physical;
      for (let i = 0; i < nodep.length; i++) {
        let locationX, locationY, locationZ;
        scene.children.forEach(child => {
          if (_userData(child, 'front', 'id') == nodep[i]) {
            locationX = child.position.x;
            locationY = child.position.y;
            locationZ = child.position.z;
          }
        });

        let virtualNode = {
          pnNodeId: nodep[i] + '_v',
          pnNodeName: nodep[i] + '_v',
          level: '004',
          type: 'virtual',
          modelType: 'businessnode',
          locationX: locationX / 4,
          locationY: level * 180,
          locationZ: locationZ / 4,
          cloud: '',
        };

        virtualNodes.push(virtualNode);
      }
    });

    data.node.push(...virtualNodes);

    const options = {
      '004': {
        visible: false,
      },
    };
    // 只提取plane.id的前三个字符

    const models = drawNodes(virtualNodes, options);
    const { nodemodels } = models;
    const { spritemodels } = models;
    //传入两个数组
    this.setProps('nodes', nodemodels);
    this.setProps('nodeSprites', spritemodels);

    return this;
  }
  initTerminalNodes(serviceData, scene, data, init) {
    let ternimals = [];
    let level;
    init.forEach(p => {
      if (p.type === 'virtual') level = p.level;
    });
    serviceData.forEach(service => {
      const nodesOfTerminalMapping = service.terminalMapping.terminalLinkToPhysicalNodes;
      for (let i = 0; i < nodesOfTerminalMapping.length; i++) {
        let locationX, locationY, locationZ;
        scene.children.forEach(child => {
          if (_userData(child, 'front', 'id') == nodesOfTerminalMapping[i]) {
            locationX = child.position.x;
            locationY = child.position.y;
            locationZ = child.position.z;
          }
        });

        let terminal = {
          pnNodeId: service.terminalMapping.terminal[i],
          pnNodeName: service.terminalMapping.terminal[i],
          level: '004',
          type: 'virtual',
          modelType: 'terminal',
          locationX: locationX / 3,
          locationY: 180 * level,
          locationZ: locationZ / 3,
          cloud: '',
        };
        ternimals.push(terminal);
      }
    });

    data.node.push(...ternimals);

    const options = {
      '004': {
        visible: false,
      },
    };
    // 只提取plane.id的前三个字符

    const models = drawNodes(ternimals, options);
    const { nodemodels } = models;
    const { spritemodels } = models;
    //传入两个数组
    this.setProps('nodes', nodemodels);
    this.setProps('nodeSprites', spritemodels);

    return this;
  }

  initLinks(links, type) {
    if (type !== 'service2') {
      const models = drawLinks(links);
      //传入数组
      this.setProps('links', models);
    } else {
      const models = drawLinks(links, type);
      //传入数组
      this.setProps('links2', models);
    }
    return this;
  }

  initAlarms(alarmInfo) {
    const models = drawAlarms(alarmInfo);
    //传入数组
    this.setProps('alarms', models);
    return this;
  }

  initServiceLinks(serviceData, init) {
    if (serviceData === null || serviceData === undefined || serviceData.length === 0 || JSON.stringify(serviceData)==="{}") return this;

    // console.log("here!!!: ",JSON.stringify(serviceData));

    const stream_id = serviceData.stream_id;
 
    const serviceLinks = serviceData.serviceChannelTable.map(service => {
      if (serviceData.linkColor === undefined) serviceData.linkColor = '#ff33cc'; //缺省颜色（用于业务详情页面）
      return {
        connectionId: service.connection_id,
        nodeId1: service.src_node_id,
        nodeId2: service.dst_node_id,
        node1Pos: service.linkSourceNodePos,
        node2Pos: service.linkTargetNodePos,
        linkColor: serviceData.linkColor,
        randOfLine: 0.3 + 0.09,
        serviceid: stream_id,
      };
    });

    const serviceLinesModels = drawServiceLinks(serviceLinks, init, 'service');
    this.setProps('links', serviceLinesModels);
    

    return this;
  }

  setAssociation() {
    //设置node中对link的关联属性
    //以便drag时同步更新link
    const _nodes = this.nodes;
    const _links = this.links;
    const _guideLinks = this.guideLinks;
    if (!_nodes) return;

    const tmp = this.serviceLines;
    let _serviceLines = null;
    if (tmp) _serviceLines = tmp.mapLines.concat(tmp.vLines).concat(tmp.pLines);
    set(_links, _nodes, 'about');
    set(_serviceLines, _nodes, 'about');
    setGuideline(_guideLinks, _nodes, 'aboutGuide');

    function set(linkArray, nodeArray, key) {
      if (!linkArray || linkArray.length === 0) return;
      linkArray.forEach((link, i) => {
        nodeArray.forEach((node, j) => {
          const linkdata = _userData(link, 'front');
          const nodedata = _userData(node, 'front');

          let id1, id2;
          if (linkdata.node1 && linkdata.node2) {
            id1 = linkdata.node1;
            id2 = linkdata.node2;
          }

          //用node找到相应节点
          if (nodedata.id === id1 || nodedata.id === id2) {
            //向node3D中存入 对应的link3D
            front_userData(node, key, link);
          }
        });
      });
    }
    function setGuideline(guideLinkArray, nodeArray, key) {
      if (!guideLinkArray || guideLinkArray.length === 0) return;
      guideLinkArray.forEach((guideLink, i) => {
        nodeArray.forEach((node, j) => {
          const linkdata = guideLink;
          const nodedata = _userData(node, 'front');
          let [id1, id2] = linkIdSplit(linkdata.id);

          if (nodedata.id === id1 || nodedata.id === id2) {
            front_userData(node, key, guideLink);
          }
        });
      });
    }
  }

  initServiceTerminals() {
    //从已有节点中筛选出终端
    const nodemodels = this.nodes;
    const spritemodels = this.nodeSprites;
    if (!nodemodels || !spritemodels) return this;
    const l = nodemodels.length;

    const terminals = [];
    const terminalSprites = [];
    for (let i = 0; i < l; i++) {
      const node = nodemodels[i];
      // 如果是virtual的
      if (
        _userData(node, 'front', 'modelType') === 'terminal' &&
        _userData(node, 'front', 'type') === 'virtual'
      ) {
        terminals.push(node);
        terminalSprites.push(spritemodels[i]);
      }
    }
    this.setProps('terminals', terminals);
    this.setProps('terminalSprites', terminalSprites);
    return this;
  }

  initServiceGuideLinks(serviceData, data) {
    const guideLinks = initServiceGuideLine(serviceData, data);
    //对象
    this.guideLinks = guideLinks;
    return this;
  }

  addServiceLinks() {
    if (this.exist('scene')) {
      const order = ['serviceLines'];
      order.forEach((o, i) => {
        const objs = this.getProps(o);
        if (objs.length > 0) this.scene.add(...objs);
      });
    }
  }
  addServiceTerminals() {
    //由于terminal其实当作node已经添加过了，所以直接return
    return null;
  }
  setv_node(_init) {
    const order = [
      'nodes',
      'nodeSprites',
      'links',
      'links2',
      'cubes',
      'planeSprites',
      'planes',
      'terminals',
    ];
    let terminals = [];
    let nodes = [];
    let nodeSprites = [];
    order.forEach((o, i1) => {
      const objs = this.getProps(o);

      //下面两个用于对节点和精灵做group操作
      if (o === 'nodes') {
        nodes = objs;
      }
      if (o === 'nodeSprites') {
        nodeSprites = objs;
      }
      if (o === 'terminals') {
        terminals = objs;
      }
    });
    //节点和精灵做集合操作
    const l = nodes.length;
    //倒着搜索

    const v_nodes = [];

    for (let i = l - 1; i >= 0; i--) {
      if (_userData(nodes[i], 'front', 'type') !== 'virtual') break;
      v_nodes.push(nodes[i], nodeSprites[i]);
    }
    this.setProps('v_nodes', v_nodes);

    return this;
  }

  addChosenEffect() {
    THREE.Object3D.prototype.chosen = function (scene) {
      const obj3D = this;
      const imgLoader = new THREE.ImageLoader();

      imgLoader.load(
        // resource URL
        svg,
        // onLoad callback
        img => {
          // use the image, e.g. draw part of it on a canvas
          img.width = 100;
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.width = 100;
          canvas.height = 100;
          context.drawImage(img, 0, 0, 100, 100);

          var texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;

          var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          spriteMaterial.transparent = true;
          spriteMaterial.opacity = 0.8;

          spriteMaterial.depthWrite = false; //用于避免他的深度影响后面的平面的渲染
          var sprite = new THREE.Sprite(spriteMaterial);

          const position = obj3D.position;
          sprite.position.set(position.x, position.y + 35, position.z);
          sprite.scale.set(20, 20, 20);

          front_userData(obj3D, 'arrow', sprite);

          tipArrowAnime(sprite);

          scene.add(sprite);
        },
        // onProgress callback currently not supported
        undefined,
        // onError callback
        function () {
          console.error('An error happened.');
        }
      );
    };
    THREE.Object3D.prototype.removeChosen = function (scene) {
      const obj3D = this;
      const arrowObj3D = _userData(obj3D, 'front', 'arrow');
      dispose(arrowObj3D, scene);
    };
  }

  //add 要注意顺序
  addInitObjects() {
    //按照节点、线条、平面的顺序添加，以后若修改透明物体渲染顺序时方便

    const order = [
      'cameras',
      'lights',
      'planes',
      'planeSprites',
      'nodes',
      'nodeSprites',
      'links',
      'links2',
      'cubes',
    ];
    this.add(order);
  }
  addCameraAndLight() {
    this.add(['cameras', 'lights']);
  }
  addPlanes() {
    this.add(['planes']);
  }
  addSubNetsPlanes() {
    this.add(['subNets', 'subNetsSprites']);
  }

  addNodes() {
    this.add(['nodes', 'nodeSprites']);
  }
  deleteNodes(nodes) {
    nodes.forEach(node => {
      let nodemodels = this.getProps('nodes');
      let spritemodels = this.getProps('nodeSprites');
      let { pnNodeId } = node;
      let new_nodemodels = nodemodels.filter(nodemodel => {
        if (_userData(nodemodel, 'front', 'id') === pnNodeId) return false;
        else return true;
      });
      let new_spritemodels = spritemodels.filter(spritemodel => {
        if (_userData(spritemodel, 'front', 'belongto') === pnNodeId) return false;
        else return true;
      });

      this['nodes'] = new_nodemodels;
      this['nodeSprites'] = new_spritemodels;
    });
    let o = this.getProps('nodes');

    this.delete(nodes);
  }
  addLines() {
    this.add(['links']);
  }
  addCubes() {
    if (this.cubes && this.cubes.length !== 0) {
      this.add(['cubes']);
    }
  }
  addLinks2() {
    this.add(['links2']);
  }

  addAlarms() {
    this.add(['alarms']);
  }

  // 往scene中添加对象
  add(order = []) {
    if (this.exist('scene')) {
      order.forEach((o, i) => {
        const objs = this.getProps(o);
        this.scene.add(...objs);
      });
    }
  }
  delete(objs) {
    if (this.exist('scene')) {
      objs.forEach((o, i) => {
        let new_children = this.scene.children.filter(child => {
          let { pnNodeId } = o;
          if (
            _userData(child, 'front', 'id') === pnNodeId ||
            _userData(child, 'front', 'belongto') === pnNodeId
          ) {
            return false;
          } else return true;
        });

        let a = [1, 2, 3, 4, 5];

        this.scene.children = new_children;
      });
    }
  }

  initPostEffect() {
    //EffectComposer：效果组合器 用于在three.js中实现后期处理效果。该类管理了产生最终视觉效果的后期处理过程链。
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const resolution = new THREE.Vector2(this.w, this.h);
    const outlinePass = new OutlinePass(resolution, this.scene, this.camera);

    outlinePass.edgeStrength = 4; //包围线浓度
    outlinePass.edgeGlow = 1; //边缘线范围
    outlinePass.edgeThickness = 1; //边缘线浓度
    outlinePass.pulsePeriod = 3; //包围线闪烁频率
    outlinePass.visibleEdgeColor.set('#FFFFFF'); //包围线颜色
    outlinePass.hiddenEdgeColor.set('#1caa22'); //被遮挡的边界线颜色
    composer.addPass(outlinePass);

    // FXAA 效果比较好 把线条加粗一下试试
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.material.uniforms['resolution'].value.x = 1 / (this.w * this.p);
    effectFXAA.material.uniforms['resolution'].value.y = 1 / (this.h * this.p);

    effectFXAA.renderToScreen = true;
    composer.addPass(effectFXAA);
    this.composer = composer;
    //composer.passes[1]是outlinePass
  }

  //要注意static中的this 和非静态变量中的this的指向不同，static中this指向class
  //非静态方法中this指向对象
  exist(t) {
    return this.hasOwnProperty(t) && this[t];
  }

  //以数组形式取出数据
  getProps(propname) {
    const obj = this[propname];

    if (!obj) return propname;
    //数组或者是对象
    if (Array.isArray(obj)) {
      return obj;
    } else {
      const res = [];
      const keys = Object.keys(obj);
      keys.forEach((key, i) => {
        if (Array.isArray(obj[key])) {
          //部分属性保存着数组，直接push的话会变成数组中存入数组
          res.push(...obj[key]);
        } else {
          res.push(obj[key]);
        }
      });
      return res;
    }
  }

  //设置属性
  setProps(propname, object) {
    if (typeof propname !== 'string' || typeof object !== 'object') return;

    //object可能是对象，也可能是数组 需要处理一下
    if (Array.isArray(object)) {
      //数组时，push
      //如果未曾定义过这个属性
      if (!this[propname]) this[propname] = [];
      try {
        this[propname].push(...object);
      } catch (error) {
        console.log(error);
      }
    } else {
      //传入的object是对象 则按对象来设置
      const keys = Object.keys(object);
      //如果未曾定义过这个属性
      if (!this[propname]) this[propname] = {};
      keys.forEach((v, i) => {
        this[propname][v] = object[v];
      });
    }
  }
}
// 在一个模块中，可以 同时 使用export default 和 export 向外暴露成员
export default VN_Threejs;
export const vnThree = new VN_Threejs();
