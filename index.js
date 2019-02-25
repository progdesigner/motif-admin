'use strict';

import 'normalize.css/normalize.css'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import ElementUI from 'element-ui'
import SvgIcon from './components/SvgIcon'
import './icons'

import VueMoment from 'vue-moment'
import VueQuillEditor from 'vue-quill-editor'

const plugin = {
  install (Vue, {loadComponent = true} = {}) {

    // register globally
    Vue.component('svg-icon', SvgIcon)

    Vue.use(ElementUI, { locale })
    Vue.use(VueMoment)
    Vue.use(VueQuillEditor)
  }
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
