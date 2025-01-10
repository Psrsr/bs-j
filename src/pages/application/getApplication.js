import React,{useEffect, useState} from 'react';
import "./application.css"
import { Row, Col, Button, Card, Table } from 'antd';
import {getApplication} from '../../api'


const columns = [
    {
      title: '业务功能模块编号',
      dataIndex: 'name'
    },
    {
      title: '功能',
      dataIndex: 'todayBuy'
    },
    {
      title: '前驱模块',
      dataIndex: 'monthBuy'
    },
    {
      title: '后继模块',
      dataIndex: 'totalBuy'
    }
  ]

//页面
const Home = () => {//函数式组件
    const userImage = require("../../assets/images/dependenttask1.png")
    useEffect(() =>{
        getApplication().then(({data}) => {
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