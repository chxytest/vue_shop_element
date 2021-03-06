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
          <el-input
            placeholder="请输入内容"
            v-model="queryUsersInfo.query"
            clearable
            @clear="getUsersInfoList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUsersInfoList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="usersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- slot-scope="scope" 可以接收当前作用域插槽中的数据 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setUserRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryUsersInfo.pagenum"
        :page-sizes="[2, 5, 10, 100]"
        :page-size="queryUsersInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户弹窗 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!-- 弹窗中间内容区域 -->
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 弹窗底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户弹窗 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 其中修改表单的校验规则复用了新增用户中的表单校验规则 addUserFormRules -->
      <el-form
        :model="getEditUserInfo"
        :rules="addUserFormRules"
        ref="getEditUserInfoRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="getEditUserInfo.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="getEditUserInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="getEditUserInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色弹窗 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @closed="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的用户：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in allRolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 自定义验证邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9])+@([a-zA-Z0-9_-])+([a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // console.log(regEmail.test(value))
        return callback()
      } else {
        callback(new Error('请输入合法邮箱'))
      }
    }

    // 自定义验证手机号
    var checkPhone = (rule, value, callback) => {
      // console.log(typeof value, '\\\\/')
      const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
      if (!Number.isInteger(+value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (phoneReg.test(value)) {
          callback()
        } else {
          callback(new Error('电话号码格式不正确'))
        }
      }
    }

    return {
      queryUsersInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      usersList: [],
      total: 0,
      addDialogVisible: false, // 表示添加用户弹窗的显示和隐藏
      addUserForm: {
        // 添加用户表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        // 添加用户表单的验证规则
        username: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名称长度在 3 ~ 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户密码长度在 6 ~ 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      editDialogVisible: false, // 表示编辑用户弹窗的显示和隐藏
      getEditUserInfo: {}, // 获取用户信息
      setRoleDialogVisible: false, // 表示分配角色弹窗的显示和隐藏
      userInfo: {}, // 表示用户分配角色前的用户信息
      allRolesList: [], // 获取是所有角色信息
      selectedRoleId: '' // 已选中的角色 id 值
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
      // console.log(res)
    },
    // 2、监听页面改变事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryUsersInfo.pagesize = newSize
      this.getUsersInfoList()
    },
    // 3、监听页码改变事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryUsersInfo.pagenum = newPage
      this.getUsersInfoList()
    },
    // 4、改变用户状态事件
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$api.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state // 请求失败时，为了保持页面的用户状态
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 5、清空添加用户弹窗中的输入框
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 6、添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return console.log('校验失败')
        const { data: res } = await this.$api.post('users', this.addUserForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUsersInfoList()
      })
    },
    // 7、修改用户
    async showEditDialog(id) {
      const { data: res } = await this.$api.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getEditUserInfo = res.data
      // console.log(this.getEditUserInfo)
      this.editDialogVisible = true
    },
    // 8、关闭编辑用户弹窗时重置编辑的内容
    editDialogClose() {
      this.$refs.getEditUserInfoRef.resetFields()
    },
    // 9、编辑用户信息后点击确定提交表单并验证
    editUserInfo(id) {
      this.$refs.getEditUserInfoRef.validate(async valid => {
        if (!valid) return console.log('校验不通过')
        // 9.1 发送编辑用户信息的提交请求来修改用户信息
        const { data: res } = await this.$api.put(
          'users/' + this.getEditUserInfo.id,
          {
            email: this.getEditUserInfo.email,
            mobile: this.getEditUserInfo.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 9.2 提交成功关闭弹窗
        this.editDialogVisible = false
        // 9.3 刷新用户列表
        this.getUsersInfoList()
        // 9.4 提示用户编辑成功
        this.$message.success(res.meta.msg)
      })
    },
    // 10、通过 id 删除用户
    async removeUserById(id) {
      // console.log(id)
      // 1、弹窗提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // console.log(confirmResult)
      // 2、判断用户点击是 确定 还是 取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 3、确定删除时调用删除接口
      const { data: res } = await this.$api.delete('users/' + id)
      // console.log(res)
      // 4、判断是否删除成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      // 5、提示用户删除成功
      this.$message.success('删除用户成功')
      this.getUsersInfoList()
    },
    // 11、给用户分配角色
    async setUserRole(userInfo) {
      // 1.弹窗打开时显示当前的用户信息
      this.userInfo = userInfo
      // 2.弹窗打开前，获取所有的角色列表
      const { data: res } = await this.$api.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有角色数据失败！')
      }
      this.allRolesList = res.data
      // console.log(this.allRolesList)
      this.setRoleDialogVisible = true
    },
    // 12、点击确定保存分配给用户的角色
    async saveRoleInfo() {
      // 1.判断是否有选择分配的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选中要分配的角色！')
      }
      // 2.选择分配的角色后，发送请求保存
      const { data: res } = await this.$api.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      // console.log(res)
      // 3.判断角色是否分配成功
      if (res.meta.status !== 200) {
        return this.$message.error('用户分配角色失败！')
      }
      // 4.分配成功并刷新用户列表
      this.$message.success(res.meta.msg)
      this.getUsersInfoList()
      // 5.关闭分配用户角色弹窗
      this.setRoleDialogVisible = false
    },
    // 13、监听关闭分配角色弹窗，关闭时清空角色选择框和 userInfo
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = []
      // console.log(this.userInfo)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
