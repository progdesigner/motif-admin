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
        :type="item.secure ? 'password' : 'text'"
        :name="item.key"
        :disabled="disable(item)"></el-input>

      <el-date-picker
        v-if="visible(item, 'date')"
        v-model="formData[item.key]"
        type="date"
        placeholder=""
        suffix-icon="el-icon-date"
        :format="item.format"
        :name="item.key"
        :disabled="disable(item)"></el-date-picker>

      <el-date-picker
        v-if="visible(item, 'datetime')"
        v-model="formData[item.key]"
        type="datetime"
        placeholder=""
        suffix-icon="el-icon-time"
        :format="item.format"
        :name="item.key"
        :disabled="disable(item)"></el-date-picker>

      <el-radio-group
        v-if="visible(item, 'enum')"
        v-model="formData[item.key]"
        :name="item.key"
        :disabled="disable(item)">
        <el-radio label="admin">Admin</el-radio>
        <el-radio label="manager">Manager</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script>
import { toDate } from 'element-ui/packages/date-picker/src/util'

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
            if (field.optional !== true && value === '') {
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
    },
    
    defaultValue(field, value) {
      if (field.type === 'date' || field.type === 'datetime') {
        let date = toDate(value)
        return date ? date : field.defaultValue
      }

      return value
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

    resetFields() {
      this.$data.formData = Object.assign({}, this.$data.defaultData)

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    didUpdate(data) {
      let formData = {}
      for ( let index in this.fields ) {
        let field = this.fields[index]
        formData[field.key] = this.defaultValue(field, data[field.key])
      }
      this.$data.id = data._id
      this.$data.formData = formData
    },

    onLoad() {

      this.$emit("load", {
        callback:({error, data}) => {
          if (error) {
            return
          }

          this.didUpdate(data)
        }
      })
    },

    onSubmit(e) {

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
