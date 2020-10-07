<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 登录头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>

      <!-- 登录表单 -->
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="用户名" prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            placeholder="密码"
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetloginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        // 表单的数据绑定对象
        username: '',
        password: ''
      },
      loginFormRules: {
        // 表单的数据校验规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 表单重置
    resetloginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login() {
      // 登录校验表单，并发送登录请求和详情结果判断：
      // 由于 POST 返回的是一个 promise ，为了简化操作可以用 async await 来进行优化；
      // 同时 await 只能用在 async 修饰的方法中，需要将 validate 中的箭头函数改写成异步的方法，这样就能拿到服务器直接返回的数据；
      // 由于服务器返回的属性中 data 属性中的数据才是真实数据，因此采用解构赋值的将 data 解构出来赋值给 res；
      // 最后在通过 res 中的 meta 属性中的返回状态码进行判断是否登录成功
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        const { data: res } = await this.$api.post('login', this.loginForm)
        console.log(res)
        if (res.meta.status === 200) {
          console.log('登录成功')
        }
        console.log('登录失败')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login_box {
  height: 300px;
  width: 450px;
  background: #fff;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  position: relative;

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    top: -25%;
    background-color: #fff;

    > img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
