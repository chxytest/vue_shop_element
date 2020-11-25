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
      <tree-table
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template #isok="isok">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="isok.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template #order="order">
          <el-tag size="mini" v-if="order.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="order.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #option>
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
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
      categoriesTotal: 0, // 总分类条数
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' }, // type表示当前列定义为模板列，template当前列使用模板的名称
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'option' }
      ]
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
      console.log(this.categoriesList)
      // 将获取到总条数保存到 categoriesTotal 中
      this.categoriesTotal = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
</style>
