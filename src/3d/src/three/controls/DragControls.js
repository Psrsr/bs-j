import { front_userData, _userData } from '../utils/userData.js';
import { isType } from '../utils/userData';
import {
  EventDispatcher,
  Matrix4,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from '/node_modules/three/build/three.module';
import { deepClone } from '../../utils.js';

var DragControls = function (_objects, _camera, _domElement) {
  var normal = new Vector3(0, 1, 0); //test
  var _plane = new Plane(normal);

  var _raycaster = new Raycaster();

  var _mouse = new Vector2();
  var _offset = new Vector3();
  var _intersection = new Vector3();
  var _worldPosition = new Vector3();
  var _inverseMatrix = new Matrix4();
  var _intersections = [];

  var _selected = null,
    _hovered = null;
  var scope = this;

  function activate() {
    _domElement.addEventListener('pointermove', onPointerMove);
    _domElement.addEventListener('pointerdown', onPointerDown);
    _domElement.addEventListener('pointerup', onPointerCancel);
    _domElement.addEventListener('pointerleave', onPointerCancel);
  }

  function deactivate() {
    _domElement.removeEventListener('pointermove', onPointerMove);
    _domElement.removeEventListener('pointerdown', onPointerDown);
    _domElement.removeEventListener('pointerup', onPointerCancel);
    _domElement.removeEventListener('pointerleave', onPointerCancel);
    _domElement.style.cursor = '';
  }

  function dispose() {
    deactivate();
  }

  function getObjects() {
    return _objects;
  }

  function onPointerMove(event) {
    event.preventDefault();
    //test 类似orbitcontrol 先判断是否enable 再进行下一步
    if (scope.enabled === false) return;

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        onMouseMove(event);
        break;
      default:
        break;
    }
  }

  function onMouseMove(event) {
    var rect = _domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / _domElement.offsetWidth) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / _domElement.offsetHeight) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

        scope.dispatchEvent({ type: 'drag', object: { _selected, _intersection } });
      }
      //test：移动到上面去以控制流程
      // scope.dispatchEvent({ type: 'drag', object: {_selected,_intersection} });

      return;
    }

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);
    //test 添加过滤
    _intersections = clickThrough(_intersections);

    if (_intersections.length > 0) {
      var object = _intersections[0].object;

      //test 平面设置为xoz
      _plane.setFromNormalAndCoplanarPoint(
        new Vector3(0, 1, 0),
        _worldPosition.setFromMatrixPosition(object.matrixWorld)
      );

      if (_hovered !== object) {
        scope.dispatchEvent({ type: 'hoveron', object: object });
        _hovered = object;
      }
    } else {
      if (_hovered !== null) {
        scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

        _domElement.style.cursor = 'auto';
        _hovered = null;
      }
    }
  }

  function onPointerDown(event) {
    event.preventDefault();

    switch (event.pointerType) {
      case 'mouse':
        if (event.button === 2) {
          onMouseDown(event);
        }
        break;
      default:
        break;
    }
  }

  function onMouseDown(event) {
    event.preventDefault();

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    //test 添加过滤
    _intersections = clickThrough(_intersections);
    //test: 不允许移动平面

    if (_intersections.length > 0) {
      const obj = _intersections[0].object;

      if (isType(obj, 'plane') || isType(obj, 'Line2') || isType(obj, 'nodeSprite')) {
        console.log(obj);
        console.log('不允许移动');
        return;
      }
    }
    if (_intersections.length > 0) {
      _selected = scope.transformGroup === true ? _objects[0] : _intersections[0].object;
      //test:记录原位置
      _selected && front_userData(_selected, 'posbeforedrag', deepClone(_selected.position));

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
        _offset
          .copy(_intersection)
          .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
      }
      //test：增加判断，使不允许drag的时候，
      //不会触发dragstart来阻止orbit,并且鼠标手势不会改变
      if (!scope.enabled) return;

      _domElement.style.cursor = 'move';
      scope.dispatchEvent({ type: 'dragstart', object: _selected });
    }
  }

  function onPointerCancel(event) {
    event.preventDefault();

    switch (event.pointerType) {
      case 'mouse':
        if (event.button === 2) {
          onMouseCancel(event);
        }
        break;
      default:
        break;
    }
  }

  function onMouseCancel(event) {
    event.preventDefault();

    if (_selected) {
      scope.dispatchEvent({ type: 'dragend', object: _selected });

      _selected = null;
    }

    _domElement.style.cursor = 'auto'; //test 删除上面并增加此条
  }

  function onTouchMove(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
      }

      scope.dispatchEvent({ type: 'drag', object: _selected });

      return;
    }
  }

  function onTouchStart(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    //test
    _intersections = clickThrough(_intersections);

    if (_intersections.length > 0) {
      _selected = scope.transformGroup === true ? _objects[0] : _intersections[0].object;

      _plane.setFromNormalAndCoplanarPoint(
        _camera.getWorldDirection(_plane.normal),
        _worldPosition.setFromMatrixPosition(_selected.matrixWorld)
      );

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
        _offset
          .copy(_intersection)
          .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
      }

      _domElement.style.cursor = 'move';

      scope.dispatchEvent({ type: 'dragstart', object: _selected });
    }
  }

  function onTouchEnd(event) {
    event.preventDefault();

    if (_selected) {
      scope.dispatchEvent({ type: 'dragend', object: _selected });

      _selected = null;
    }

    _domElement.style.cursor = 'auto';
  }

  activate();

  // API

  this.enabled = true;
  this.transformGroup = false;

  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  this.getObjects = getObjects;

  //test：新增clickThrough，使非visible物体无法通过自身被移动

  function clickThrough(intersects) {
    while (intersects.length > 0 && intersects[0].object.visible === false) {
      intersects.shift();
    }
    //返回的物体不包含invisible obj3D
    return intersects;
  }
};

DragControls.prototype = Object.create(EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;

export { DragControls };
