import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { equal } from '../../utils';

// anime动画
function moveAndLookAtAnime(controls, dstpos, dstlookat, options, state) {
  options || (options = { duration: 1000 });
  const origpos = new THREE.Vector3().copy(controls.object.position); // original position
  const origrot = new THREE.Euler().copy(controls.object.rotation); // original rotation
  //先设置好dst 并通过dst获取到相应的四元数数据 再设置回去
  controls.object.position.set(dstpos.x, dstpos.y, dstpos.z);
  //此处需要设置相机朝向
  controls.object.lookAt(dstlookat);

  const dstrot = new THREE.Euler().copy(controls.object.rotation);

  // reset original position and rotation
  controls.object.position.set(origpos.x, origpos.y, origpos.z);
  controls.object.rotation.set(origrot.x, origrot.y, origrot.z);

  //获取Zoom属性
  const orizoom = controls.object.zoom;
  const dstzoom = getdstzoom(state);

  //对所需数据进行汇总
  if (equal(origpos, dstpos) && equal(origrot, dstrot) && equal(orizoom, dstzoom)) {
    return;
  }

  // Tweening
  // position
  new TWEEN.Tween(controls.object.position)
    .to(
      {
        x: dstpos.x,
        y: dstpos.y,
        z: dstpos.z,
      },
      options.duration
    )
    .start();

  // rotation (using slerp)
  (function () {
    var qa = new THREE.Quaternion().copy(controls.object.quaternion); // src quaternion
    var qb = new THREE.Quaternion().setFromEuler(dstrot); // dst quaternion
    var qm = new THREE.Quaternion();

    var o = { t: 0 };
    new TWEEN.Tween(o)
      .to({ t: 1 }, options.duration)
      .onUpdate(function () {
        //qm从qa变化到qb o.t为变化因子
        THREE.Quaternion.slerp(qa, qb, qm, o.t);
        controls.object.quaternion.set(qm.x, qm.y, qm.z, qm.w);
      })
      .start()
      .onComplete(() => {});
  }.call(this));

  //zoom
  new TWEEN.Tween({ z: orizoom })
    .to({ z: dstzoom }, options.duration)
    .onUpdate(function () {
      controls.object.zoom = this._object.z;
      controls.object.updateProjectionMatrix();
    })
    .start();

  function getdstzoom(state) {
    return state === 1 ? 2 : 1;
  }
}

function createMoveByCurveAnime(posArray, movedObj) {
  const curvePath = new THREE.CurvePath();
  posArray.forEach((pos, i) => {
    //curvePath应该不用dispose释放内存，因为不是obj3D，基类是Curve
    //pos.node1 pos.node2
    if (i < posArray.length - 1) {
      curvePath.add(
        new THREE.LineCurve3(
          new THREE.Vector3(posArray[i].x, posArray[i].y, posArray[i].z),
          new THREE.Vector3(posArray[i + 1].x, posArray[i + 1].y, posArray[i + 1].z)
        )
      );
    }
  });
  const a1 = new TWEEN.Tween({ t: 1 }).to({ t: 0 }, 3000).onUpdate(function () {
    const pos = curvePath.getPoint(this._object.t);
    if (pos) movedObj.position.set(pos.x, pos.y, pos.z);
  });

  a1.repeat(Infinity)
    .start()
    .onStop(() => {});
  return a1;
}

function tipArrowAnime(arrowObj3D) {
  const oriPos = arrowObj3D.position;
  const oriY = oriPos.y;
  const targetY = oriY - 5;
  const down = new TWEEN.Tween({ y: oriY })
    .to({ y: targetY }, 1200)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .onUpdate(function () {
      arrowObj3D.position.set(oriPos.x, this._object.y, oriPos.z);
    });

  const up = new TWEEN.Tween({ y: targetY }).to({ y: oriY }, 200).onUpdate(function () {
    arrowObj3D.position.set(oriPos.x, this._object.y, oriPos.z);
  });

  const stop = new TWEEN.Tween({ t: 0 }).to({ t: 1 }, 500);
  down.chain(up);
  up.chain(stop);
  stop.chain(down);

  down.start();

  return down;
}

export { moveAndLookAtAnime, createMoveByCurveAnime, tipArrowAnime };
