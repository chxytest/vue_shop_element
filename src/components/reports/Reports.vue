<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'Reports',
  data() {
    return {
      reportsInfo: {},
      options: {
        // 需要合并的数据
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {
    // this.getReportsInfo()
  },
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // this.getReportsInfo()
    const { data: res } = await this.$api.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取统计数据失败')
    }
    // this.reportsInfo = res.data
    // 指定图表的配置项和数据
    const result = _.merge(res.data, this.options)
    // const result = _.merge(this.reportsInfo, this.options)
    // const result = { ...this.reportsInfo, ...this.options }

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {
    // 1、获取统计数据
    // async getReportsInfo() {
    //   const { data: res } = await this.$api.get('reports/type/1')
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('获取统计数据失败')
    //   }
    //   this.reportsInfo = res.data
    //   console.log(res.data)
    // }
  }
}
</script>

<style lang="less" scoped>
</style>
