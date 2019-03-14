<template>
  <el-table :data="items" header-cell-class-name="fixed-header" cell-class-name	="fixed-cell">
    <el-table-column v-for="(field, index) in listFields"
      :prop="field.key"
      :key="field.key"
      :label="field.label"
      :width="field.width"
      >
      <template slot-scope="scope">
        {{printValue(field, scope.row)}}
      </template>
    </el-table-column>

    <el-table-column label="Operations" align="center" width="120" >
      <template slot-scope="scope">
        <el-button type="primary" size="mini" class="btn-action" @click="onCommand('edit', scope)">
          <svg-icon icon-class="pencil" />
        </el-button>
        <el-button type="danger" size="small" class="btn-action" @click="onCommand('delete', scope)">
          <svg-icon icon-class="trash" />
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
  props: [
    "fields", "items"
  ],
  data() {
    return {
      listFields: []
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
      this.$emit("action", { action, data: scope.row })
    }
  }
}
</script>
