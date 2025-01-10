import React from 'react';
import { chooseServiceMapping, showService } from '../../three/service/serviceMapping';
import { Collapse } from 'antd';
import { _userData } from '../../three/utils/userData';
import { vnThree } from '../../three/initThree';
import './index.css';

export default function SuspensionFrame(props) {
  const { Panel } = Collapse;
  const { init, serviceData, sfUpdate, data } = props;
  let { serviceLines, v_nodes, scene, composer } = vnThree ? vnThree : {};

  function callback(key) {
    if (!vnThree || !serviceLines || !scene || !composer || !v_nodes) {
      return null;
    }

    const outlinePass = composer.passes[1];

    let id = null;
    if (key) {
      id = serviceData[key[key.length - 1]].serviceid;
    }

    showService(
      chooseServiceMapping({ userData: { front: { serviceid: id } } }, 'all', scene, serviceData),
      outlinePass,
      scene,
      id,
      init,
      data,
      serviceData
    );
  }

  return (
    <div className="suspension-frame">
      <Collapse ghost={true} onChange={callback} accordion={true} style={{ width: '300px' }}>
        {serviceData
          ? serviceData.map((service, i) => {
              return (
                <Panel header={'业务名称 : ' + service.serviceid} key={i}>
                  <p className="frame-text">
                    节点映射:{' '}
                    {service.mapping.node.virtual.map((v, i) => {
                      return (
                        service.mapping.node.virtual[i] +
                        '--' +
                        service.mapping.node.physical[i] +
                        ' ; '
                      );
                    })}
                    <br />
                    <br />
                    连接映射：
                    <br />
                    虚拟层: {service.mapping.link.virtual.map(v => `${v.node1.id}->${v.node2.id};`)}
                    <br />
                    物理层:{' '}
                    {service.mapping.link.physical.map(v => `${v.node1.id}->${v.node2.id};`)}
                  </p>
                </Panel>
              );
            })
          : null}
      </Collapse>
    </div>
  );
}
