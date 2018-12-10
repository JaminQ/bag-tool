/* <bt-dialog v-model="showPathDialog">
  <template slot="title">请输入输出路径</template>
  <div slot="content">abc</div>
  <template slot="btns">
    <button class="btn btn-default" @click="showPathDialog = false">关闭</button>
    <button class="btn">确定</button>
  </template>
</bt-dialog> */

require('./dialog.less');

Vue.component('bt-dialog', {
  template: require('./dialog.tpl'),
  model: {
    prop: 'visible',
    event: 'visible-change'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerVisible: false
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    }
  },
  methods: {
    close() {
      this.innerVisible = false;
      this.$emit('visible-change', false);
    }
  }
});