import { message } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from '../controls/DragControls';
import { calbtSphereAndPos, linkIdSplit } from '../utils/dataUtils';
import { createMoveByCurveAnime } from '../anime/anime';
import { createMoveSphere, initVisual, drawGridHelper, disposeTmpObjs } from '../draw/draw';
import { chooseServiceMapping, chooseServiceData, highlightNode } from '../service/serviceMapping';
import $ from 'jquery';
import { deepClone, equal } from '../../utils';
import { delete_userData, front_userData, isType, _userData } from '../utils/userData';

const eventList = [];
eventList.add = function (domElement, type, fn) {
  if (this.index(domElement, type, fn) === -1) {
    Array.prototype.push.call(this, { domElement, type, fn });
    domElement.addEventListener(type, fn);
  }
  return this;
};
eventList.index = function (domElement, type, fn) {
  let index = -1;
  for (let i = 0; i < this.length; i++) {
    if (
      equal(this[i].type, type) &&
      equal(this[i].fn, fn) &&
      equal(this[i].domElement, domElement)
    ) {
      index = i;
      break;
    }
  }
  return index;
};
eventList.remove = function (domElement, type, fn) {
  if (this.length === 0) return this;
  let index = this.index(domElement, type, fn);
  if (index !== -1) {
    domElement.removeEventListener(this[index].type, this[index].fn);
    this.splice(index, 1);
  }
  return this;
};
eventList.clear = function (domElement) {
  for (let i = 0; i < this.length; i++) {
    domElement.removeEventListener(this[i].type, this[i].fn);
  }
  let i = 0;
  while (i < this.length) {
    if (this[i].domElement !== domElement) i++;
    else {
      this.splice(i, 1);
    }
  }
};

class EventListener {
  //自己存一个长宽像素比 便于窗口大小改变时做相应调整
  _w = window.innerWidth;
  _h = window.innerHeight;
  _p = window.devicePixelRatio;
  _mouse = new THREE.Vector2(-1, 1);
  _raycaster = new THREE.Raycaster();
  _intersects_all = [];
  _intersects_visible = [];
  INTERSECTED = null;
  INTERSECTED_COLOR = new THREE.Color(0xfffff);
  CLICKED = null;
  DBLCLICKED = null;
  DBLCLICKED_ZOOMSTATE = 0; //0表示缩小，1表示放大
  //两个特殊的包含事件的control
  _orbitControl = null;
  _dragControl = null;

  //检验入参个数和不为空
  constructor(scene, camera, container, renderer, composer, modeRef, serviceData, data) {
    if (arguments.length !== 8 || Array.from(arguments).indexOf(undefined) !== -1) {
      return;
    }
    this.init(scene, camera, container, renderer, composer, modeRef, serviceData, data);
  }

  //初始化一系列参数
  init(scene, camera, container, renderer, composer, modeRef, serviceData, data) {
    if (arguments.length !== 8 || Array.from(arguments).indexOf(undefined) !== -1) {
      throw new Error('eventlistener');
    }
    this._modeRef = modeRef; //用于控制模式
    this._camera = camera;
    this._scene = scene;
    this._domElement = renderer.domElement;
    this._outlinePass = composer.passes[1];
    this._effectFXAA = composer.passes[2];
    this._orbitControl = new OrbitControls(this._camera, this._domElement);
    this._dragControl = new DragControls(this._scene.children, this._camera, this._domElement);
    this._serviceData = serviceData;
    this._data = data;
    //renderer用于设置effect、用于获取canvas
    this._renderer = renderer;
    //container用于设置canvas大小，用于重设renderer属性
    this._container = container;
    this._renderer_w = this._renderer.domElement.style.width;
    this._renderer_h = this._renderer.domElement.style.height;
    this._container_w = this._container.offsetWidth;
    this._container_h = this._container.offsetHeight;
  }

