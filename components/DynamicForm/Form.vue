<template>
  <el-form ref="form" :model="formData" :rules="rules" class="form-container">
    <el-form-item
      v-for="(item, index) in fields"
      :key="item.key" :prop="item.key"
      :label="item.label"
      v-if="visible(item, item.type)">
      <el-input
        v-if="visible(item, 'text')"
        v-model="formData[item.key]"
        placeholder=""
        @blur="onBlur(item)"
        @focus="onFocus(item)"
        @change="onChange(item, $event)"
        :type="item.secure ? 'password' : 'text'"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)"></el-input>

      <el-date-picker
        v-if="visible(item, 'date')"
        v-model="formData[item.key]"
        type="date"
        placeholder=""
        suffix-icon="el-icon-date"
        @blur="onBlur(item)"
        @focus="onFocus(item)"
        @change="onChange(item, $event)"
        :format="item.format"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)"></el-date-picker>

      <el-date-picker
        v-if="visible(item, 'datetime')"
        v-model="formData[item.key]"
        type="datetime"
        placeholder=""
        suffix-icon="el-icon-time"
        @blur="onBlur(item)"
        @focus="onFocus(item)"
        @change="onChange(item, $event)"
        :format="item.format"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)"></el-date-picker>

      <el-radio-group
        v-if="visible(item, 'enum')"
        v-model="formData[item.key]"
        @change="onChange(item, $event)"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)">
        <el-radio label="admin">Admin</el-radio>
        <el-radio label="manager">Manager</el-radio>
      </el-radio-group>

      <el-select
        v-if="visible(item, 'select')"
        v-model="formData[item.key]"
        placeholder="Select"
        @blur="onBlur(item)"
        @focus="onFocus(item)"
        @change="onChange(item, $event)"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)">
        <el-option
          v-for="option in item.options"
          :key="option.value"
          :label="option.label"
          :value="option.value">
        </el-option>
      </el-select>

      <el-upload
        v-if="visible(item, 'file')"
        drag
        :multiple="false"
        :show-file-list="true"
        :on-preview="(file) => onFilePreview(item, file)"
        :on-remove="(file, fileList) => onFileRemove(item, file, fileList)"
        :on-success="(response, file, fileList) => onFileUpload(item, response, file, fileList)"
        :headers="item.headers()"
        :data="item.data(formData)"
        :action="item.action"
        :file-list="item.fileList || []"
        limit="1"
        class="uploader"
        >
        <div class="upload-before" >
          <div class="el-upload__text">
            <i class="el-icon-upload"></i>
            <span>Drop file here or <em>click to upload</em></span>
          </div>

          <!-- <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div> -->
        </div>
      </el-upload>

      <resources
        v-if="visible(item, 'resources')"
        v-model="formData[item.key]"
        @change="onChange(item, $event)"
        :useDebug="item.useDebug"
        :action="item.action"
        :resource-key="getResourceKey(formData)"
        :resource-fields="item.resourceFields">
      </resources>

    </el-form-item>

    <el-dialog :visible.sync="preview.visible">
      <img width="100%" :src="preview.url" alt="" />
    </el-dialog>
  </el-form>
</template>

<script>
import _ from 'lodash'
import uuid from 'uuid'
import Resources from '../Resources'
import { toDate } from 'element-ui/packages/date-picker/src/util'

let debugEnabled = 1
let debug = debugEnabled ? console.log : function() {}

/*
label: 필드 명칭
key: 필드 키값
type: 필드 타입
primaryKey: 대표 키 여부
options: select type 의 옵션 값 리스트
listing: 리스트에 표시 여부 width: 리스트 fixed 너비
format: 날짜 타입에 대한 포맷
readonly: 읽기 전용, 설정한 경우
ediable: 생성 폼에서만 작성 가능, 수정은 불가
*/

