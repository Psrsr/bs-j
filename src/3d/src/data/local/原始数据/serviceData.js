// 对应数据库service_front表
// mapping中的node，对应数据库中serviceMapping_front表
// mapping中的link-v，对应数据库中logicalVirtualLink_front表
// mapping中的link-p，对应数据库中logicalPhysicalLink_front表

const serviceData = [
  {
    serviceid: 's1',
    type: 'test',
    mapping: {
      node: {
        // 用于标识节点的一一对应，每个index是对应的
        virtual: ['201_v', '211_v'],
        physical: ['201', '211'],
      },
      link: {
        virtual: [
          { id: 's1vlink1', node1: { id: '201_v', port: '1' }, node2: { id: '211_v', port: '2' } },
        ],
        physical: [
          { id: 's1plink1', node1: { id: '201', port: '7' }, node2: { id: '111', port: '8' } },
          { id: 's1plink2', node1: { id: '111', port: '7' }, node2: { id: '21', port: '8' } },

          { id: 's1plink3', node1: { id: '21', port: '11' }, node2: { id: '113', port: '12' } },
          { id: 's1plink4', node1: { id: '113', port: '13' }, node2: { id: '211', port: '14' } },
        ],
      },
    },
  },

  {
    serviceid: 's2',
    type: 'test',
    mapping: {
      node: {
        // 用于标识节点的一一对应，每个index是对应的
        virtual: ['441_v', '311_v'],
        physical: ['441', '311'],
      },
      link: {
        virtual: [
          { id: 's2vlink1', node1: { id: '441_v', port: '1' }, node2: { id: '311_v', port: '2' } },
        ],
        physical: [
          { id: 's2plink1', node1: { id: '441', port: '7' }, node2: { id: '105', port: '8' } },
          { id: 's2plink2', node1: { id: '105', port: '7' }, node2: { id: '21', port: '8' } },
          { id: 's2plink3', node1: { id: '21', port: '7' }, node2: { id: '31', port: '8' } },

          { id: 's2plink4', node1: { id: '31', port: '11' }, node2: { id: '135', port: '12' } },
          { id: 's2plink5', node1: { id: '135', port: '13' }, node2: { id: '311', port: '14' } },
        ],
      },
    },
  },

  {
    serviceid: 's3',
    type: 'test',
    mapping: {
      node: {
        // 用于标识节点的一一对应，每个index是对应的
        virtual: ['291_v', '231_v', '371_v'],
        physical: ['291', '231', '371'],
      },
      link: {
        virtual: [
          { id: 's3vlink1', node1: { id: '291_v', port: '1' }, node2: { id: '231_v', port: '2' } },
          { id: 's3vlink2', node1: { id: '231_v', port: '1' }, node2: { id: '371_v', port: '2' } },
          { id: 's3vlink3', node1: { id: '371_v', port: '1' }, node2: { id: '291_v', port: '2' } },
        ],
        physical: [
          { id: 's3plink1', node1: { id: '291', port: '7' }, node2: { id: '131', port: '8' } },
          { id: 's3plink2', node1: { id: '131', port: '7' }, node2: { id: '31', port: '8' } },
          { id: 's3plink3', node1: { id: '31', port: '7' }, node2: { id: '21', port: '8' } },
          { id: 's3plink4', node1: { id: '21', port: '11' }, node2: { id: '117', port: '12' } },
          { id: 's3plink5', node1: { id: '117', port: '13' }, node2: { id: '231', port: '14' } },
          { id: 's3plink6', node1: { id: '231', port: '4' }, node2: { id: '232', port: '14' } },
          { id: 's3plink7', node1: { id: '232', port: '13' }, node2: { id: '118', port: '14' } },
          { id: 's3plink8', node1: { id: '118', port: '13' }, node2: { id: '22', port: '14' } },
          { id: 's3plink9', node1: { id: '22', port: '13' }, node2: { id: '21', port: '14' } },
          { id: 's3plink10', node1: { id: '21', port: '13' }, node2: { id: '41', port: '14' } },
          { id: 's3plink11', node1: { id: '41', port: '13' }, node2: { id: '149', port: '14' } },
          { id: 's3plink12', node1: { id: '149', port: '13' }, node2: { id: '371', port: '14' } },
          { id: 's3plink13', node1: { id: '371', port: '13' }, node2: { id: '372', port: '14' } },
          { id: 's3plink14', node1: { id: '372', port: '13' }, node2: { id: '150', port: '14' } },
          { id: 's3plink15', node1: { id: '150', port: '13' }, node2: { id: '42', port: '14' } },
          { id: 's3plink16', node1: { id: '42', port: '13' }, node2: { id: '32', port: '14' } },
          { id: 's3plink17', node1: { id: '32', port: '13' }, node2: { id: '132', port: '14' } },
          { id: 's3plink18', node1: { id: '132', port: '13' }, node2: { id: '292', port: '14' } },
          { id: 's3plink19', node1: { id: '292', port: '13' }, node2: { id: '291', port: '14' } },
        ],
      },
    },
  },
];

exports.serviceData = serviceData;
