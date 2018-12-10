<div class="bt-dialog" v-if="innerVisible">
  <div class="dialog-mask"></div>
  <div class="dialog-main">
    <div class="dialog-hd">
      <h3><slot name="title">标题</slot></h3>
      <button class="close" @click="close"></button>
    </div>

    <div class="dialog-bd">
      <slot name="content"></slot>
    </div>

    <div class="dialog-ft">
      <slot name="btns"></slot>
    </div>
  </div>
</div>