  // 修改mouse 修改raycaster 修改intersects 修改INTERSECTED 修改高亮颜色
  onMouseMove = (event, callback) => {
    this.common(event);
    this.modifyIntersectedAndColor();
    if (typeof callback === 'function') callback();
  };
  //鼠标摁下去
  onMouseDown = (event, callback) => {
    this.common(event);
    this.modifyClicked(this._intersects_visible);
    if (typeof callback === 'function') callback();
  };
  //鼠标放松
  onMouseUp = (event, callback) => {
    this.common(event);
    this.modifyClicked(this._intersects_visible);
    if (typeof callback === 'function') callback();
  };
  //click等于down+up，已经完成过公共操作
  onMouseClick = (event, callback) => {
    event.preventDefault();
    this.common(event);
    this.modifyClicked(this._intersects_visible);

    //test： 应该不用再修改Clicked，因为down和up中改过
    // clickTimeout.do(() => {
    //   this.CLICKED &&
    //     this.CLICKED.geometry.type === 'CylinderGeometry' &&
    //     store.dispatch(createClickPhysicalNodeAction(this.CLICKED));
    //   this.CLICKED &&
    //     this.CLICKED.geometry.type === 'LineGeometry' &&
    //     !this.CLICKED.userData.front.hasOwnProperty('serviceid') &&
    //     store.dispatch(createClickPhysicalLinkAction(this.CLICKED));
    //   //业务仿真中线路管道点击
    //   this.CLICKED &&
    //     this.CLICKED.geometry.type === 'TubeGeometry' &&
    //     store.dispatch(createClickPhysicalLinkAction(this.CLICKED));
    //   this.CLICKED &&
    //     this.CLICKED.geometry.type === 'LineGeometry' &&
    //     this.CLICKED.userData.front.hasOwnProperty('serviceid') &&
    //     store.dispatch(createClickBusinessLinkAction(this.CLICKED));
    //   this.CLICKED &&
    //     this.CLICKED.name === 'lightEnd' &&
    //     store.dispatch(createClickEndAction(this.CLICKED));
    //   if (typeof callback === 'function') callback();
    // });
  };

  onMouseDblclick = (event, callback) => {
    event.preventDefault();
    clickTimeout.clear();
    this.common(event);
    this.modifyDblclicked(this._intersects_visible);
    this.modifyDblclickedZoomState();
    if (typeof callback === 'function') callback();
  };
  //完成事件公共部分所需的
  /*
    鼠标位置计算、
    射线更新、
    射线所指向物体的更新操作；
    */
  common = event => {
    event.preventDefault();
    //计算、修改鼠标位置
    let rect = this._domElement.getBoundingClientRect();
    let X = 0;
    let Y = 0;

    X = event.clientX;
    Y = event.clientY;

    this._mouse.x = ((X - rect.left) / this._domElement.offsetWidth) * 2 - 1;
    this._mouse.y = -((Y - rect.top) / this._domElement.offsetHeight) * 2 + 1;

    //修改raycaster指向
    let raycaster = this._raycaster;
    raycaster.setFromCamera(this._mouse, this._camera);
    //修改raycaster指向的物体
    this._intersects_all = raycaster.intersectObjects(this._scene.children);
    this._intersects_visible = clickThrough(this._intersects_all);
    //这里现在很奇怪 捕获不了直线
  };
  //按作用给方法分类

  //在鼠标move的时候 修改INTERSECTED
  modifyIntersected = intersects => {
    if (Array.isArray(intersects)) {
      if (intersects.length === 0) {
        this.INTERSECTED = null;
        return;
      }
      this.INTERSECTED = intersects[0].object;
    } else {
      this.INTERSECTED = intersects; //传入不为数组时
    }
  };
  //修改单击物体属性
  modifyClicked = selected => {
    if (Array.isArray(selected)) {
      if (selected.length === 0) {
        this.CLICKED = null;
        return;
      }
      this.CLICKED = selected[0].object;
    } else {
      this.CLICKED = selected; //传入不为数组时
    }
  };
  //修改双击物体属性
  modifyDblclicked = selected => {
    if (Array.isArray(selected)) {
      if (selected.length === 0) {
        this.DBLCLICKED = null;
        return;
      }
      this.DBLCLICKED = selected[0].object;
    } else {
      this.DBLCLICKED = selected; //传入不为数组时
    }
  };
  //修改双击时候的缩放属性
  modifyDblclickedZoomState = () => {
    if (this.DBLCLICKED !== null) this.DBLCLICKED_ZOOMSTATE = 1;
    //双击空白处，缩小
    else this.DBLCLICKED_ZOOMSTATE = 0; //双击到物体，放s大
  };

