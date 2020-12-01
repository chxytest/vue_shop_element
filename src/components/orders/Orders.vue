<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 列表区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="payStatus">
            <el-tag size="mini" type="success" v-if="payStatus.row.pay_status === 1">已付款</el-tag>
            <el-tag size="mini" type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="createtime">{{ createtime.row.create_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showAddressEdit"></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showlogisticsInfo"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部翻页栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryOrdersInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryOrdersInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="ordersTotal"
      ></el-pagination>
    </el-card>

    <!-- 修改地址弹窗 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="closedAddressDialog">
      <el-form
        :model="addressEditForm"
        :rules="addressEditFormRules"
        ref="addressEditFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressEditForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressEditForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流信息弹窗 -->
    <el-dialog title="物流信息" :visible.sync="logisticsVisible" width="50%">
      <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  name: 'Orders',
  data() {
    return {
      queryOrdersInfo: {
        // 请求订单列表的参数
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      ordersTotal: 0,
      ordersList: [],
      addressVisible: false,
      addressEditForm: {
        address1: [],
        address2: ''
      },
      addressEditFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      logisticsVisible: false,
      logisticsInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 1、请求订单列表数据
    async getOrdersList() {
      const { data: res } = await this.$api.get('orders', {
        params: this.queryOrdersInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败！')
      }
      this.ordersTotal = res.data.total
      this.ordersList = res.data.goods
    },
    // 2、监听每页数量变化
    handleSizeChange(newSize) {
      this.queryOrdersInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 3、监听翻页
    handleCurrentChange(newPage) {
      this.queryOrdersInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 4、显示修改地址对话框
    showAddressEdit() {
      this.addressVisible = true
    },
    // 5、清空修改地址弹窗的表单内容
    closedAddressDialog() {
      this.$refs.addressEditFormRef.resetFields()
    },
    // 6、获取物流信息数据
    async showlogisticsInfo() {
      const { data: res } = await this.$api.get('/kuaidi/')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.logisticsInfo = res.data
      this.logisticsVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
</style>
