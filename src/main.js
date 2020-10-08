import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

// 导入 axios 并挂载到根实例上，设置访问基础地址路径
import axios from 'axios'
Vue.prototype.$api = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截
axios.interceptors.request.use(config => {
  // 文档规定，需要授权的 API ，必须在请求头中使用 Authorization 字段提供 token 令牌
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
