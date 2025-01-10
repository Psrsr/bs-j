import React,{useEffect,useState} from 'react';
import { Button,Input,Form,Table,Popconfirm } from 'antd';
import './user.css'
import { getContain } from '../../api';


//页面
const User = () => {//
    
    const [listData, setListData] = useState({
        name: ""
      })
    const [tableData, setTableData] = useState([])
    const handleClick = (type, rowData)=> {

    }

    const handleFinish = (e)=> {
        setListData({
            name:e.name
        })
    }

    const handleDelete = ({ id }) => {
        
    }

    const getTableData = () => {
        getContain(listData).then(({ data }) => {
           setTableData(data.list)
        })
    }

    const columns = [
        {
          title: 'id',
          dataIndex: 'age'
        },
        {
          title: '容器编号',
          dataIndex: 'name'
        },
        {
          title: '对应业务子模块',
          dataIndex: 'birth'
        },
        {
          title: '所处算力节点编号',
          dataIndex: 'sex',
         /* render: (val) => {
            return val ? '女' : '男'
          }*/
        },
        {
          title: 'cpu需求',
          dataIndex: 'cpu'
        },
        {
          title: 'memory需求',
          dataIndex: 'memory'
        },
        {
          title: 'disk需求',
          dataIndex: 'disk'
        },
        {
          title: '容器状态',
          dataIndex: 'addr'
        },
        {
          title: '当前计算子任务',
          dataIndex: 'subtask'
        }/*,
        {
          title: '操作',
          render: (rowData) => {
            return (
              <div className="flex-box">
                <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', rowData)}>编辑</Button>
                <Popconfirm
                  title="提示"
                  description="此操作将删除该用户, 是否继续?"
                  okText="确认"
                  cancelText="取消"
                  onConfirm={() => handleDelete(rowData)}
                >
                  <Button type="primary" danger>删除</Button>
                </Popconfirm>
              </div>
            )
          }
        }*/
    ]

    useEffect(() => {
        getTableData()
    }, [])

    return(
        <div>
            <div className="flex-box space-between">
                <Form
                    layout="inline"
                    onFinish={handleFinish}
                >
                </Form>
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey={"id"}
            />
        </div>
    )
}

export default User;