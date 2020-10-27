<template>
  <div>
    <!-- 面包屑路径 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表卡片区域 -->
    <el-card>123</el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights'
}
</script>

<style lang="less" scoped>
</style>
