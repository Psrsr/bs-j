const commonGetProps = {
  method: 'get',
  contentType: 'application/json',
  accept: 'application/json',
};
//返回promise对象
export const _get = url =>
  netRequest({
    url,
    ...commonGetProps,
  });

// 查询链接
// http://127.0.0.1:8080/pnlink
// 查询节点
// http://127.0.0.1:8080/pnnode
// 查询网路
// http://127.0.0.1:8080/pn

export const fetch_getPlaneInfo = () => netRequest({ url: 'pn', ...commonGetProps });
export const fetch_getNodesInfo = () => netRequest({ url: 'pnnode', ...commonGetProps });
export const fetch_getLinksInfo = () => netRequest({ url: 'pnlink', ...commonGetProps });
//指定id查拓扑
export const fetch_getTopoInfo = (data) =>
  netRequest({ url: 'Topo', ...commonGetProps, param: 'query'  },{data});
//查所有拓扑
export const fetch_getAllTopo = (data) =>
  netRequest({ url: 'TopoAll', ...commonGetProps });
//指定id查结果
export const fetch_getResultInfo = data =>
  netRequest({ url: 'Algo', ...commonGetProps, param: 'query' }, { data });
//查询计算进度
export const fetch_getProgress = data =>
  netRequest({ url: 'AlgoPercent', ...commonGetProps });
//指定id调用拓扑算法计算
export const fetch_postCallAlgo = data =>
  netRequest(
    { url: 'AlgoCall', ...commonGetProps, method: 'post' },
    { useBody: true, data }
  );


export const fetch_putSetNodePlanePosition = data =>
  netRequest(
    { url: 'setNodePlanePosition', ...commonGetProps, method: 'put' },
    { useBody: true, data }
  );

 
const networkconfig=require("../../../config/config.json");
const base=networkconfig.baseUrl;

async function netRequest(baseData, paramData = {}) {
  let url = base + '/' + baseData.url;
  const { method, param, accept, contentType } = baseData;

  const { useBody, data } = paramData;
  //返回一个response对象
  let response;
  try {
    if (param === 'path') url += '/' + data;
    if (param === 'query') {
      url += '?';
      const keys = Object.keys(data);
      keys.forEach(key => {
        url += `${key}=${data[key]}&`;
      });
      url = url.substring(0, url.length - 1);
    }

    response = await fetch(url, {
      // signal,
      method,
      headers: {
        'Content-Type': contentType,
        accept: accept,
      },
      body: useBody ? format(contentType, data) : null,
    });

    if (response.status < 200 || response.status > 299) {
      throw new Error(response.status + '');
    } else {
      if (response && response.ok) {
        let data;
        switch (accept) {
          case 'application/json':
            data = response.json();
            break;
          case 'text/html':
            data = response.text();
            break;
          default:
            break;
        }
        return data;
      } else {
        //请求失败时依然为resolve，但是 返回的response.ok为false
        return null;
      }
    }
  } catch (error) {
    //网络错误 返回TypeError
    console.log(error);
    return error;
  }
}

function format(contentType, data) {
  let res = null;
  switch (contentType) {
    case 'application/json':
      res = JSON.stringify(data);
      break;

    default:
      break;
  }
  return res;
}

function postData(url, data) {
  // Default options are marked with *
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json',
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  }).then(response => response.json()); // parses response to JSON
}
