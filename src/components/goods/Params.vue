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
          <el-cascader
            v-model="selectedCategoriesKeys"
            :options="categoriesList"
            :props="propsCategories"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 活动标签区域 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 动态参数标签内容 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
          <!-- 动态参数表格区域 -->
          <el-table :data="manyTabParams" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope>
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数标签内容 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
          <!-- 静态属性表格区域 -->
          <el-table :data="onlyTabParams" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope>
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      categoriesList: [], // 所有商品分类数据
      propsCategories: {
        // 级联选择框的对应的props属性值
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // checkStrictly: true
      },
      selectedCategoriesKeys: [], // 选中的商品分类的id数组
      activeTabName: 'many', // 选中的 tab 标签的名称
      manyTabParams: [], // many标签下的数据
      onlyTabParams: [] // only标签下的数据
    }
  },
  computed: {
    isBtnDisabled() {
      // 当按钮需要被禁用时，则返回 true ， 否则返回 false
      // 使用三元表达式时需要将 true 和 false 字符串转换成 Boolean 类型：JSON.parse(isBtnDisabled)
      // return this.selectedCategoriesKeys.length !== 3 ? 'true' : 'false'
      return this.selectedCategoriesKeys.length !== 3
    },
    selectedLastCatId() {
      return this.selectedCategoriesKeys.length === 3
        ? this.selectedCategoriesKeys[2]
        : ''
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    // 1、请求商品分类数据
    async getCategoriesList() {
      const { data: res } = await this.$api.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.categoriesList = res.data
      // console.log(this.categoriesList)
    },
    // 2、监控级联选择框数据变化
    handleChange() {
      this.getCategoriesParams()
    },
    // 3、点击 tab 标签切换
    handleTabClick() {
      // console.log(this.activeTabName)
      this.getCategoriesParams()
    },
    // 4、获取分类参数列表数据
    async getCategoriesParams() {
      // 当选中的不是三级分类时，无法选中
      if (this.selectedCategoriesKeys.length !== 3) {
        this.selectedCategoriesKeys = []
      }
      // console.log(this.selectedCategoriesKeys)
      const {
        data: res
      } = await this.$api.get(
        `categories/${this.selectedLastCatId}/attributes`,
        { params: { sel: this.activeTabName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('请选择商品分类！')
      }
      // console.log(res.data)
      if (this.activeTabName === 'many') {
        this.manyTabParams = res.data
      } else {
        this.onlyTabParams = res.data
      }
    }
  }
}
</script>

<style lang="less">
.select-goods-categories {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
</style>
