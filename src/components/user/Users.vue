<template>
  <div>
    <!-- 面包屑路径 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 列表卡片 -->
    <el-card>
      <!-- 搜索和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      queryUsersInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      usersList: [],
      total: 1
    }
  },
  created() {
    this.getUsersInfoList()
  },
  methods: {
    // 1、获取用户列表信息数据
    async getUsersInfoList() {
      const { data: res } = await this.$api.get('users', {
        params: this.queryUsersInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.usersList = res.data.users
      this.total = res.data.total
      console.log(res)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
