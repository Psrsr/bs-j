//js 中的 [] {} 的等号赋值都是引用
function deepClone(obj) {
  let res;
  if (obj !== null && typeof obj === 'object') {
    res = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      res[key] = deepClone(obj[key]);
    }
  } else {
    res = obj;
  }
  return res;
}

function equal(a, b) {
  //普遍情况,他俩就是一个并且引用也一样
  if (a === b) return true;

  if (typeof a === 'string') {
    return a === b;
  }

  //先排除不是一个类型的情况
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) return false;

  //toString 排除一部分
  if (
    a instanceof Function ||
    a instanceof Date ||
    a instanceof RegExp ||
    a instanceof String ||
    (a instanceof Number && isNaN(a))
  ) {
    //包含了NaN的情况，并且1.0与1相等
    return a.toString() === b.toString();
  }

  //剩余的Number要单独判断，因为js数字后面小数点可能很多
  // instanceof左侧必须是对象，但是传入数字135.9461680554974时，a不是对象
  //但是 a.constructor==='Number'
  /*example:
        let a= 135.9461680554974;
        let b=135.94616805549742;
        a instanceof Number
        a.constructor
    */
  if (typeof a === 'number') {
    return Math.abs(a - b) < 1e-3;
  }

  // array 和 object的情况
  if (Array.isArray(a) && a.length === b.length) {
    let i = 0;
    while (i < a.length) {
      if (!equal(a[i], b[i])) return false;
      i++;
    }
    return true;
  }

  //object
  //由于主要还是会判断两个同类型object的相等，因此不用constructor等属性筛选
  let keysa = Object.keys(a);
  let keysb = Object.keys(b);
  if (keysa.length !== keysb.length) return false;
  //for (let k in a) 会遍历原型上的属性 因此可能不符合需求，改为以下方式
  for (let k of keysa) {
    if (!b.hasOwnProperty(k)) return false;
    else {
      if (!equal(a[k], b[k])) return false;
    }
  }
  return true;
}

function memorize(fn) {
  let cach = {};
  let last = null; //参数为空时，返回上次保存的结果
  return function () {
    let arg_str = JSON.stringify(arguments);
    if (arguments.length > 0) last = arg_str;
    else {
      return cach[last];
    }

    if (!cach[arg_str]) {
      //暂时只存一个结果
      cach = {};
      //apply的原因在于将arguments按原数据格式传入fn；
      cach[arg_str] = fn.apply(null, arguments);
    }
    return cach[arg_str];
  };
}

export { deepClone, equal, memorize };
