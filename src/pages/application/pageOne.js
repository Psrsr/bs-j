import React,{useEffect,useState} from 'react';
import { Button,Input,Form,Table,Popconfirm,Modal,Select,DatePicker,InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom'
import './application.css'
import { useForm } from 'antd/es/form/Form'
import { getUser } from '../../api';
import dayjs from 'dayjs'
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;

//页面
const User = () => {//
    const navigate = useNavigate()
    const [listData, setListData] = useState({
        name: ""
      })
    const [tableData, setTableData] = useState([])
    // 创建弹窗form实例
  const [form] = useForm()
      // 0（新增）1（编辑）
  const [modalType, setModalType] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const props = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
    const handleClick = (type, rowData)=> {
        navigate('/application/getApplication');
    }
    const handleClick1 = (type, rowData)=> {
        navigate('/application/getDependenttask');
    }
    const handleClick2 = (type, rowData) => {
        setIsModalOpen(true)
        if (type === 'add') {
          setModalType(0)
        } else {
          const cloneData = JSON.parse(JSON.stringify(rowData))
          cloneData.birth = dayjs(rowData.birth)
          setModalType(1)
          form.setFieldsValue(cloneData)
        }
      }

    const handleFinish = (e)=> {
        setListData({
            name:e.name
        })
    }

    const handleDelete = ({ id }) => {
        
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
    }
    // 成功提交的事件
    const handleOk = () => {
        form.validateFields().then((val) => {
            // 日期参数
            val.birth = dayjs(val.birth).format('YYYY-MM-DD')
            if (modalType) { // 编辑
            /*    editUser(val).then(() => {
                    // 关闭弹窗
                    handleCancel()
                    getTableData()
                })*/
            } else { // 新增
               /* addUser(val).then(() => {
                    // 关闭弹窗
                    handleCancel()
                    getTableData()
                })*/
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    const getTableData = () => {
        getUser(listData).then(({ data }) => {
           setTableData(data.list)
        })
    }

    const columns = [
        {
          title: '业务编号',
          dataIndex: 'age'
        },
        {
            title: '业务类型',
            dataIndex: 'name'
        },
        {
          title: '总任务数',
          dataIndex: 'sex',
         /* render: (val) => {
            return val ? '女' : '男'
          }*/
        },
        {
          title: '业务详情',
          render: (rowData) => {
            return (
              <div className="flex-box">
                <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', rowData)}>查看详情</Button>
              </div>
            )
          }
        },
        {
          title: '任务详情',
          render: (rowData) => {
            return (
              <div className="flex-box">
                <Button style={{marginRight: '5px'}} onClick={() => handleClick1('edit', rowData)}>查看详情</Button>
              </div>
            )
          }
        },
        {
          title: '操作',
          render: (rowData) => {
            return (
              <div className="flex-box">
                <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', rowData)}>编辑</Button>
                <Popconfirm
                  title="提示"
                  description="此操作将删除该业务, 是否继续?"
                  okText="确认"
                  cancelText="取消"
                  onConfirm={() => handleDelete(rowData)}
                >
                  <Button type="primary" danger>删除</Button>
                </Popconfirm>
              </div>
            )
          }
        }
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
            <Modal
                open={isModalOpen}
                title={modalType ? '编辑用户' : '上传业务信息'}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖动文件至此区域</p>
                    <p className="ant-upload-hint">
                        支持单个或多个文件上传
                    </p>
                </Dragger>
            </Modal>
        </div>
    )
}

export default User;