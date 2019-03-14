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
        @change="onChange(item)"
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
        @change="onChange(item)"
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
        @change="onChange(item)"
        :format="item.format"
        :name="item.key"
        :readonly="readonly(item)"
        :disabled="disable(item)"></el-date-picker>

      <el-radio-group
        v-if="visible(item, 'enum')"
        v-model="formData[item.key]"
        @change="onChange(item)"
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
        @change="onChange(item)"
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

    </el-form-item>
  </el-form>
</template>

<script>
import { toDate } from 'element-ui/packages/date-picker/src/util'

let debugEnabled = 0
let debug = debugEnabled ? console.log : function() {}

export default {
  props: [
    "routerParams", "mode", "fields"
  ],
  data() {
    return {
      id: this.routerParams.id || '',
      defaultData: {},
      formData: {},
      rules: []
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
    initView() {
      let fields = this.fields
      let rules = {}
      let defaultData = {}

      for ( let index in fields ) {
        let field = fields[index]
        defaultData[field.key] = this.defaultValue(field, field.defaultValue)
        rules[field.key] = {
          validator: (rule, value, handler) => {
            if (field.editable !== false && field.optional !== true && value === '') {
              handler(new Error(`${field.label}${field.labelJoin} 필수 값입니다.`))
            } else {
              this.$emit('validate', {
                field,
                callback: (error) => {
                  handler(error)
                }
              })
            }
          },
          trigger: 'blur'
        }
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

      return value
    },

    readonly(item) {
      return item.editable === false ? true : false
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

    onChange(item) {
      debug('onChange', item)

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
    },

    onSubmit(e) {
      debug('onSubmit', e)

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
    }
  }
}
</script>
