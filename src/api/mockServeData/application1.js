// mock数据模拟
import Mock from 'mockjs'

// 图表数据
let List = []
export default {
  getStatisticalData: () => {
    //Mock.Random.float 产生随机数100到8000之间 保留小数 最小0位 最大0位
    for (let i = 0; i < 7; i++) {
      List.push(
        Mock.mock({
          苹果: Mock.Random.float(100, 8000, 0, 0),
          vivo: Mock.Random.float(100, 8000, 0, 0),
          oppo: Mock.Random.float(100, 8000, 0, 0),
          魅族: Mock.Random.float(100, 8000, 0, 0),
          三星: Mock.Random.float(100, 8000, 0, 0),
          小米: Mock.Random.float(100, 8000, 0, 0)
        })
      )
    }
    return {
      code: 20000,
      data: {
        // 饼图
        videoData: [
          {
            name: '小米',
            value: 2999
          },
          {
            name: '苹果',
            value: 5999
          },
          {
            name: 'vivo',
            value: 1500
          },
          {
            name: 'oppo',
            value: 1999
          },
          {
            name: '魅族',
            value: 2200
          },
          {
            name: '三星',
            value: 4500
          }
        ],
        // 柱状图
        userData: [
          {
            date: '周一',
            new: 5,
            active: 200
          },
          {
            date: '周二',
            new: 10,
            active: 500
          },
          {
            date: '周三',
            new: 12,
            active: 550
          },
          {
            date: '周四',
            new: 60,
            active: 800
          },
          {
            date: '周五',
            new: 65,
            active: 550
          },
          {
            date: '周六',
            new: 53,
            active: 770
          },
          {
            date: '周日',
            new: 33,
            active: 170
          }
        ],
        // 折线图
        orderData: {
          date: ['20191001', '20191002', '20191003', '20191004', '20191005', '20191006', '20191007'],
          data: List
        },
        tableData: [
          {
            name: 'sutask0_0',
            todayBuy: 'contain0_0_0',
            node:'node0',
            statu:'完成'
          },
          {
            name: 'sutask0_1',
            todayBuy: 'contain0_1_2',
            node:'node7',
            statu:'完成'
          },
          {
            name: 'sutask0_2',
            todayBuy: 'contain0_2_0',
            node:'node11',
            statu:'完成'
          },
          {
            name: 'sutask0_3',
            todayBuy: 'contain0_3_1',
            node:'node17',
            statu:'完成'
          },
          {
            name: 'sutask0_4',
            todayBuy: 'contain0_4_1',
            node:'node16',
            statu:'完成'
          },
          {
            name: 'sutask0_5',
            todayBuy: 'contain0_5_2',
            node:'node20',
            statu:'正在计算'
          }
        ]
      }
    }
  }
}