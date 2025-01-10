import axios from './axios'


export const getData = () => {
    return axios.request({
        url: '/home/getData',
        method: 'get'
    })
}

export const getUser = (params) => {
    return axios.request({
        url: '/user/getUser',
        method: 'get',
        params
    })
}

export const getContain = (params) => {
    return axios.request({
        url: '/contain/getContain',
        method: 'get',
        params
    })
}

export const getNetwork = (params) => {
    return axios.request({
        url: '/network/getNetwork',
        method: 'get',
        params
    })
}

export const getApplication = (params) => {
    return axios.request({
        url: '/application/getApplication',
        method: 'get',
        params
    })
}

export const getDependenttask = (params) => {
    return axios.request({
        url: '/application/getDependenttask',
        method: 'get',
        params
    })
}

export const getApplication1 = (params) => {
    return axios.request({
        url: '/application/getApplication1',
        method: 'get',
        params
    })
}