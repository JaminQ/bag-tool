require('./dialog.less');

Vue.component('bt-dialog', {
  template: require('./dialog.tpl'),
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  methods: {}
});