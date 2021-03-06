<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 进度条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 纵向tab标签栏 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="goodsCategoriesList"
                :props="goodsProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                  size="small"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add-goods-btn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片弹窗 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImage" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'AddGoods',
  data() {
    return {
      activeIndex: '0', // 激活的步骤
      addGoodsForm: {
        // 添加商品的表单信息
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addGoodsFormRules: {
        // 商品表单的校验规则
        goods_name: [
          {
            required: true,
            message: '请输入商品名',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商平价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商平重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商平重量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      goodsCategoriesList: [], // 商品分类列表数据
      goodsProps: {
        // 级联选择权参数
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [], // 商品动态参数分类列表数据
      onlyTableData: [], // 商品静态属性分类列表数据
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload', // 上传图片地址
      headerObj: {
        // upload组件需要设置 token
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getGoodsCategories()
  },
  computed: {
    categoriesId() {
      return this.addGoodsForm.goods_cat.length === 3
        ? this.addGoodsForm.goods_cat[2]
        : null
    }
  },
  methods: {
    // 1、请求商品分类数据
    async getGoodsCategories() {
      const { data: res } = await this.$api.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.goodsCategoriesList = res.data
      // console.log(this.goodsCategoriesList)
    },
    // 2、监听级联选择器中的变化
    handleChange() {
      // console.log(this.addGoodsForm.goods_cat)
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 3、判断标签的切换
    beforeTabLeave() {
      if (
        this.activeIndex === '0' &&
        this.addGoodsForm.goods_cat.length !== 3
      ) {
        this.$message.error('请选择商品分类！')
        return false
      }
    },
    // 4、tab 标签切换事件触发
    async tabClick() {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$api.get(
          `categories/${this.categoriesId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表数据失败！')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$api.get(
          `categories/${this.categoriesId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表数据失败！')
        }
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // 5、监听图片预览
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 6、处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // console.log(filePath)
      // 从 pics 中找到要商品图片的索引
      const fileIndex = this.addGoodsForm.pics.findIndex(
        item => item.pic === filePath
      )
      // console.log(fileIndex)
      // 使用 splice 方法将图片从 pics 数组中删除
      this.addGoodsForm.pics.splice(fileIndex, 1)
      // console.log(this.addGoodsForm)
    },
    // 7、监听图片上传成功
    handleSuccess(res) {
      console.log(res)
      // 拼接图片信息
      const picInfo = {
        pic: res.data.tmp_path
      }
      // 将图片信息 push 到 addGoodsForm 的 pics 数组中
      this.addGoodsForm.pics.push(picInfo)
      // console.log(this.addGoodsForm)
    },
    // 8、添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入必填项！')
        // 使用 lodash 的深拷贝方法对 addGoodsForm 进行拷贝，并转换 goods_cat
        const cloneGoodsForm = _.cloneDeep(this.addGoodsForm)
        cloneGoodsForm.goods_cat = cloneGoodsForm.goods_cat.join(',')
        // 处理 addGoodsForm 中的 attrs，包括动态参数 manyTableData 和静态属性 onlyTableData
        // this.manyTableData.forEach(item => {
        //   const manyAttr = {
        //     attr_id: item.attr_id,
        //     attr_value: item.attr_vals.join(' ')
        //   }
        //   this.addGoodsForm.attrs.push(manyAttr)
        // })
        // this.onlyTableData.forEach(item => {
        //   const onlyAttr = { attr_id: item.attr_id, attr_value: item.attr_vals }
        //   this.addGoodsForm.attrs.push(onlyAttr)
        // })
        // cloneGoodsForm.attrs = this.addGoodsForm.attrs
        this.manyTableData.forEach(item => {
          const manyAttr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          cloneGoodsForm.attrs.push(manyAttr)
        })
        this.onlyTableData.forEach(item => {
          const onlyAttr = { attr_id: item.attr_id, attr_value: item.attr_vals }
          cloneGoodsForm.attrs.push(onlyAttr)
        })
        // console.log(this.addGoodsForm)
        // console.log(cloneGoodsForm)
        const { data: res } = await this.$api.post('goods', cloneGoodsForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 300px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImage {
  width: 100%;
}
.add-goods-btn {
  margin-top: 15px;
}
</style>
