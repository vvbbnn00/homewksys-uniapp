import Vue from 'vue'
import App from './App'
import {ajax} from 'common/ajax.js'

Vue.prototype.$ajax = ajax
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()




