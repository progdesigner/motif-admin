
<template>
<div class="resources">
  <div class="debug" v-if="useDebug">
    <pre v-if="showDebug">{{resources}}</pre>
    <el-button type="link" @click="onToggleDebug">DEBUG</el-button>
  </div>

  <el-form v-for="(field, index) in resourceFields">
    <template v-if="field.type == 'single'">
      <legend class="col-form-label">{{field.label || field.name}}</legend>

      <div class="resource" v-if="typeof resources[field.name] == 'object'" v-for="(resource, index) in [resources[field.name]]">
        <div class="resource-content" v-if="resource && resource.resource_url" >
          <img
            v-if="resource.resource_type === 'image'"
            alt="Resource"
            :src="resource.resource_url"
            @click="onFilePreview(field, resource)" />

          <span v-if="resource.resource_type !== 'image'" ><a :href="resource.resource_url" target="_blank">{{resource.filename}}</a></span>
        </div>

        <!-- <div class="info" v-if="resource && resource.id" >
          <ul>
            <li><dt>ID</dt><dd>{{resource.id}}</dd></li>
            <li><dt>Natural Size</dt><dd>{{resource.natural_width}} x {{resource.natural_height}}</dd></li>
            <li><dt>FileSize</dt><dd>{{resource.filesize}}</dd></li>
            <li><dt>Status</dt><dd>{{resource.resource_status}}</dd></li>
            <li><dt>Hash</dt><dd>{{resource.resource_hash}}</dd></li>
            <li><dt>Uploaded</dt><dd>{{resource.createdAt}}</dd></li>
            <li><dt>Url</dt><dd style="width:200px">{{resource.resource_url}}</dd></li>
          </ul>
        </div> -->

        <div v-if="!readonly" class="actions">
          <el-button type="danger" @click="onFileRemove(field, resource)">
            <svg-icon icon-class="trash" />
          </el-button>
        </div>
      </div>

      <div v-if="!readonly && !resources[field.name]" class="resource-actions">
        <el-upload :show-file-list="false"
          :multiple="false"
          :headers="uploadHeaders()"
          :data="uploadData(field)"
          :action="action"
          :on-success="(response, file, fileList) => onFileUpload(field, response, file, fileList)">
          <el-button slot="trigger" size="small" type="primary"><svg-icon icon-class="plus" /></el-button>
          <!-- <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div> -->
        </el-upload>
      </div>
    </template>

    <template v-if="field.type == 'list'">
      <legend class="col-form-label">{{field.label || field.name}}</legend>
      <div class="resource" v-for="(resource, index) in resources[field.name]">
        <div class="resource-content" v-if="resource && resource.resource_url" >
          <img
            v-if="resource.resource_type === 'image'"
            alt="Resource"
            :src="resource.resource_url"
            @click="onFilePreview(field, resource)" />

          <span v-if="resource.resource_type !== 'image'" ><a :href="resource.resource_url" target="_blank">{{resource.filename}}</a></span>
        </div>

        <!-- <div class="info" v-if="resource && resource.id" >
          <ul>
            <li><dt>ID</dt><dd>{{resource.id}}</dd></li>
            <li><dt>Natural Size</dt><dd>{{resource.natural_width}} x {{resource.natural_height}}</dd></li>
            <li><dt>FileSize</dt><dd>{{resource.filesize}}</dd></li>
            <li><dt>Status</dt><dd>{{resource.resource_status}}</dd></li>
            <li><dt>Hash</dt><dd>{{resource.resource_hash}}</dd></li>
            <li><dt>Uploaded</dt><dd>{{resource.createdAt}}</dd></li>
            <li><dt>Url</dt><dd style="width:200px">{{resource.resource_url}}</dd></li>
          </ul>
        </div> -->

        <div v-if="!readonly" class="actions">
          <el-button type="danger" @click="onFileRemove(field, resource)">
            <svg-icon icon-class="trash" />
          </el-button>
        </div>
      </div>

      <el-upload :show-file-list="false"
        :multiple="false"
        :headers="uploadHeaders()"
        :data="uploadData(field)"
        :action="action"
        :on-success="(response, file, fileList) => onFileUpload(field, response, file, fileList)">
        <el-button slot="trigger" size="small" type="primary"><svg-icon icon-class="plus" /></el-button>
        <!-- <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div> -->
      </el-upload>
    </template>
  </el-form>

  <el-dialog :visible.sync="preview.visible" append-to-body>
    <img width="100%" :src="preview.url" alt="" />
  </el-dialog>

