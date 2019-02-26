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
  created() {

    let rules = {}
    let defaultData = {}

    for ( let index in this.fields ) {
      let field = this.fields[index]
      defaultData[field.key] = field.defaultValue
      rules[field.key] = {
        validator: function(rule, value, callback) {
          if (field.optional === false && value === '') {
            callback(new Error(`${field.label}${field.labelJoin} 필수 값입니다.`))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    }

    this.$data.rules = rules
    this.$data.defaultData = defaultData
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

    onLoad() {

      this.$emit("load", {
        callback:({error, data}) => {
          if (error) {
            return;
          }

          this.$data.id = data._id
          this.$data.formData = data
        }
      })
    },

    onSubmit(e) {

      this.$emit("submit", {
        mode: this.mode,
        formData: this.$data.formData,
        callback: ({error, data}) => {
          if (error) {
            return;
          }

          this.$data.id = data._id
          this.$data.formData = data
        }
      })
    }
  }
}
</script>
