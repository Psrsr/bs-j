import React,{useEffect,useState} from 'react';
import { Button,Input,Form,Table,Popconfirm, Select } from 'antd';
import './network.css'
import { getNetwork } from '../../api';


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
        getNetwork(listData).then(({ data }) => {
           setTableData(data.list)
        })
    }

    const onChange = (value) => {
      };
      
      const onSearch = (value) => {
        console.log('search:', value);
      };
      

    const columns = [
        {
          title: 'id',
          dataIndex: 'age'
        },
        {
          title: '节点编号',
          dataIndex: 'name'
        },/*,
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
        /*},*/
        {
          title: 'cpu占用率',
          dataIndex: 'cpu'
        },
        {
          title: 'memory占用率',
          dataIndex: 'memory'
        },
        {
          title: 'disk占用率',
          dataIndex: 'disk'
        },
        {
          title: '节点状态',
          dataIndex: 'addr'
        },
        {
          title: '当前部署容器实例数量',
          dataIndex: 'sex'
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
                <Select
                    showSearch
                    placeholder="选择节点类型"
                    optionFilterProp="label"
                    onChange={onChange}
                    onSearch={onSearch}
                    options={[
                        {
                            value: '算力节点',
                            label: '算力节点',
                        },
                        {
                            value: '路由节点',
                            label: '路由节点',
                        },
                    ]}
                />
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