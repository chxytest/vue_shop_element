<template>
  <div>
    <!-- 面包屑路径 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表卡片区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!-- 采用作用域插槽来将标签组件插入到等级权限的组件中 -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      rightsList: [] // 权限列表数据
    }
  },
  created() {
    this.getRightsList() // 获取所有权限列表数据请求
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$api.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
