// 对应数据库service_front表
// mapping中的node，对应数据库中serviceMapping_front表
// mapping中的link-v，对应数据库中logicalVirtualLink_front表
// mapping中的link-p，对应数据库中logicalPhysicalLink_front表

const serviceData = {
  code: 1,
  msg: '成功',
  data: [
    {
      serviceInformation: {
        service: {
          serviceType: 'chainService',
          bandwidth: '2000000',
          description: null,
          serviceId: 'chainService_0',
          serviceName: '新业务0',
          status: null,
        },
      },
      mapping: {
        node: {
          virtualNode: ['140_v', '145_v'],
          physicalNode: ['140', '145'],
        },
        link: {
          virtualLink: [
            {
              id: '140_v_145_v_chainService_0',
              node1: {
                id: '140_v',
                port: null,
              },
              node2: {
                id: '145_v',
                port: null,
              },
            },
          ],
          physicalLink: [
            {
              id: null,
              node1: {
                id: 'ODL_140_terminal',
                port: null,
                type: 'terminal',
              },
              node2: {
                id: '140',
                port: '140_3',
                type: 'physical',
              },
            },
            {
              id: 'link140-141',
              node1: {
                id: '140',
                port: '140_1',
                type: 'physical',
              },
              node2: {
                id: '141',
                port: '141_1',
                type: 'physical',
              },
            },
            {
              id: 'link141-144',
              node1: {
                id: '141',
                port: '141_3',
                type: 'physical',
              },
              node2: {
                id: '144',
                port: '144_2',
                type: 'physical',
              },
            },
            {
              id: 'link144-145',
              node1: {
                id: '144',
                port: '144_1',
                type: 'physical',
              },
              node2: {
                id: '145',
                port: '145_2',
                type: 'physical',
              },
            },

            {
              id: null,
              node1: {
                id: '145',
                port: '145_2',
                type: 'physical',
              },
              node2: {
                id: 'SR_145_terminal',
                port: null,
                type: 'terminal',
              },
            },
          ],
        },
      },
    },
  ],
};
exports.serviceData = serviceData;
