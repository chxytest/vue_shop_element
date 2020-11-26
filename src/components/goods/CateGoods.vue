<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategoriesGoods">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类列表区域 -->
      <tree-table
        style="margin-top: 15px"
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template #isok="isok">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="isok.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template #order="order">
          <el-tag size="mini" v-if="order.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="order.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #option="option">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCategories(option.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCategories(option.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 翻页栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[3, 5, 10, 15]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="categoriesTotal"
      ></el-pagination>
    </el-card>

    <!-- 添加分类弹框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoriesDialogVisible"
      width="50%"
      @close="addCategoriesDialogClosed"
    >
      <!-- 分类表单区域 -->
      <el-form
        :model="addCategoriesForm"
        :rules="addCategoriesFormRules"
        ref="addCategoriesFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCategoriesForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategoriesList"
            :props="cascaderProps"
            @change="parentCategoriesChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategoriesEnter">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类弹框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCategoriesDialogVisible"
      width="50%"
      @close="editCategoriesDialogClosed"
    >
      <!-- 分类表单区域 -->
      <el-form
        :model="editCategoriesForm"
        :rules="addCategoriesFormRules"
        ref="editCategoriesFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCategoriesForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategoriesEnter">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CateGoods',
  data() {
    return {
      queryInfo: {
        //  分类列表的默认查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categoriesList: [], // 商品分类数据
      categoriesTotal: 0, // 总分类条数
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' }, // type表示当前列定义为模板列，template当前列使用模板的名称
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'option' }
      ],
      addCategoriesDialogVisible: false, // 控制添加分类弹窗的显示和隐藏
      addCategoriesForm: {
        // 添加分类的表单数据
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCategoriesFormRules: {
        // 添加分类的表单校验规则
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCategoriesList: [], //  父级分类列表数据
      cascaderProps: {
        // 指定每一级的配置对象
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true
      },
      selectedKeys: [], // 选中的父级分类的id数组
      editCategoriesDialogVisible: false, // 控制编辑弹框的显示和隐藏
      editCategoriesForm: {} // 获取编辑商品分类信息
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    // 1、获取商品分类数据
    async getCategories() {
      const { data: res } = await this.$api.get('categories', {
        params: this.queryInfo
      })
      // console.log(res)
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // 将获取到的数据保存到 categoriesList 中
      this.categoriesList = res.data.result
      // console.log(this.categoriesList)
      // 将获取到总条数保存到 categoriesTotal 中
      this.categoriesTotal = res.data.total
    },
    // 2、监听 pagesize 的变化
    handleSizeChange(newSize) {
      // 将新的每页显示数量赋值给 pagesize ，并发送请求更新页面
      this.queryInfo.pagesize = newSize
      this.getCategories()
    },
    // 3、监听 pagenum 的变化
    handleCurrentChange(newPage) {
      // 将新的页码数赋值给 pagenum ， 并发送请求更新页面
      this.queryInfo.pagenum = newPage
      this.getCategories()
    },
    // 4、添加商品分类弹窗
    addCategoriesGoods() {
      this.getParentategoriesList()
      this.addCategoriesDialogVisible = true
    },
    // 5、获取父级数据列表
    async getParentategoriesList() {
      const { data: res } = await this.$api.get('categories', {
        params: { type: 2 }
      })
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // console.log(res)
      this.parentCategoriesList = res.data
    },
    // 6、监控父级分类的选定
    parentCategoriesChanged() {
      // console.log(this.selectedKeys)
      // 判断如果 selectedKeys 数组中的 length 大于 0 ，则选中的父级分类
      // 否则没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id
        this.addCategoriesForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 当前分类的等级
        this.addCategoriesForm.cat_level = this.selectedKeys.length
        // return
      } else {
        this.addCategoriesForm.cat_pid = 0
        this.addCategoriesForm.cat_level = 0
      }
    },
    // 7、确定添加商品分类
    addCategoriesEnter() {
      // console.log(this.addCategoriesForm)
      this.$refs.addCategoriesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$api.post(
          'categories',
          this.addCategoriesForm
        )
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败！')
        }
        this.$message.success('添加商品分类成功！')
        this.getCategories()
        this.addCategoriesDialogVisible = false
      })
    },
    // 8、关闭添加商品分类弹窗
    addCategoriesDialogClosed() {
      // 清空表单
      this.$refs.addCategoriesFormRef.resetFields()
      // 清空 selectedKeys 来清空父级分类的表单
      this.selectedKeys = []
      // 清空 addCategoriesForm 数据
      this.addCategoriesForm.cat_pid = 0
      this.addCategoriesForm.cat_level = 0
    },
    // 9、删除商品分类
    async deleteCategories(id) {
      // console.log(id)
      // 1.弹窗提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // 2.判断用户点击是 确定 还是 取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 3.确定删除时调用删除接口
      const { data: res } = await this.$api.delete('categories/' + id)
      // 4.判断是否删除成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品分类失败！')
      }
      // 5.提示用户删除成功并刷新列表
      this.$message.success('删除商品分类成功！')
      this.getCategories()
    },
    // 10、编辑商品分类弹窗
    async editCategories(id) {
      // console.log(id)
      const { data: res } = await this.$api.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.editCategoriesForm = res.data
      // console.log(this.editCategoriesForm)
      this.editCategoriesDialogVisible = true
    },
    // 11、监控编辑商品分类弹窗关闭
    editCategoriesDialogClosed() {
      // this.editCategoriesDialogVisible = false
      this.$refs.editCategoriesFormRef.resetFields()
    },
    // 12、编辑商品分类提交
    editCategoriesEnter() {
      this.$refs.editCategoriesFormRef.validate(async valid => {
        if (!valid) return console.log('校验不通过')
        const { data: res } = await this.$api.put(
          'categories/' + this.editCategoriesForm.cat_id,
          {
            cat_name: this.editCategoriesForm.cat_name
          }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品分类失败！')
        }
        this.$message.success('编辑商品分类成功！')
        this.getCategories()
        this.editCategoriesDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less">
.el-cascader {
  width: 100%;
}
.el-cascader-panel {
  height: 300px;
}
</style>
