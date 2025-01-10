import React from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
  } from '@ant-design/icons';
  import { Button, Layout, Menu, theme } from 'antd';
  import CommonAside from '../components/commonAside';
  import CommonHeader from '../components/commonHeader';
  import { useSelector } from 'react-redux';
  const { Header, Sider, Content } = Layout;

//页面
const Main = () => {//函数式组件
    //const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    //获取展开收起状态
    const collapsed = useSelector(state => state.tab.isCollapse)

    return (
      <Layout className='main-container'>
        {

        }
        <CommonAside collapsed={collapsed}/>
        <Layout>
          <CommonHeader collapsed={collapsed}/>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet/>
          </Content>
        </Layout>
      </Layout>
    );
}


export default Main;