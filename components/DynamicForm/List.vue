<template>
  <el-table :data="items" header-cell-class-name="fixed-header" cell-class-name	="fixed-cell">
    <el-table-column v-for="(field, index) in listFields"
      :prop="field.key"
      :key="field.key"
      :label="field.label"
      :width="field.width"
      >

      <template slot-scope="scope">
        <template v-if="field.displayType === 'image'">
          <img :src="scope.row[field.key]" />
        </template>

        <template v-if="!field.displayType">
          {{printValue(field, scope.row)}}
        </template>
      </template>
    </el-table-column>

    <el-table-column label="Operations" align="center" :width="actionWidth" >
      <template slot-scope="scope" v-for="(action, index) in actions">
        <el-button :type="action.type" :size="action.size" class="btn-action" @click="onCommand(action.action, scope)">
          <svg-icon :icon-class="action.icon" />
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import _ from 'lodash'
import { toDate } from 'element-ui/packages/date-picker/src/util'
import dateUtil from 'element-ui/src/utils/date'

export default {
  props: {
    "fields": {
      type: Array,
      default: [],
      required: true
    },
    "items": {
      type: Array,
      default: [],
      required: true
    },
    "actions": {
      type: Array,
      default: [
        { type: 'primary', size: 'mini', action: 'edit', icon: 'pencil' },
        { type: 'danger', size: 'small', action: 'delete', icon: 'trash' }
      ]
    }
  },
  data() {
    return {
      listFields: [],
      actionWidth: 120
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
  methods: {

    initView() {
      let fields = this.fields
      let listFields = _.filter(fields, (field) => {
        return field.listing
      })

      this.$data.listFields = listFields
    },

    printValue(field, row) {
      if (field.type === 'date' || field.type === 'datetime') {
        let date = toDate(row[field.key])
        if (!date) {
          return 'Invalid Date'
        }
        return dateUtil.format(date, field.format)
      }

      return row[field.key]
    },

    onCommand(action, scope) {

      if (action === 'delete') {
        this.$confirm('삭제하시겠습니까?')
          .then(_ => {
            this.$emit("action", { action, data: scope.row })
          })
          .catch(_ => {

          });
        return
      }

      this.$emit("action", { action, data: scope.row })
    }
  }
}
</script>

<style>

.dialog-container {
  margin: 30px 50px;
  position: relative;
}
</style>
