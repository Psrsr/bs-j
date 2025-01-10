import { createBrowserRouter,Navigate } from "react-router-dom";
import Main from '../pages/main';
import Home from "../pages/home";
import Mall from "../pages/network";
import User from "../pages/contain";
import pageOne from "../pages/application/pageOne";
import pageTwo from "../pages/application/pageTwo";
import Application from "../pages/application/getApplication"
import Dependenttask from "../pages/application/getDependenttask";
import DependenttaskTopo from "../pages/application/getDependenttaskTopo";
import { Component } from "react";

const routes = [
    {
        path: '/',//主路由
        Component: Main,
        children:[//子路由
            {//重定向
                path:'/',
                element: <Navigate to ="home" replace/>
            },
            {
                path: 'home',
                Component: Home
            },
            {
                path: 'network',
                Component: Mall
            },
            {
                path: 'application',
                children:[
                    {
                        path: 'pageOne',
                        Component: pageOne
                    },
                    {
                        path: 'pageTwo',
                        Component: pageTwo
                    },
                    {
                        path: 'contain',
                        Component: User
                    },
                    {
                        path: 'getApplication',
                        Component: Application
                    },
                    {
                        path: 'getDependenttask',
                        Component: Dependenttask
                    },
                    {
                        path: 'getDependenttaskTopo',
                        Component: DependenttaskTopo
                    }
                ]
            }
        ]
    }
]

export default createBrowserRouter(routes);