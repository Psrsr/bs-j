//前端数据设置在userdata中
function front_userData(obj, key, value) {
  try {
    if (!obj.userData['front']) obj.userData['front'] = {};
    //处理一下存储相关link的
    if (key === 'about') {
      if (!obj.userData['front']['about']) obj.userData['front']['about'] = [];
      obj.userData['front']['about'].push(value);
    } else if (key === 'aboutGuide') {
      if (!obj.userData['front']['aboutGuide']) obj.userData['front']['aboutGuide'] = [];
      obj.userData['front']['aboutGuide'].push(value);
    } else obj.userData['front'][key] = value;
  } catch (error) {
    console.log('错误:', error);
  }
}

//后端数据设置在userdata中
function back_userData(obj, key, value) {
  try {
    if (!obj.userData['back']) obj.userData['back'] = {};
    obj.userData['back'][key] = value;
  } catch (error) {
    console.log('错误:', error);
  }
}

function _userData(obj, type = 'front', key) {
  let res = undefined;
  try {
    if (key) res = obj.userData[type][key];
    else res = obj.userData[type];
  } catch (error) {
    // console.log('错误:', error);
  }
  return res;
}

//删除属性
function delete_userData(obj, type, key) {
  try {
    if (key) delete obj.userData[type][key];
  } catch (error) {
    // console.log('错误:', error);
  }
}

//主要用于判断3d物体的类型，不适用于js一般数据类型
function isType(obj, _constructor) {
  if (_constructor === 'node') {
    if (!obj) return false;
    if (obj.geometry.type === 'CylinderGeometry' && obj.name != 'lightEnd') return true;
  } else if (_constructor === 'Line2') {
    if (!obj) return false;
    if (obj.geometry.type === 'LineGeometry') return true;
    if (obj.geometry.type === 'TubeGeometry') return true;
  } else if (_constructor === 'plane') {
    if (!obj) return false;
    if (obj.geometry.type === 'BoxGeometry' && obj.name != 'lightEnd') return true;
  } else if (_constructor === 'end') {
    if (!obj) return false;
    if (obj.name == 'lightEnd') return true;
  } else if (_constructor === 'nodeSprite') {
    if (!obj) return false;
    if (obj.type == 'Sprite') return true;
  }
  return false;
}

export { front_userData, back_userData, delete_userData, _userData, isType };