</div>
</template>

<script>
import _ from "lodash"
import uuid from "uuid"

let debugEnabled = 1
let debug = debugEnabled ? console.log : function() {}

export default {
  props: {
    action: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true,
      default: '{}'
    },
    resourceKey: {
      type: String,
      required: true,
      default: ''
    },
    resourceFields: {
      type: Array,
      required: true
    },
    useDebug: {
      type: Boolean,
      required: false,
      default: true
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      showDebug: false,
      resources: {},
      preview: {
        visible: false,
        url: ''
      }
    }
  },
  watch: {
    'value' () {
      try {
        this.$data.resources = JSON.parse(this.value) || {}
      }
      catch(e) {
        this.$data.resources = {}
      }
    }
  },
  created() {
    debug( "created", this.$data )
  },
  mounted() {
    debug( "mounted", this.$props )
  },
  methods: {
    uploadHeaders() {
      let headers = {}
      if (localStorage.eleToken) {
        headers.Authorization = 'bearer ' + localStorage.eleToken
      }
      return headers
    },

    uploadData(field) {
      return {
        key: this.$props.resourceKey,
        tag: field.name
      }
    },

    onToggleDebug() {
      this.$data.showDebug = !this.$data.showDebug
    },

    onFilePreview(field, resource) {
      debug( 'onFilePreview', field, resource)

      this.$data.preview.url = resource.resource_url
      this.$data.preview.visible = true
    },

    onFileUpload(field, response, file, fileList) {
      debug( 'onFileUpload', field, response, file, fileList)

      let { data, error } = response

      if (error) {
        this.$message({ message: error, type: 'error' })
        return
      }

      if (field.type === 'single') {
        this.$data.resources[field.name] = _.head(data.resources)
        this.didChange({
          action: "upload",
          type: "single",
          data: data,
          field: field,
          resources: this.$data.resources
        })
      }
      else if (field.type === "list") {
        let resourceData = this.$data.resources[field.name] || []

        for (let index in data.resources) {
          let resource = data.resources[index]
          resourceData.push(resource)
        }

        this.$data.resources[field.name] = resourceData
        this.didChange({
          action: "upload",
          type: "list",
          data: data,
          field: field,
          resources: this.$data.resources
        })
      }
    },

    onFileRemove(field, resource) {
      debug( 'onFileRemove', field, resource)

      let resourceData = this.$data.resources[field.name]

      if (field.type === 'single') {
        this.$data.resources[field.name] = null
        delete this.$data.resources[field.name]
        this.didChange({
          action: "remove",
          type: "single",
          field: field,
          resource: resource,
          resources: this.$data.resources
        })
      }
      else if (field.type === "list") {
        let newResources = []

        for (let index in resourceData) {
          if (resource && resourceData[index].id !== resource.id) {
            newResources.push(resourceData[index])
          }
        }

        this.$data.resources[field.name] = newResources
        this.didChange({
          action: "remove",
          type: "list",
          field: field,
          resource: resource,
          resources: this.$data.resources
        })
      }
    },

    didChange(event) {

      this.$emit('input', JSON.stringify(this.$data.resources))
      this.$emit('change', event)
    }
  }
}
</script>

<style lang="scss">
.resources {
  margin-left: 1em;
  display: flex;
  flex-direction: column;

  .debug {
    position: relative;

    pre {}
    button {

    }
  }

  legend {
    font-weight: bold;
  }

  .resource {
    display: flex;
    flex-direction: row;
    margin-bottom: 0.8em;
    position: relative;

    .resource-content {
      max-width: 300px;
      height: inherit !important;

      img {
        width: 100%;
        height: inherit !important;
      }
    }

    .info {
      margin-top: 0.8em;
      margin-left: 0.8em;

      ul {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          clear: both;
          font-size: 11px;

          dd {
            margin-left: 0.8em;
          }

          dt,dd {
            float: left;
          }
        }
      }
    }

    .actions {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
</style>