export default {
  components: {
    Resources
  },
  props: [
    "routerParams", "mode", "fields",
    {
      validate: {
        type: Function,
        required: false
      }
    }
  ],
  data() {
    return {
      id: this.routerParams.id || '',
      defaultData: {},
      formData: {},
      rules: [],
      preview: {
        visible: false,
        url: ''
      }
    }
  },
  watch: {
    $route() {
      this.initView()
    }
  },
  created() {
    this.initView()
  },
  mounted() {
    if (this.mode === 'create') {
      this.resetFields()
    }
    else if (this.$data.id) {
      this.onLoad()
    }
  },
  methods: {
    getRule({ field }) {
      let rules = []

      if (field.primaryKey === true
        || (field.optional !== true && field.readonly !== true && field.ediable !== false)) {

        debug( 'required' )
        rules.push({ required: true, message: '값을 비워둘 수 없습니다.', trigger: 'blur' })
      }

      rules.push({
        validator: (rule, value, handler) => {
          if (typeof field.validate === 'function') {
            handler(field.validate({
              field: field
            }))
          }
          else if (typeof this.$props.validate === 'function') {
            handler(this.$props.validate({
              field: field
            }))
          }
          else {
            handler()
          }
        },
        trigger: 'blur'
      })

      return rules
    },
    initView() {
      debug("initView")

      let fields = this.fields
      let rules = {}
      let defaultData = {}

      for ( let index in fields ) {
        let field = fields[index]
        defaultData[field.key] = this.defaultValue(field, field.defaultValue)
        rules[field.key] = this.getRule({ field })
      }

      this.$data.rules = rules
      this.$data.defaultData = defaultData

      this.willLoadFields()
    },

    defaultValue(field, value) {
      if (field.type === 'date' || field.type === 'datetime') {
        let date = toDate(value)
        return date ? date : field.defaultValue
      }
      else if (field.type === 'select') {
        if (field.options && field.options.length > 0) {
          let selectedOption = null
          _.forEach(field.options, option => {
            if (option.value === value || (typeof value === 'number' && parseInt(option.value) === value) ) {
              selectedOption = option
            }
          })
          return selectedOption ? selectedOption.value : value
        }
      }

      return value
    },

    readonly(item) {
      return (this.mode !== 'create' && item.editable === false) || item.readonly === true ? true : false
    },

    disable(item) {
      if (item.primaryKey) {
        return true
      }

      if (item.editable == false) {
        return this.mode !== 'create'
      }

      return false
    },

    visible(item, type) {
      if (item.type === type) {
        if (item.primaryKey) {
          if (this.mode === 'create') {
            return false
          }
        }

        if (item.readonly === true) {
          return this.mode !== 'create'
        }

        return true
      }

      return false
    },

    selectOptions(item) {

      return item.options || []
    },

    resetFields() {
      this.$data.formData = Object.assign({}, this.$data.defaultData)

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    willLoadFields() {
      debug('willLoadFields')

      for ( let index in this.fields ) {
        let field = this.fields[index]
        if (field.type === 'select') {
          this.onDataSource(field)
        }
      }
    },

    didUpdate(data) {
      debug('didUpdate', data)

      let formData = {}
      for ( let index in this.fields ) {
        let field = this.fields[index]
        formData[field.key] = this.defaultValue(field, data[field.key])
      }

      this.$data.id = data._id
      this.$data.formData = formData

      for ( let index in this.fields ) {
        let field = this.fields[index]

        if (field.type === 'file') {
          let url = this.$data.formData[field.key]

          if (url) {
            field.fileList = [
              { name: 'file', url }
            ]
          }
          else {
            field.fileList = []
          }
        }
      }
    },

    onLoad() {
      debug('onLoad')

      this.$emit("load", {
        callback:({error, data}) => {
          if (error) {
            return
          }

          this.didUpdate(data)
        }
      })
    },

    onFocus(item) {
      debug('onFocus', item)

      this.$emit("focus", {
        field: item,
        formData: this.$data.formData
      })
    },

    onBlur(item) {
      debug('onBlur', item)

      this.$emit("blur", {
        field: item,
        formData: this.$data.formData
      })
    },

    onChange(item, originalEvent) {
      debug('onChange', item, originalEvent)

      var eventData = {
        field: item,
        formData: this.$data.formData,
        originalEvent: originalEvent || {}
      }

      try {
        if (item.type === 'resources') {
          let { field, action, resource, data } = originalEvent

          if (field && field.sync) {
            let fieldKey = field.sync
            if (action === 'remove') {
              this.$data.formData[fieldKey] = ''
            }
            else if (action === 'upload') {
              if (field.type === 'single') {
                let resource = _.head(data.resources)
                if (resource && resource.resource_url) {
                  this.$data.formData[fieldKey] = resource.resource_url
                }
              }
            }
          }
        }
      }
      catch(e) {}

      debug( "eventData", eventData )

      this.$emit("change", eventData)
    },

    onFilePreview(item, file) {
      debug('onFilePreview', item, file)

      this.$data.preview.url = file.url
      this.$data.preview.visible = true
    },

    onFileRemove(item, file, fileList) {
      debug('onFileRemove', item, file, fileList)

      this.$data.formData[item.key] = ''

      item.fileList = fileList

      this.$emit("change", {
        field: item,
        formData: this.$data.formData
      })
    },

    onFileUpload(item, response, file, fileList) {
      debug('onFileUpload', item, response, file, fileList)

      let { data, error } = response

      if (error) {
        return
      }

      let { resources } = data
      let resource = _.head(resources)
      if (resource && resource.resource_url) {
        this.$data.formData[item.key] = resource.resource_url

        file.url = resource.resource_url

        item.fileList = fileList

        this.$emit("change", {
          field: item,
          formData: this.$data.formData
        })
      }
    },

    getResourceKey(data = {}) {
      if (data && !data.resource_key) {
        let resourceKey = uuid().replace(/-/g, '')
        data.resource_key = resourceKey
        return resourceKey
      }

      return data.resource_key
    },

    onResourceUpload(item, resource, resources) {
      debug('onResourceUpload', item, resource, resources)

      this.$emit("change", {
        field: item,
        formData: this.$data.formData
      })
    },

    onDataSource(item) {
      debug('onDataSource', item)

      this.$emit("source", {
        field: item,
        formData: this.$data.formData,
        callback: ({error, data}) => {
          if (error) {
            return
          }


        }
      })

      if (typeof item.dataSource === 'function') {
        item.dataSource({
          field: item,
          formData: this.$data.formData
        })
      }
    },

    onSubmit() {
      debug('onSubmit')

      this.$emit("submit", {
        mode: this.mode,
        formData: this.$data.formData,
        callback: ({error, data}) => {
          if (error) {
            return
          }

          this.didUpdate(data)
        }
      })
    },

    submit() {
      debug('submit')

      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        }

        this.onSubmit()
        return true
      })
    }
  }
}
</script>

<style lang="scss">

.uploader {

  width: 100%;
  line-height: 1.2;

  .el-upload.el-upload--text {
    width: 100%;
  }

  .el-upload-dragger {
    width: auto; height: auto;
    padding: 0.4rem;

    .el-upload__text {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;

      .el-icon-upload {
        line-height: 1;
        margin: 0 0.8rem;
        font-size: 3.2em;
      }
    }
  }

  .el-upload-list {
    margin-top: 0.2rem;

    .el-upload-list__item {
      animation: none !important;
      transition: none !important;
      margin: 0;
    }
  }
}

</style>
