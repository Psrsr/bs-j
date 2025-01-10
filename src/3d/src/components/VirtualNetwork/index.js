import React, { useEffect,useState } from 'react';
import { vnThree } from '../../three/initThree';
// 获取的是three对象
import { vnEvent } from '../../three/event/event';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js';
import './index.css';

export default function VirtualNetwork(props) {
  const { init, data, alarm, serviceData, modeRef, netType, type} =
    props;
  const [dataModel, setDataModel] = useState(null);
  useEffect(() => {
    const loader = new GLTFLoader();
      loader.load( 'src/js/components/controller/3d/src/data/server_scayle.glb', function ( gltf ) {  
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
              child.frustumCulled = false;
              child.castShadow = true;
              child.material.emissive = child.material.color;
              child.material.emissiveMap = child.material.map;
          }
      });
        setDataModel(gltf.scene);
        console.log(gltf.scene);
      }, 
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded '+ dataModel );
        },
        function ( error ) {
          console.log( 'An error happened' );
        }
      );
  }, []); 
  useEffect(() => {
    
    //绘制不变的部分
    const canvasDom =
      vnThree && vnThree.renderer && vnThree.renderer.domElement
        ? vnThree.renderer.domElement
        : null;
    const container = document.getElementById('container-canvas');
    if (container) {
      vnThree.init(container);
      container.appendChild(canvasDom);
    }
    if (document.getElementById('container-canvas')) {
      vnThree.initCamera().initLight();
      vnThree.addCameraAndLight();
      vnThree.initPostEffect();
      const { scene, camera, container, renderer, composer } = vnThree;

      vnEvent.init(scene, camera, container, renderer, composer, modeRef, serviceData, data);
      vnEvent.initOrbit();
      vnEvent.set();
      vnEvent.initDrag();
      vnEvent.enableDrag();
      const orbitControl = vnEvent._orbitControl;
      vnThree.modeRef = modeRef;
      vnThree.modeChange = vnEvent.set;
      vnThree.clear = vnEvent.clear;
      vnThree.render = function render() {
        vnThree.frame = requestAnimationFrame(render);
        renderer.render(scene, camera);
        composer.render();
        orbitControl.update();
        TWEEN.update();
      };
      // Tween.js是一个包含各种经典动画算法的JS资源。其实更jQuery.easing.js很多类似之处。主要的方法名也一致。不压缩代码也就800来行。
      vnThree.render();

      try {
        vnThree.initPlanes(init, type).addPlanes();
        vnThree.initPlanes(init, type).addPlanes();
        console.log("VirtualNetwork:",dataModel);
        vnThree.initNodes(data.node,dataModel).addNodes();

        if (type !== 'service2') {
          vnThree.initLinks(data.link, type, init).addLines();
        } else {
          vnThree.initLinks(data.link, type, init).addLinks2();
        }

        if (type === 'service' || type === 'service1') {
          //业务线段
          console.log("VserviceData:", serviceData);

          vnThree.initServiceLinks(serviceData, init).addLines();
          //业务起点和终点
        }

        vnThree.setAssociation();
      } catch (error) {
        console.log('virtualnetwork 1 effect error');
        throw error;
      }
    }
    function dispose(objs, scene) {
      while (objs && objs.length) {
        const tmp = objs[objs.length - 1];
        if (tmp.hasOwnProperty('geometry')) tmp.geometry.dispose();
        if (tmp.hasOwnProperty('material')) {
          const material = tmp.material;
          if (Object.prototype.toString.call(material) === '[object Array]') {
            material.forEach(m => {
              if (Object.prototype.toString.call(m) === '[object Array]') {
                m.forEach(i => {
                  i.dispose();
                });
              } else {
                m.dispose();
              }
            });
          } else {
            tmp.material.dispose();
          }
        }
        tmp.userData = {};
        scene.remove(tmp);
        objs.pop();
      }
    }
    // 组件卸载时调用
    return () => {
      const destory = () => {
        //销毁obj

        if (vnThree && vnThree.scene) {
          TWEEN.removeAll(); //tween
          cancelAnimationFrame(vnThree.frame); //animationFrame
          vnThree.clear(); //event

          vnThree.canvasDom = null;
          vnThree.canvasRender = null;

          let scene = vnThree.scene;
          scene.children.forEach(obj => (obj.userData = {}));

          dispose(vnThree.v_nodes, scene);
          dispose(vnThree.nodes, scene);

          dispose(vnThree.links, scene);

          dispose(
            Object.keys(vnThree.planes).map(key => vnThree.planes[key]),
            scene
          );

          vnThree.planeSprites = null;
          vnThree.planes = null;

          let i = 0;
          let objs = scene.children;

          while (i < objs.length) {
            const obj = objs[i];
            if (obj.dispose) obj.dispose();
            if (obj.hasOwnProperty('geometry')) obj.geometry.dispose();
            if (obj.hasOwnProperty('material')) {
              const material = obj.material;
              if (Object.prototype.toString.call(material) === '[object Array]') {
                material.forEach(m => m.dispose());
              } else {
                obj.material.dispose();
              }
            }
            obj.userData = {};
            scene.remove(obj);
          }

          scene = null;
        }
      };
      destory();
      vnThree.reset();
    };
  }, [init, data, serviceData,dataModel, modeRef, type, netType]);

  return (
    <div>
      <div id="container-canvas">
        <div id="label"></div>
      </div>
    </div>
  );
}
