<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片内容区域 -->
    <el-card>
      <!-- 提示警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="select-goods-categories">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      categoriesList: [] // 所有商品分类数据
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    async getCategoriesList() {
      const { data: res } = await this.$api.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.categoriesList = res.data
      console.log(this.categoriesList)
    }
  }
}
</script>

<style lang="less">
.select-goods-categories {
  margin: 15px 0;
}
</style>
