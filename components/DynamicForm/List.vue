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
          <i class="flaticon-edit" />
        </el-button>
        <el-button type="danger" size="small" class="btn-action" @click="onCommand('delete', scope)">
          <i class="flaticon-delete-1" />
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import _ from 'lodash'

export default {
  props: [
    "fields", "items"
  ],
  data() {
    return {
      listFields: []
    }
  },
  created() {
    this.$data.listFields = _.filter(this.fields, (field) => {
      return field.listing
    })
  },
  methods: {
    printValue(field, row) {
      if (field.type === 'date') {
        return this.$moment(row[field.key]).format(field.format)
      }

      return row[field.key]
    },

    onCommand(action, scope) {
      this.$emit("action", { action, data: scope.row })
    }
  }
}
</script>
