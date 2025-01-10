import React,{useEffect,useState} from 'react';
import { Button,Input,Form,Table,Popconfirm } from 'antd';
import './application.css'
import { getDependenttask } from '../../api';
import { useNavigate } from 'react-router-dom'

//页面
const User = () => {//
    const navigate = useNavigate()
    const [listData, setListData] = useState({
        name: ""
      })
    const [tableData, setTableData] = useState([])
    const handleClick = (type, rowData)=> {
        navigate('/application/getDependenttaskTopo');
    }

    const handleFinish = (e)=> {
        setListData({
            name:e.name
        })
    }

    const handleDelete = ({ id }) => {
        
    }

    const getTableData = () => {
        getDependenttask(listData).then(({ data }) => {
           setTableData(data.list)
        })
    }

    const columns = [
        {
          title: '任务名称',
          dataIndex: 'name'
        },
        {
          title: '所属业务类型',
          dataIndex: 'addr'
        },
        {
          title: '任务创建时间',
          dataIndex: 'birth'
        },
        {
          title: '任务计算完成所需时间',
          dataIndex: 'memory',
         /* render: (val) => {
            return val ? '女' : '男'
          }*/
        },
        {
            title: '任务详情',
            render: (rowData) => {
              return (
                <div className="flex-box">
                  <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', rowData)}>查看详情</Button>
                </div>
              )
            }
        }
       /*,
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
                    <Form.Item
                        name="keyword"
                    >
                        <Input placeholder="请输入任务名称或业务类型" />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" type="primary">搜索</Button>
                    </Form.Item>
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