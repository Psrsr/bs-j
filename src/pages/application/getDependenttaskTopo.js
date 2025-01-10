import React,{useEffect, useState} from 'react';
import "./application.css"
import { Row, Col, Button, Card, Table } from 'antd';
import {getApplication1} from '../../api'


const columns = [
    {
      title: '子任务编号',
      dataIndex: 'name'
    },
    {
      title: '分配容器编号',
      dataIndex: 'todayBuy'
    },
    {
        title: '容器所属节点',
        dataIndex: 'node'
    },
    {
        title: '子任务完成状态',
        dataIndex: 'statu'
    }
  ]

//页面
const Home = () => {//函数式组件
    const userImage = require("../../assets/images/dependenttaskTopo.png")
    useEffect(() =>{
        getApplication1().then(({data}) => {
            const {tableData} = data.data
            setTableData(tableData)
        })
    },[])
    const [tableData, setTableData] = useState([])
    return(
        <Row className="home">
            <Col span= {24}>
                
                    <div className="user">
                        <img src={userImage}/>
                    </div>
               
                <Card>
                   <Table rowKey={"name"} columns={columns} dataSource={tableData} pagination={false} />
                </Card>
            </Col>
        </Row>
    )
}

export default Home;