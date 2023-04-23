<template>
    <div>
        <el-select @change="inputChange" v-model="selectedInputDevice" placeholder="Select an input device">
            <el-option v-for="device in inputDevices" :key="device.deviceId" :label="device.label"
                :value="device.deviceId"></el-option>
        </el-select>
        <el-select @change="outputChange" v-model="selectedOutputDevice" placeholder="Select an output device">
            <el-option v-for="device in outputDevices" :key="device.deviceId" :label="device.label"
                :value="device.deviceId"></el-option>
        </el-select>
        <el-select @change="videoChange" v-model="selectedVideoDevice" placeholder="Select a video device">
            <el-option v-for="device in videoDevices" :key="device.deviceId" :label="device.label"
                :value="device.deviceId"></el-option>
        </el-select>
    </div>
</template>
  
<script lang="ts">
export default {
    data() {
        return {
            inputDevices: [{ deviceId: '', label: '' }],
            outputDevices: [{ deviceId: '', label: '' }],
            videoDevices: [{ deviceId: '', label: '' }],
            selectedInputDevice: '',
            selectedOutputDevice: '',
            selectedVideoDevice: '',
        };
    },
    mounted() {
        this.getDevices();
        navigator.mediaDevices.ondevicechange = () => {
            this.getDevices();
        };
    },
    methods: {
        getDevices() {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                console.log("🚀 ~ file: MediaSelect.vue:39 ~ navigator.mediaDevices.enumerateDevices ~ devices:", devices);
                this.inputDevices = devices.filter((device) => device.kind === 'audioinput');
                this.outputDevices = devices.filter((device) => device.kind === 'audiooutput');
                this.videoDevices = devices.filter((device) => device.kind === 'videoinput');

            });
        },
        inputChange(val: string) {
            this.selectedInputDevice = val
            this.$emit('my-event', { inputId: this.selectedInputDevice, outputId: this.selectedOutputDevice, videoId: this.selectedVideoDevice });
        },
        outputChange(val: string) {
            this.selectedOutputDevice = val
            this.$emit('my-event', { inputId: this.selectedInputDevice, outputId: this.selectedOutputDevice, videoId: this.selectedVideoDevice });
        },
        videoChange(val: string) {
            this.selectedVideoDevice = val
            this.$emit('my-event', { inputId: this.selectedInputDevice, outputId: this.selectedOutputDevice, videoId: this.selectedVideoDevice });
        }
    },
};
</script>