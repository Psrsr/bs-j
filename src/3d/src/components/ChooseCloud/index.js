import React, { useState } from 'react';
import { Select } from 'antd';
import { vnThree } from '../../three/initThree';
import { _userData } from '../../three/utils/userData';
import './index.css';

export default function ChooseCloud(props) {
  let { scene } = vnThree ? vnThree : {};
  const { init } = props;
  const [lastCloud, setLastCloud] = useState('init');

  function hideLastCloud() {
    Object.keys(lastCloud).map(index => {
      scene.children.forEach(obj => {
        if (
          _userData(obj, 'front', 'draw') === 'plane' &&
          _userData(obj, 'front', 'area') === lastCloud[index]
        ) {
          obj.material.opacity = 0;
        }

        if (
          (_userData(obj, 'front', 'draw') === 'node' ||
            _userData(obj, 'front', 'draw') === 'nodeSprite') &&
          _userData(obj, 'front', 'cloud') === lastCloud[index]
        ) {
          obj.visible = false;
        }
        if (
          _userData(obj, 'front', 'draw') === 'Line2' &&
          _userData(obj, 'front', 'cloud') === lastCloud[index]
        ) {
          obj.material.visible = false;
        }
      });
    });
  }
  function handleChange(value) {
    hideLastCloud();

    value.forEach(v => {
      scene.children.forEach(obj => {
        if (_userData(obj, 'front', 'draw') === 'plane' && _userData(obj, 'front', 'area') === v) {
          obj.material.opacity = 0.6;
        }

        if (
          (_userData(obj, 'front', 'draw') === 'node' ||
            _userData(obj, 'front', 'draw') === 'nodeSprite') &&
          _userData(obj, 'front', 'cloud') === v
        ) {
          obj.visible = true;
        }
        if (_userData(obj, 'front', 'draw') === 'Line2' && _userData(obj, 'front', 'cloud') === v) {
          obj.material.visible = true;
        }
      });
    });

    setLastCloud(value);
  }

  return (
    <div className="choose-cloud">
      <Select
        mode="multiple"
        allowClear
        style={{ width: 250 }}
        placeholder="请选择云"
        onChange={handleChange}
        bordered={false}
        className="select"
      >
        {init.map(p => {
          if (p.type === 'cloud')
            return (
              <Select.Option value={p.area} key={p.area}>
                {p.area}
              </Select.Option>
            );
        })}
      </Select>
    </div>
  );
}
