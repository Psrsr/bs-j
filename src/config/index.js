export default  [
    {
        path: '/home',
        name: 'home',
        label: '网络拓扑',
        icon: 'HomeOutlined',
        url: '/home/index'
    },
    {
        path: '/application',
        label: '业务管理',
        icon: 'SettingOutlined',
        children: [
        {
            path: '/application/pageOne',
            name: 'page1',
            label: '业务一览',
            icon: 'SettingOutlined'
        },
        {
            path: '/application/pageTwo',
            name: 'page2',
            label: '请求下发',
            icon: 'SettingOutlined'
        },
        {
            path: '/application/contain',
            name: 'contain',
            label: '容器一览',
            icon: 'SettingOutlined'
        }
        ]
    },
    {
        path: '/network',
        name: 'network',
        label: '网络节点一览',
        icon: 'HomeOutlined',
        url: '/network/index'
    }/*,
    {
        path: '/contain',
        name: 'contain',
        label: '容器管理',
        icon: 'ShopOutlined',
        url: '/contain/index'
    }/*,
    {
        path: '/user',
        name: 'user',
        label: '用户管理',
        icon: 'UserOutlined',
        url: '/user/index'
    }*/
]