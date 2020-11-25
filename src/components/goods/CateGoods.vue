<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类列表区域 -->

      <!-- 翻页栏 -->
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CateGoods',
  data() {
    return {
      queryInfo: {
        //  分类列表的默认查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categoriesList: [], // 商品分类数据
      categoriesTotal: 0 // 总分类条数
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    // 1、获取商品分类数据
    async getCategories() {
      const { data: res } = await this.$api.get('categories', {
        params: this.queryInfo
      })
      // console.log(res)
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // 将获取到的数据保存到 categoriesList 中
      this.categoriesList = res.data.result
      // 将获取到总条数保存到 categoriesTotal 中
      this.categoriesTotal = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
</style>
