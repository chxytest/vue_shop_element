<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片列表区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="goodsQueryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="clearInputQuery">重置</el-button>
          <el-button type="primary">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="100"></el-table-column>
        <el-table-column label="创建事件" prop="add_time" width="140">
          <template v-slot="addTime">{{ addTime.row.add_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope>
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsQueryInfo.pagenum"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="goodsQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GoodsList',
  data() {
    return {
      goodsQueryInfo: {
        // 请求商品列表的数据
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [], // 商品列表数据
      goodsTotal: 0 // 商品总数
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 1、请求商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$api.get('goods', {
        params: this.goodsQueryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsList = res.data.goods
      console.log(this.goodsList)
      this.goodsTotal = res.data.total
    },
    // 2、监控每页数量的变化
    handleSizeChange(newSize) {
      this.goodsQueryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 3、监控页码数的变化
    handleCurrentChange(newPage) {
      this.goodsQueryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 4、重置搜索内容,并重置列表
    clearInputQuery() {
      this.goodsQueryInfo.query = ''
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
