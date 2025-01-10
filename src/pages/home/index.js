import React, { useEffect, useState } from 'react'
import { Col, Row, Card, Table } from 'antd'
import { getData } from '../../api'
import "./home.css"
import * as Icon from "@ant-design/icons";
import MyEcharts from '../../components/echarts'
import { type } from '@testing-library/user-event/dist/type';
import Container3d from '../../3d/index.jsx';

const columns = [
  {
    title: '课程',
    dataIndex: 'name'
  },
  {
    title: '今日购买',
    dataIndex: 'todayBuy'
  },
  {
    title: '本月购买',
    dataIndex: 'monthBuy'
  },
  {
    title: '总购买',
    dataIndex: 'totalBuy'
  }
]
const countData = [
  {
    "name": "今日支付订单",
    "value": 1234,
    "icon": "CheckCircleOutlined",
    "color": "#2ec7c9"
  },
  {
    "name": "今日收藏订单",
    "value": 3421,
    "icon": "ClockCircleOutlined",
    "color": "#ffb980"
  },
  {
    "name": "今日未支付订单",
    "value": 1234,
    "icon": "CloseCircleOutlined",
    "color": "#5ab1ef"
  },
  {
    "name": "本月支付订单",
    "value": 1234,
    "icon": "CheckCircleOutlined",
    "color": "#2ec7c9"
  },
  {
    "name": "本月收藏订单",
    "value": 3421,
    "icon": "ClockCircleOutlined",
    "color": "#ffb980"
  },
  {
    "name": "本月未支付订单",
    "value": 1234,
    "icon": "CloseCircleOutlined",
    "color": "#5ab1ef"
  }
]
const iconToElement = (name) => React.createElement(Icon[name]);

const Home = () => {
  const userImg = require("../../assets/images/networktopo.png")
  const [tableData, setTableData] = useState([])
  const [echartData, setEchartData] = useState({})
  useEffect(() => {
    getData().then(({ data }) => {
      const { tableData, orderData, userData, videoData } = data.data
      setTableData(tableData)
      const order = orderData
      const xData = order.date
      const keyArray =  Object.keys(order.data[0])
      const series = []
      keyArray.forEach(key => {
        series.push({
          name: key,
          data: order.data,
          type: 'line'
        })
      })

    //   console.log(series)
      setEchartData({
        ...echartData,
        order: {
          xData,
          series
        },
        user: {
          xData: userData.map(item => item.date),
          series: [
            {
                name: '任务平均完成时间s',
                data: [20.56, 35.78, 40.43, 30.21, 37.45, 50.69],
                type:'bar'
            }
          ]
        },
        video: {
          series: [
            {
              data: videoData,
              type: 'pie'
            }
          ]
        }
      })
    })
  }, [])
  return (
    <Row className="home">
      <Col span={24}>
          <Container3d selectRow={[]} type={"service" }/>
        
      </Col>
      <Col style={{ marginTop: '10px' }} span={20}>
        <div className="num">
          {
            
          }
        </div>
      
        <div className="graph">
          { echartData.user && <MyEcharts chartData={echartData.user} style={{ width: '100%', height: '260px' }} /> }
          { echartData.video && <MyEcharts chartData={echartData.video} isAxisChart={false} style={{ width: '50%', height: '260px' }} /> }
        </div>
      </Col>
    </Row>
  )
}

export default Home