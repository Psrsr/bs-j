import Mock from 'mockjs'
import homeApi from './mockServeData/home'
import userApi from './mockServeData/user'
import containApi from './mockServeData/contain'
import networkApi from './mockServeData/network'
import applicationApi from './mockServeData/application'
import applicationApi1 from './mockServeData/application1'
import dependenttaskApi from './mockServeData/dependenttask'
import dependenttaskTopoApi from './mockServeData/dependenttasktopo'
Mock.mock('/home/getData', homeApi.getStatisticalData)
Mock.mock(/user\/getUser/, 'get', userApi.getUserList)
Mock.mock(/contain\/getContain/, 'get', containApi.getContainList)
Mock.mock(/network\/getNetwork/, 'get', networkApi.getNetworkList)
Mock.mock('/application/getApplication', applicationApi.getStatisticalData)
Mock.mock(/application\/getDependenttask/, 'get', dependenttaskApi.getDependenttaskList)
Mock.mock('/application/getDependenttaskTopo', dependenttaskTopoApi.getStatisticalData)
Mock.mock('/application/getApplication1', applicationApi1.getStatisticalData)