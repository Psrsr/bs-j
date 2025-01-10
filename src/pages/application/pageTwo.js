
import './application.css'
import { getUser } from '../../api';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table,Select,InputNumber } from 'antd';
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const handleClick = (type, rowData)=> {

}
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingInlineEnd: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      name: 'Edward King 0',
      age: '32',
      address: 'London, Park Lane no. 0',
    },
    {
      key: '1',
      name: 'Edward King 1',
      age: '32',
      address: 'London, Park Lane no. 1',
    },
  ]);
  const [count, setCount] = useState(2);
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const onChange = (value) => {
};

const onSearch = (value) => {
  console.log('search:', value);
};
  const defaultColumns = [
    {
      title: '业务类型',
      dataIndex: 'name',
      width: '30%',
      render: (_, record) =>{
        return(
            <Select
                    showSearch
                    placeholder="选择业务类型"
                    optionFilterProp="label"
                    onChange={onChange}
                    onSearch={onSearch}
                    options={[
                        {
                            value: '业务类型0',
                            label: '业务类型0',
                        },
                        {
                            value: '业务类型1',
                            label: '业务类型1',
                        },
                        {
                            value: '业务类型2',
                            label: '业务类型2',
                        },
                        {
                            value: '业务类型3',
                            label: '业务类型3',
                        },
                        {
                            value: '业务类型4',
                            label: '业务类型4',
                        },
                        {
                            value: '业务类型5',
                            label: '业务类型5',
                        }
                    ]}
                />
        )
      }
    },
    {
      title: '查看业务详情',
      dataIndex: 'age',
      render: (_, record) =>{
        return(
            <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', record)}>业务详情</Button>
        )
      }
    },
    {
      title: '所需创建任务数量',
      dataIndex: 'address',
      render: (_, record) =>{
        return(
            <InputNumber min={1} max={10} defaultValue={0} onChange={onChange} />
        )
      }
        
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.key)}>
             <Button style={{marginRight: '5px'}} onClick={() => handleClick('edit', record)}>删除</Button>
          </Popconfirm>
        ) : null,
    },
  ];
  const handleAdd = () => {
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: '32',
      address: `London, Park Lane no. ${count}`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handlerequest = () => {
  };
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
      <div>
          <div className="flex-box space-between">
              <Button
                  onClick={handleAdd}
                  type="primary"
                  style={{
                      marginBottom: 16,
                  }}
              >
                  增加业务类型
              </Button>
              <Button
                  onClick={handlerequest}
                  type="primary"
                  style={{
                      marginBottom: 16,
                  }}
              >
                  请求下发
              </Button>

          </div>
      

      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};
export default App;