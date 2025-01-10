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
          CPU: Mock.Random.float(0, 1),
          Memory: Mock.Random.float(0, 1),
          Disk: Mock.Random.float(0, 1)
        })
      )
    }
    return {
      code: 20000,
      data: {
        // 饼图
        videoData: [
          {
            name: '业务类型0依赖型任务数量',
            value: 5
          },
          {
            name: '业务类型1依赖型任务数量',
            value: 6
          },
          {
            name: '业务类型2依赖型任务数量',
            value: 7
          },
          {
            name: '业务类型3依赖型任务数量',
            value: 8
          },
          {
            name: '业务类型4依赖型任务数量',
            value: 9
          }
        ],
        // 柱状图
        userData: [
          {
            date: '业务类型0',
            active: 500
          },
          {
            date: '业务类型1',
            active: 550
          },
          {
            date: '业务类型2',
            active: 800
          },
          {
            date: '业务类型3',
            active: 550
          },
          {
            date: '业务类型4',
            active: 770
          }
        ],
        // 折线图
        orderData: {
          date: ['node1', 'node5', 'node7', 'node10', 'node11', 'node16', 'node17','node20','node24'],
          data: List
        },
        tableData: [
          {
            name: 'oppo',
            todayBuy: 0.5,
            monthBuy: 0.6,
            totalBuy: 0.7
          },
          {
            name: 'vivo',
            todayBuy: 300,
            monthBuy: 2200,
            totalBuy: 24000
          },
          {
            name: '苹果',
            todayBuy: 800,
            monthBuy: 4500,
            totalBuy: 65000
          },
          {
            name: '小米',
            todayBuy: 1200,
            monthBuy: 6500,
            totalBuy: 45000
          },
          {
            name: '三星',
            todayBuy: 300,
            monthBuy: 2000,
            totalBuy: 34000
          },
          {
            name: '魅族',
            todayBuy: 350,
            monthBuy: 3000,
            totalBuy: 22000
          }
        ]
      }
    }
  }
}