  //给鼠标触碰到的物体变换颜色
  modifyIntersectedAndColor = () => {
    const intersects = this._intersects_visible;
    //intersects[0].object 可以是平面，可以是节点 可以是线
    //初始的时候，this.INTERSECTED是null
    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        //object是Mesh,即物体
        // 上一个物体变为原色
        if (this.INTERSECTED) this.INTERSECTED.material.color = this.INTERSECTED.currentRGB;
        //修改选中INTERSECTED
        this.modifyIntersected(intersects);
        //给碰到的物体换颜色
        this.INTERSECTED.currentRGB = this.INTERSECTED.material.color;
        this.INTERSECTED.material.color = this.INTERSECTED_COLOR;
      }
    } else {
      if (this.INTERSECTED) {
        this.INTERSECTED.material.color = this.INTERSECTED.currentRGB;
      }
      this.modifyIntersected(null);
    }
  };

  //记录鼠标点击位置
  recordMousePos = event => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  };

  //单击时，显示label，或者改为右侧抽屉框
  showLabel = event => {
    if (!this.CLICKED) {
      $('#label').attr('style', 'display:none;'); //隐藏说明性标签
      return;
    }
    //点击了物体

    $('#label').attr('style', 'display:block;'); // 显示说明性标签
    $('#label').css({
      'font-size': '150%',
      'font-family': 'Times New Roman',
      left: this.clientX,
      top: this.clientY,
    }); // 修改标签的位置
    //$('#label').text(this.CLICKED.name); // 显示模型信息
    if (_userData(this.CLICKED, 'front', 'type') === 'plane') {
      $('#label').attr('style', 'display:none;'); //隐藏说明性标签
      //单击平面时不会取消outline效果
    } else if (this.CLICKED.type === 'Line2') {
      $('#label').text(
        ' ID: ' +
          this.CLICKED.userData.front.id +
          '\n' +
          '源: ' +
          this.CLICKED.userData.front.node1 +
          '\n' +
          '目的: ' +
          this.CLICKED.userData.front.node2
      );
    } else if (this.CLICKED.name === 'bridge' || this.CLICKED.name === 'OnOff') {
      $('#label').text(
        ' 名称: ' +
          this.CLICKED.userData.front.name +
          '\n' +
          '类型: ' +
          this.CLICKED.userData.front.type +
          '\n' +
          'Id: ' +
          this.CLICKED.userData.front.id
      );
    } else if (this.CLICKED.parent.name === 'lightEnd') {
      $('#label').text(
        ' 名称: ' +
          this.CLICKED.parent.userData.front.name +
          '\n' +
          '类型: ' +
          this.CLICKED.parent.userData.front.type +
          '\n' +
          'Id: ' +
          this.CLICKED.parent.userData.front.id
      );
    }
  };

  //单击时，显示outlinePass
  showOutline = () => {
    //只会给节点添加outline
    const { CLICKED, _outlinePass, _scene } = this;
    highlightNode(CLICKED, _outlinePass, _scene);
  };

  chooseService2 = () => {
    const obj = this.DBLCLICKED;
    console.log(obj);
    if (isType(obj, 'Line2')) {
      const outlinePass = this._outlinePass;
      //先删除之前的动画和outline
      disposeTmpObjs(outlinePass.selectedObjects, outlinePass.recordAnime, this._scene);
      outlinePass.selectedObjects = [];

      const allIds = chooseServiceData(
        this.DBLCLICKED,
        'sub',
        this._scene,
        this._serviceData,
        this._data
      );
      allIds.forEach(ids => {
        // console.log('选中的mapping', ids)
        const pointIds = ids.mappingPoint;
        const posArray = ids.posArray;
        //console.log('scsscscscscscs:', posArray);
        //如果pos为空，说明数据有点问题，返回先
        if (!posArray || posArray.length === 0) return;
        console.log(outlinePass);
        //为每一组pos创建动画 移动的光点
        const circleP = createMoveSphere(posArray); //posArray[0].x
        this._scene.add(circleP);
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
        this._scene.traverse(obj => {
          // 将业务涉及到的节点全部高亮
          for (let i = 0; i < pointIds.length; i++) {
            // console.log( lineNames[i] , obj.name )
            if (pointIds[i] === _userData(obj, 'front', 'id')) {
              outlinePass.selectedObjects.push(obj);
            }
          }
        });
      });
    }
  };

  //双击线条的时候，显示业务线,并创建流动小球动画
  chooseService = () => {
    const obj = this.DBLCLICKED;
    if (isType(obj, 'Line2')) {
      const outlinePass = this._outlinePass;
      //先删除之前的动画和outline
      disposeTmpObjs(outlinePass.selectedObjects, outlinePass.recordAnime, this._scene);
      outlinePass.selectedObjects = [];

      const ids = chooseServiceMapping(this.DBLCLICKED, 'sub', this._scene, this._serviceData);

      const pointIds = ids.mappingPoint;
      const posArray = ids.posArray;
      //如果pos为空，说明数据有点问题，返回先
      if (!posArray || posArray.length === 0) return;

      //为每一组pos创建动画 移动的光点
      const circleP = createMoveSphere(posArray);
      this._scene.add(circleP);
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
      this._scene.traverse(obj => {
        // 将业务涉及到的节点全部高亮
        for (let i = 0; i < pointIds.length; i++) {
          if (pointIds[i] === _userData(obj, 'front', 'id')) {
            outlinePass.selectedObjects.push(obj);
          }
        }
      });
    }
  };

  //初始化orbit控制器
  initOrbit = () => {
    const controls = this._orbitControl;
    // 如果使用animate方法时，将此函数删除
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
    controls.dampingFactor = 0.1;
    //设置相机距离原点的最近距离
    controls.minDistance = 50;
    //设置相机距离原点的最远距离
    controls.maxDistance = 300;
    //是否开启右键拖拽（整体拖拽，此拖拽和拖动节点效果冲突）

    controls.enablePan = this._modeRef.current.drag == true ? false : true;
    initVisual(controls, null);
    return controls;
  };

  //双击非线条时会移动镜头,即双击节点\平面
  turnOrbit = () => {
    const orbitControl = this._orbitControl;
    //phi 65° theta 30°时效果较好,离平面中心高度约为75
    const phi = 65,
      theta = 30;
    /*
        设置控件的target属性，不会改变相机的lookAt视点，
        但是修改相机的lookAt会影响THREE.OrbitControls的target？？？

        改变target后 四元数不会改变，相机的worldDirection也没有改变
         */
    const target = orbitControl.target;
    //修改完target后 需要根据target来计算dstpos
    orbitControl.target.set(0, this.DBLCLICKED ? this.DBLCLICKED.position.y : 0, 0);
    const dstpos = calbtSphereAndPos(phi, theta, orbitControl.target, orbitControl.object.position);
    //计算完后重置target
    orbitControl.target.set(target.x, target.y, target.z);
    const dstlookat = this.DBLCLICKED
      ? new THREE.Vector3(0, this.DBLCLICKED.position.y, 0)
      : new THREE.Vector3(0, 0, 0);
    //moveAndLookAtAnime(orbitControl, dstpos, dstlookat, {}, this.DBLCLICKED_ZOOMSTATE);//现在有问题
  };

  disableOrbit = () => {
    this._orbitControl.enable = false;
  };
  enableOrbit = () => {
    this._orbitControl.enable = true;
  };

  resetScope = () => {
    this._renderer_w = this._renderer.domElement.style.width;
    this._renderer_h = this._renderer.domElement.style.height;

    this._container_w = this._container.offsetWidth;
    this._container_h = this._container.offsetHeight;
  };
  //container变形时重设属性，这个也许多余
  onResize = () => {
    this.resetScope();
    this._w = this._container_w;
    this._h = this._container_h;
    this._p = window.devicePixelRatio;

    this._renderer.setSize(this._w, this._h);
    this._renderer.setPixelRatio(this._p);

    this._camera.aspect = this._w / this._h;
    this._camera.updateProjectionMatrix();
    /*
        1.renderer分辨率.
        2.camera范围.
        3.粗线条 分辨率.  这个可能有点不好弄
        4.抗锯齿后期处理分辨率.
        */
    const effectFXAA = this._effectFXAA;
    effectFXAA.material.uniforms['resolution'].value.x = 1 / (this._w * this._p);
    effectFXAA.material.uniforms['resolution'].value.y = 1 / (this._h * this._p);
  };

  //编写针对特定mode的事件
  onMouseMove_General = event => {
    const general = () => {};
    this.onMouseMove(event, general);
  };

  //onclick=onmousedown+onmouseup
  onMouseDown_General = event => {
    /*
        修改mouse 修改raycaster 修改intersects
        修改INTERSECTED 修改高亮颜色
    */
    this.onMouseDown(event);
  };

  onMouseUp_General = event => {
    /*
        修改mouse 修改raycaster 修改intersects
        修改INTERSECTED 修改高亮颜色
    */
    this.onMouseUp(event);
  };

  onMouseClick_General = event => {
    const general = event => {
      this.showOutline();
    };
    /*
        修改mouse 修改raycaster 修改intersects
        修改INTERSECTED 修改高亮颜色
    */
    this.onMouseClick(event, general);
  };

  onMouseDblclick_General = event => {
    const general = () => {
      const obj = this.DBLCLICKED;

      if (isType(obj, 'Line2')) {
        this.chooseService2();
      }
    };
    /*
        修改mouse 修改raycaster 修改intersects
        修改INTERSECTED 修改高亮颜色
        */
    this.onMouseDblclick(event, general);
  };

  //记录drag过的节点位置
  dragged = [];

  //drag模式：
  //初始化drag
  initDrag = () => {
    function nodeMove(event) {
      const { _selected } = event.object;
      const sprite = _userData(_selected, 'front', 'sprite');

      const position = event.object._selected.position;
      sprite.position.set(position.x, position.y + 30, position.z);
      followMove(_selected);
    }

    const followMove = obj => {
      // 只能移动节点

      if (!(isType(obj, 'node') || isType(obj, 'end'))) {
        console.log(obj);
        return;
      }
      //将线条和属性一起修改。
      const lines = _userData(obj, 'front', 'about');

      if (!lines || !lines.length) return;
      //拖动的节点的id
      const id = _userData(obj, 'front', 'id');
      //遍历和当前节点有关的lines
      lines.forEach(line => {
        const points = [];
        const linedata = _userData(line);

        const l1 = linedata.node1;
        let rePos = [];
        if (_userData(line, 'front', 'recordPos')) {
          rePos = _userData(line, 'front', 'recordPos');
        } else {
          const mypos = this._data.link;
          const myid = _userData(line, 'front', 'id');
          mypos.forEach(e => {
            if (e.link_id == myid) {
              rePos.push(e.node1Pos[0], e.node1Pos[1], e.node1Pos[2]);
              rePos.push(e.node2Pos[0], e.node2Pos[1], e.node2Pos[2]);
            }
          });
          front_userData(line, 'recordPos', rePos);
        }
        const original = _userData(line, 'front', 'recordPos');
        delete_userData(line, 'front', 'resultPos');

        const o1 = original.slice(0, 3);
        const o2 = original.slice(3);
        const pos = obj.position;
        const posbeforedrag = _userData(obj, 'front', 'posbeforedrag');
        let delta_x = 0,
          delta_z = 0;
        //用移动距离来更改线条位置得了
        delta_x = Math.floor(pos.x - posbeforedrag.x);
        delta_z = Math.floor(pos.z - posbeforedrag.z);

        if (id === l1) {
          points.push(o1[0] + delta_x, o1[1] + 2, o1[2] + delta_z, o2[0], o2[1] + 2, o2[2]);
        } else {
          points.push(o1[0], o1[1] + 2, o1[2], o2[0] + delta_x, o2[1] + 2, o2[2] + delta_z);
        }
        line.geometry.setPositions(points);

        front_userData(line, 'resultPos', points);
      });
    };

    const endMove = event => {
      const obj = event.object;
      if (!obj) return;

      let lines = _userData(obj, 'front', 'about');

      if (!lines) lines = [];
      lines.forEach(line => {
        const result = _userData(line, 'front', 'resultPos');

        if (result) {
          front_userData(line, 'recordPos', result);

          delete_userData(line, 'front', 'resultPos');
        }
      });

      front_userData(obj, 'posbeforedrag', deepClone(obj.position));

      //如果待修改中存在这个节点，那么直接修改pos，否则push
      const id = _userData(obj, 'front', 'id');
      const { position } = obj;
      const found = this.dragged.find(v => v.nodeId === id);
      if (found) {
        found.pos = [position.x, position.y, position.z];
      } else {
        const nodeData = {
          planenodeId: '',
          nodeId: id,
          positionX: Math.floor(position.x),
          positionY: Math.floor(position.y),
          positionZ: Math.floor(position.z),
        };
        this.dragged.push(nodeData);
        //向后台写拖拽后的坐标数据
        // updateNodeById(
        //   { node_id: _userData(event.object, 'front', 'id') },
        //   {
        //     location_x: Math.floor(position.x),
        //     location_y: Math.floor(position.y),
        //     location_z: Math.floor(position.z),
        //   }
        // ).then(
        //   res => {
        //     return res;
        //   },
        //   e => {
        //     message.error('获取失败：' + e);
        //   }
        // );
      }

      const guideLinks = _userData(obj, 'front', 'aboutGuide');
      if (!guideLinks || !guideLinks.length) return;

      guideLinks.forEach(guideLink => {
        //guideLink可直接按obj位置调整pos1或pos2
        //节点obj为id
        const [glId1, glId2] = linkIdSplit(guideLink.id);
        if (glId1 === id) {
          guideLink.pos1 = obj.position;
        } else if (glId2 === id) {
          guideLink.pos2 = obj.position;
        }
      });
    };

    const controls = this._dragControl;
    controls.enable = !!this._modeRef.current.drag; //!!变为boolean类型
    controls.addEventListener('drag', nodeMove);
    controls.addEventListener('dragend', endMove);
  };

  disableDrag = () => {
    this._dragControl.enable = false;
  };
  enableDrag = () => {
    this._dragControl.enable = true;
  };

  removeGrid = () => {
    this._scene.remove(...this.gridHelpers);
    this.gridHelpers.forEach(dispose);
    this.gridHelpers = [];
    function dispose(obj) {
      if (obj.hasOwnProperty('geometry')) obj.geometry.dispose();
      if (obj.hasOwnProperty('material')) obj.material.dispose();
    }
  };
  onRightMouseClick_Drag = event => {
    if (!(event.pointerType === 'mouse' && event.button === 2)) return;
    const general = () => {
      const obj = this.CLICKED;

      if (!isType(obj, 'plane')) return;
      // debugger

      if (this.gridHelpers[0] && this.gridHelpers[0].position.y === obj.position.y) return;

      //清除之前添加的
      this.removeGrid();

      //给平面添加gridhelper
      const grid = drawGridHelper();
      grid.position.set(0, obj.position.y, 0);
      this._scene.add(grid);
      //记录已添加grid
      this.gridHelpers.push(grid);
    };
    /*
        修改mouse 修改raycaster 修改intersects
        修改INTERSECTED 修改高亮颜色
        */
    this.onMouseClick(event, general);
  };

  gridHelpers = [];

  set = () => {
    const mode = this._modeRef.current;
    eventList.add(window, 'resize', this.onResize); //需要测试是否只添加了一次
    const domElement = this._domElement;
    eventList.clear(domElement); //清空上一个模式的事件

    if (!mode.drag) {
      //普通模式

      //移除辅助网格
      this.removeGrid();
      //数据修改传递到后台
      //清空
      this.dragged = [];
      this._dragControl.enable = false;
      this._dragControl.deactivate();
      eventList.add(domElement, 'mousedown', this.onMouseDown_General);
      eventList.add(domElement, 'mousemove', this.onMouseMove_General);
      eventList.add(domElement, 'mouseup', this.onMouseUp_General);
      eventList.add(domElement, 'click', this.onMouseClick_General);
      eventList.add(domElement, 'dblclick', this.onMouseDblclick_General);
    } else {
      //拖拽模式
      //移除辅助网格
      this.removeGrid();

      this._dragControl.enable = true;
      eventList.add(domElement, 'mousedown', this.onMouseDown_General);
      eventList.add(domElement, 'mousemove', this.onMouseMove_General);
      eventList.add(domElement, 'mouseup', this.onMouseUp_General);
      eventList.add(domElement, 'click', this.onMouseClick_General);
      eventList.add(domElement, 'dblclick', this.onMouseDblclick_General);
    }
  };

  clear = () => {
    const domElement = this._domElement;
    const orbitControl = this._orbitControl;
    const dragControl = this._dragControl;
    const outlinePass = this._outlinePass;
    const effectFXAA = this._effectFXAA;
    if (orbitControl) orbitControl.dispose();
    if (dragControl) dragControl.dispose();
    if (domElement) eventList.clear(domElement);
    if (outlinePass) outlinePass.dispose();

    if (effectFXAA) {
      effectFXAA.fsQuad._mesh.geometry.dispose();
      effectFXAA.fsQuad._mesh.material.dispose();
      effectFXAA.fsQuad.dispose();
      effectFXAA.material.dispose();
    }
  };
}

function clickThrough(intersects) {
  while (intersects.length > 0 && intersects[0].object.visible === false) {
    intersects.shift();
  }
  //返回的物体不包含invisible obj3D
  return intersects;
}

const clickTimeout = {
  _timeout: null,
  do: function (fn, time = 300) {
    var that = this;
    that.clear();
    that._timeout = window.setTimeout(fn, time);
  },
  clear: function () {
    var that = this;
    if (that._timeout) {
      window.clearTimeout(that._timeout);
    }
  },
};

export default EventListener;
var vnEvent = new EventListener();

export { vnEvent };
