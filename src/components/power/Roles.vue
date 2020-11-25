<template>
  <div>
    <!-- 面包屑路径 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 按钮栏区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="roleList" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              class="vcenter"
              v-for="(item1, i1) in scope.row.children"
              :key="i1"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过循环选项一级权限下的子权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  class="vcenter"
                  v-for="(item2, i2) in item1.children"
                  :key="i2"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="danger"
                      v-for="(item3, i3) in item2.children"
                      :key="i3"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRuleDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色弹窗 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 角色弹窗内容区域 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 弹窗底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹窗 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose"
    >
      <!-- 其中修改表单的校验规则复用了新增用户中的表单校验规则 addUserFormRules -->
      <el-form
        :model="getEditRoleInfo"
        :rules="addRoleFormRules"
        ref="getEditRoleInfoRef"
        label-width="80px"
      >
        <el-form-item label="角色名">
          <el-input v-model="getEditRoleInfo.roleName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="getEditRoleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树型权限空间 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
        node-key="id"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [], // 角色列表数据
      addRoleDialogVisible: false, // 添加角色对话框的显示和隐藏
      addRoleForm: {
        // 添加角色表单数据
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        // 添加角色表单验证规则
        roleName: [
          { required: true, message: '请输入角色', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名称长度在 3 ~ 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      getEditRoleInfo: {}, // 获取编辑角色信息
      editRoleDialogVisible: false, // 表示编辑角色弹窗的显示和隐藏
      setRightDialogVisible: false, // 分配权限对话框的显示和隐藏
      rightsList: [], // 权限列表数据
      treeProps: {
        // 树形控件属性绑定对象
        label: 'authName',
        children: 'children'
      },
      defKeys: [], // 默认勾选中的id
      roleId: '' // 当前分配权限的角色id
    }
  },
  created() {
    this.getRolesList() // 获取角色列表数据
  },
  methods: {
    // 1、获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$api.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 2、添加角色弹窗
    addRole() {
      // 找到指定的角色表单并提交
      this.$refs.addRoleFormRef.validate(async valid => {
        // 判断提交请求前校验是否通过
        if (!valid) return console.log('校验失败')
        // 发送添加角色请求
        const { data: res } = await this.$api.post('roles', this.addRoleForm)
        // console.log(res)
        // 判断角色是否添加成功并刷新角色列表和关闭弹窗
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 3、清空添加角色弹窗中的输入框
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 4、点击编辑按钮编辑角色
    async showEditRuleDialog(roleId) {
      // 获取角色信息
      const { data: res } = await this.$api.get(`roles/${roleId}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      // 将角色信息保存到 getEditRoleInfo 中
      this.getEditRoleInfo = res.data
      // 显示编辑角色弹窗
      this.editRoleDialogVisible = true
    },
    // 5、关闭编辑角色弹窗时重置编辑的内容
    editRoleDialogClose() {
      this.$refs.getEditRoleInfoRef.resetFields()
    },
    // 6、编辑角色信息后点击确定验证并提交表单
    editRoleInfo(roleId) {
      // 找到编辑角色的表单并校验后发送提交请求
      this.$refs.getEditRoleInfoRef.validate(async valid => {
        // 发送提交请求
        const { data: res } = await this.$api.put(
          'roles/' + this.getEditRoleInfo.roleId,
          {
            roleName: this.getEditRoleInfo.roleName,
            roleDesc: this.getEditRoleInfo.roleDesc
          }
        )
        // console.log(res)
        // 判断是否提交成功
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色失败！')
        }
        // 成功后提示编辑成功，并刷新列表和关闭弹窗
        this.$message.success('编辑角色成功！')
        this.getRolesList()
        this.editRoleDialogVisible = false
      })
    },
    // 7、删除角色信息
    async removeRoleById(roleId) {
      // 弹窗提示是否删除角色
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // console.log(confirmResult, roleId)
      // 判断是否删除
      if (confirmResult !== 'confirm') {
        return this.$message.error('已取消删除！')
      }
      // 确定删除，并发送请求
      const { data: res } = await this.$api.delete('roles/' + roleId)
      // console.log(res)
      // 判断删除成功，并刷新列表
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.getRolesList()
    },
    // 8、根据 id 删除对应的三级权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // 点击确认删除的时候，调删除角色指定权限的接口
      const { data: res } = await this.$api.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      // this.getRolesList() 这样用会导致页面上的权限展开按钮又重新收起了
      // 由于该 delete 接口返回的data, 是当前角色下最新的权限数据，
      // 所以只需要给该角色 role 下的权限重新赋值就行，展开按钮就不会关闭
      role.children = res.data
    },
    // 9、展示分配权限功能
    async showSetRightDialog(role) {
      // 1.保存获取到的角色id
      this.roleId = role.id
      // 2.获取所有权限数据
      const { data: res } = await this.$api.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
      // 3.递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 10、通过递归的形式获取三级权限的id, 并保存到 defKeyss 中
    getLeafKeys(node, arr) {
      // node 指是否是三级节点，arr 数组用来保存数据
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 11、关闭分配权限对话框，并清理 defKeys 中的数据
    setRightDialogClose() {
      this.defKeys = []
    },
    // 12、给角色分配权限
    async allotRights() {
      // 1.先拿到所有的key，即获取所有全选或半选权限的id值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 2.将 keys 拼接成由 , 分隔的字符串
      const idStr = keys.join(',')
      // console.log(idStr)
      // 3.发送角色授权请求
      const { data: res } = await this.$api.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // console.log(res)
      // 4.判断是否授权成功
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败！')
      }
      // 5.提示授权成功
      this.$message.success('分配角色权限成功！')
      // 6.刷新角色权限列表
      this.getRolesList()
      // 7.关闭分配权限弹窗
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
