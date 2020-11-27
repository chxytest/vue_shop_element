<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片内容区域 -->
    <el-card>
      <!-- 提示警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="select-goods-categories">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCategoriesKeys"
            :options="categoriesList"
            :props="propsCategories"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 活动标签区域 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 动态参数标签内容 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格区域 -->
          <el-table :data="manyTabParams" border stripe>
            <!-- 展开区域 -->
            <el-table-column type="expand">
              <template v-slot="params">
                <el-tag
                  v-for="(item, i) in params.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, params.row)"
                >{{ item }}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="params.row.inputVisible"
                  v-model="params.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(params.row)"
                  @blur="handleInputConfirm(params.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(params.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 表索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="params">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(params.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParamsAttributes(params.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数标签内容 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格区域 -->
          <el-table :data="onlyTabParams" border stripe>
            <!-- 展开区域 -->
            <el-table-column type="expand">
              <template v-slot="attributes">
                <el-tag
                  v-for="(item, i) in attributes.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, attributes.row)"
                >{{ item }}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="attributes.row.inputVisible"
                  v-model="attributes.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(attributes.row)"
                  @blur="handleInputConfirm(attributes.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(attributes.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 表索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="attributes">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(attributes.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParamsAttributes(attributes.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数、添加属性弹窗 -->
    <el-dialog
      :title="'添加' + addTitleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form :model="addPAForm" :rules="addPAFormRules" ref="addPAFormRef" label-width="100px">
        <el-form-item :label="addTitleText" prop="attr_name">
          <el-input v-model="addPAForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsAttributes">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑弹框 -->
    <el-dialog
      :title="'修改' + addTitleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form :model="editPAForm" :rules="addPAFormRules" ref="editPAFormRef" label-width="100px">
        <el-form-item :label="addTitleText" prop="attr_name">
          <el-input v-model="editPAForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsAttributes">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      categoriesList: [], // 所有商品分类数据
      propsCategories: {
        // 级联选择框的对应的props属性值
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // checkStrictly: true
      },
      selectedCategoriesKeys: [], // 选中的商品分类的id数组
      activeTabName: 'many', // 选中的 tab 标签的名称
      manyTabParams: [], // many标签下的数据
      onlyTabParams: [], // only标签下的数据
      addDialogVisible: false, // 控制添加弹窗的显示和隐藏
      addPAForm: {}, // 添加动态参数、静态属性表单数据
      addPAFormRules: {
        // 添加表单参数属性的校验规则
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false, // 控制编辑弹框的显示和隐藏
      editPAForm: {} // 编辑动态参数、静态属性表单数据
    }
  },
  computed: {
    isBtnDisabled() {
      // 当按钮需要被禁用时，则返回 true ， 否则返回 false
      // 使用三元表达式时需要将 true 和 false 字符串转换成 Boolean 类型：JSON.parse(isBtnDisabled)
      // return this.selectedCategoriesKeys.length !== 3 ? 'true' : 'false'
      return this.selectedCategoriesKeys.length !== 3
    },
    selectedLastCatId() {
      return this.selectedCategoriesKeys.length === 3
        ? this.selectedCategoriesKeys[2]
        : ''
    },
    addTitleText() {
      return this.activeTabName === 'many' ? '动态参数' : '静态属性'
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    // 1、请求商品分类数据
    async getCategoriesList() {
      const { data: res } = await this.$api.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.categoriesList = res.data
      // console.log(this.categoriesList)
    },
    // 2、监控级联选择框数据变化
    handleChange() {
      this.getCategoriesParams()
    },
    // 3、点击 tab 标签切换
    handleTabClick() {
      // console.log(this.activeTabName)
      this.getCategoriesParams()
    },
    // 4、获取分类参数列表数据
    async getCategoriesParams() {
      // 当选中的不是三级分类时，无法选中
      if (this.selectedCategoriesKeys.length !== 3) {
        this.selectedCategoriesKeys = []
        this.manyTabParams = []
        this.onlyTabParams = []
      }
      // console.log(this.selectedCategoriesKeys)
      const {
        data: res
      } = await this.$api.get(
        `categories/${this.selectedLastCatId}/attributes`,
        { params: { sel: this.activeTabName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('请选择商品分类！')
      }
      // 将列表的展开项中的 attr_vals 的值由字符串转换成数组，为了页面循环遍历渲染用
      // 通过三元表达式解决出现空标签的问题
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每一行数据都添加一个输入框的 Boolean 值和输入值
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeTabName === 'many') {
        this.manyTabParams = res.data
      } else {
        this.onlyTabParams = res.data
      }
    },
    // 5、监听添加弹窗的关闭
    addDialogClosed() {
      this.$refs.addPAFormRef.resetFields()
    },
    // 6、添加参数属性确定提交
    addParamsAttributes() {
      this.$refs.addPAFormRef.validate(async valid => {
        if (!valid) return console.log('表单校验失败')
        const {
          data: res
        } = await this.$api.post(
          `categories/${this.selectedLastCatId}/attributes`,
          { attr_name: this.addPAForm.attr_name, attr_sel: this.activeTabName }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        this.getCategoriesParams()
        this.addDialogVisible = false
      })
    },
    // 7、点击编辑显示编辑弹框
    async showEditDialog(attrId) {
      const {
        data: res
      } = await this.$api.get(
        `categories/${this.selectedLastCatId}/attributes/${attrId}`,
        { params: { sel: this.activeTabName } }
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editPAForm = res.data
      this.editDialogVisible = true
    },
    // 8、监听编辑弹框的关闭
    editDialogClosed() {
      this.$refs.editPAFormRef.resetFields()
    },
    // 9、编辑参数数据确定提交
    editParamsAttributes() {
      this.$refs.editPAFormRef.validate(async valid => {
        if (!valid) return console.log('校验失败')
        const {
          data: res
        } = await this.$api.put(
          `categories/${this.selectedLastCatId}/attributes/${this.editPAForm.attr_id}`,
          { attr_name: this.editPAForm.attr_name, attr_sel: this.activeTabName }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getCategoriesParams()
        this.editDialogVisible = false
      })
    },
    // 10、删除动态参数、静态属性
    async deleteParamsAttributes(attrid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除成功')
      }
      const { data: res } = await this.$api.delete(
        `categories/${this.selectedLastCatId}/attributes/${attrid}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getCategoriesParams()
    },
    // 11、监控焦点和enter键
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        this.inputValue = ''
        row.inputVisible = false
        return this.inputValue
      }
      // 如果没有return ，则证明输入了内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求提交输入的内容
      this.saveAttrVals(row)
    },
    // 12、监控点击输入文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本输入框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 13、删除参数下的对应的参数项标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 14、请求修改参数项数据
    async saveAttrVals(row) {
      const { data: res } = await this.$api.put(
        `categories/${this.selectedLastCatId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeTabName,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.select-goods-categories {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
