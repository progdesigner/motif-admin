
<template>
<div class="resources">
  <div class="debug">
    <pre v-if="debug">{{resources}}</pre>
    <el-button type="link" @click="onToggleDebug">DEBUG</el-button>
  </div>

  <el-form v-for="(field, index) in resourceFields">
    <template v-if="field.type == 'single'">
      <legend class="col-form-label">{{field.label || field.name}}</legend>

      <div class="resource" v-if="typeof resources[field.name] == 'object'" v-for="(resource, index) in [resources[field.name]]">
        <div class="image" v-if="resource && resource.resource_url" >
          <img :src="resource.resource_url" alt="Resource Image" @click="onFilePreview(field, resource)" />
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
          <el-button slot="trigger" size="small" type="primary">Upload</el-button>
          <!-- <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div> -->
        </el-upload>
      </div>
    </template>

    <template v-if="field.type == 'list'">
      <legend class="col-form-label">{{field.label || field.name}}</legend>
      <div class="resource" v-for="(resource, index) in resources[field.name]">
        <div class="image" v-if="resource && resource.resource_url" >
          <img :src="resource.resource_url" alt="Resource Image" @click="onFilePreview(field, resource)" />
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
        <el-button slot="trigger" size="small" type="primary">Upload</el-button>
        <!-- <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div> -->
      </el-upload>
    </template>
  </el-form>

  <el-dialog :visible.sync="preview.visible">
    <img width="100%" :src="preview.url" alt="" />
  </el-dialog>

</div>
</template>

<script>
import _ from "lodash"
import uuid from "uuid"

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
      default: () => {
        return uuid().replace(/-/g, "")
      }
    },
    resourceFields: {
      type: Array,
      required: true
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      debug: false,
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
      this.$data.debug = !this.$data.debug
    },

    onFilePreview(field, resource) {
      console.log( 'onFilePreview', field, resource)

      this.$data.preview.url = resource.resource_url
      this.$data.preview.visible = true
    },

    onFileUpload(field, response, file, fileList) {
      console.log( 'onFileUpload', field, response, file, fileList)

      let { data, error } = response

      if (error) {
        this.$message({ message: error, type: 'error' })
        return
      }

      if (field.type === 'single') {
        this.$data.resources[field.name] = _.head(data.resources)
        this.didChange()
      }
      else if (field.type === "list") {
        let resourceData = this.$data.resources[field.name] || []

        for (let index in data.resources) {
          let resource = data.resources[index]
          resourceData.push(resource)
        }

        this.$data.resources[field.name] = resourceData
        this.didChange()
      }
    },

    onFileRemove(field, resource) {
      console.log( 'onFileRemove', field, resource)

      let resourceData = this.$data.resources[field.name]

      if (field.type === 'single') {
        this.$data.resources[field.name] = null
        delete this.$data.resources[field.name]
        this.didChange()
      }
      else if (field.type === "list") {
        let newResources = []

        for (let index in resourceData) {
          if (resource && resourceData[index].id !== resource.id) {
            newResources.push(resourceData[index])
          }
        }

        this.$data.resources[field.name] = newResources
        this.didChange()
      }
    },

    didChange() {

      this.$emit('input', JSON.stringify(this.$data.resources))
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

  .resource {
    display: flex;
    flex-direction: row;
    margin-bottom: 0.8em;
    position: relative;

    img {
      max-width: 300px;
      height: inherit !important;
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

      .image {
        display: block;
      }
    }
  }
}
</style>