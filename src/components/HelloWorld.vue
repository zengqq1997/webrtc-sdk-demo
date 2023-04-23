<template>
  <div style="margin: 20px" />
  <el-form label-width="100px" :model="formLabelAlign" style="max-width: 460px">
    <el-form-item label="URL">
      <el-input v-model="formLabelAlign.url" placeholder="Please input">
        <template #prepend>Https://</template>
      </el-input>
    </el-form-item>
    <el-form-item label="Username">
      <el-input v-model="formLabelAlign.name" />
    </el-form-item>
    <el-form-item label="ClientID">
      <el-input v-model="formLabelAlign.clientID" />
    </el-form-item>
    <el-form-item label="ClientSecret">
      <el-input v-model="formLabelAlign.clientSecret" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">注册</el-button>
    </el-form-item>

    <el-form-item label='设备选择'>
      <MediaSelect msg="Vite + Vue" @my-event="handleMyEvent" />
    </el-form-item>
  </el-form>
  <el-button @click="getCdr">cdr</el-button>
  <el-button @click="logout">登出</el-button>
</template>



<script lang="ts">
import { ElMessage } from 'element-plus';
import request from '../utils/request';
import MediaSelect from './MediaSelect.vue'

export default {
  data() {
    return {
      formLabelAlign: {
        name: '',
        url: '',
        clientSecret: '',
        clientID: ''
      },
      openApiToken: '',
      //刷新token
      refToken: '',
      secret: '',
      inputId: '',
      outputId: '',
      pbx: null,
      phone: null,
      accessTokenExpireTime:0
    }
  },
  components: {
    MediaSelect
  },
  created() {
    this.loadCache();
    // this.register();
  },
  methods: {
    loadCache(){
      this.formLabelAlign= {
        name: localStorage.getItem('name') || '',
        url: localStorage.getItem('url') || '',
        clientSecret: localStorage.getItem('clientSecret') || '',
        clientID: localStorage.getItem('clientID') || ''
      }
    },
    handleMyEvent(info: { inputId: string, outputId: string, videoId:string }) {
      console.log("🚀 ~ file: HelloWorld.vue:60 ~ handleMyEvent ~ info:", info);
      this.inputId = info.inputId;
      this.outputId = info.outputId;
      window.YSWebRTCUI.deviceIdsInfo.microphoneId = info.inputId
      window.YSWebRTCUI.deviceIdsInfo.speakerId = info.outputId
      window.YSWebRTCUI.deviceIdsInfo.cameraId = info.videoId
    },
    async getToken(url: string, username: string, password: string) {
      const getToken = async (url: string, username: string, password: string) => {
        try {
          const { data } = await request.post(
            'https://' + url + '/openapi/v1.0/get_token', {
            username,
            password
          }
          );
          if (data.errcode !== 0) return Promise.reject({ errcode: data.errcode, errmsg: data.errmsg })
          this.refToken = data.refresh_token;
          this.openApiToken = data.access_token;
          localStorage.setItem('refToken',this.refToken)
          const expTime = Date.now()+(Number(data.refresh_token_expire_time)*1000 - 10);
          localStorage.setItem('exp-time',expTime.toString());
          return data
        } catch (error) {
          return Promise.reject(error)
        }
      }
      await getToken(url, username, password).then(res => {
        setInterval(() => {
          this.refreshToken(url, this.refToken);
        }, Number(res.access_token_expire_time) * 1000- 10)
      })
    },
    async refreshToken(url: string, refreshToken: string) {
      try {
        const { data } = await request.post(
          'https://' + url + '/openapi/v1.0/refresh_token', {
          refresh_token: refreshToken
        },
        );
        if (data.errcode !== 0) return Promise.reject({ errcode: data.errcode, errmsg: data.errmsg })
        this.refToken = data.refresh_token;
        this.openApiToken = data.access_token;
        this.accessTokenExpireTime = data.access_token_expire_time;
        localStorage.setItem('refToken',this.refToken)
        const expTime = Date.now()+(Number(data.refresh_token_expire_time)*1000 - 10);
        localStorage.setItem('exp-time',expTime.toString());
        return data
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async onSubmit() {
      const { name, url, clientID, clientSecret } = this.formLabelAlign;
      localStorage.setItem('name',name);
      localStorage.setItem('url',url);
      localStorage.setItem('clientID',clientID);
      localStorage.setItem('clientSecret',clientSecret);
      const expTime = localStorage.getItem('exp-time') || '0';
      if(Number(expTime)>Date.now()){
        const refToken = localStorage.getItem('refToken') || '';
        await this.refreshToken(url, refToken);
        setInterval(()=>{
          this.refreshToken(url, refToken);
        },Number(this.accessTokenExpireTime)*1000-10)
      }else{
        await this.getToken(url, clientID, clientSecret);
      }
      request.post(`https://${url}/openapi/v1.0/sign/create?access_token=${this.openApiToken}`, { "username": name, "sign_type": "sdk", "expire time": 0 }).then(res => {

        console.log("🚀 ~ file: HelloWorld.vue:45 ~ request.post ~ res:", res);
        this.secret = res.data.data.sign;
        this.register();
      })
    },
    register() {
      const { name, url } = this.formLabelAlign
      const test = document.getElementById("test");
      try {
        window.YSWebRTCUI.init(test, {
          pbxURL: 'https://' + url,
          secret: this.secret,
          username: name,
          deviceInfo: {
            microphoneId: "default",
            cameraId: "default",
            speakerId: "default",
          },
        }).then((res: any) => {
          console.log("🚀 ~ file: App.vue:23 ~ created ~ result:", res);
          this.pbx=res.pbx;
          this.phone=res.phone
        }).catch((err: any) => {
          console.log("🚀 ~ file: HelloWorld.vue:56 ~ register ~ err:", err);
          ElMessage({
            message: err.message,
            type: 'warning',
          })

        });

      } catch (error) {

        console.log("🚀 ~ file: HelloWorld.vue:56 ~ register ~ err:", error);
      }
    },
    async getCdr(){
      if(!this.pbx) return;
      try {
        const res = await (this.pbx as any).cdrQuery({ page: 1, size: 20 });
        console.log('%c%s','color:#3D4A59;padding:5px;background:#3d93f75c','**************cdr 查询结果**************');
        console.log(res)
        console.log('%c%s','color:#3D4A59;padding:5px;background:#3d93f75c','****************************************');
      } catch (error) {
        console.error('获取cdr 失败',error)
      }
    },
    async logout() {
      if(!this.pbx) return;
      try {
        const res = await (this.pbx as any).logout();
        if(res.errcode===0)
        {
          console.log('%c%s','color:#3D4A59;padding:5px;background:#3d93f75c','**************登出成功**************');
          (this.pbx as any).destroy();
          (this.phone as any).destroy();
        }
        else
        console.log('%c%s','color:#3D4A59;padding:5px;background:#3d93f75c','*****************登出失败***************');
      } catch (error) {
        console.error('登出失败',error)
      }
    }
  }
}
</script>