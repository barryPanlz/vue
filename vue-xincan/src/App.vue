
<!--
    系统跟组件
    :menus="menus"        将当前父组件menus变量传入Navigation子组件，使之子组件能够获取父组件menus数据
    :controller="this"    将当前父组件this对象传入Navigation子组件，使之子组件能够调用父组件所有变量、方法、函数
-->

<template>

  <div id="app">

    <!--
        引入头部Header组件
        :app="this"        将当前父组件menus变量传入Header子组件，使之子组件能够获取父组件所有数据、函数、对象等
    -->
    <Header :app="this" />

    <!--
        引入Vue路由
        :menus="menus"        将当前父组件menus变量传入路由跳转的*Controller子组件，使之子组件能够获取父组件menus数据
        :app="this"           将当前父组件this对象传入路由跳转的*Controller子组件，使之子组件能够调用父组件所有变量、方法、函数
    -->
    <router-view :menus="menus" :app="this" />

  </div>

</template>

<script>
    // 引入头部插件
    import Header from "@/components/main/Header";
    export default {
        name: 'App'
        ,components: {Header}   // 头部插件注册
        ,data(){
            return {
               menus:[]         // 用于存储子组件调用父组件函数赋值
            }
        }
        ,methods: {
            /**
             * 定义函数
             * 用于子组件调用父组件函数传参，并给父组件menus赋值
             * @Method initCellIsHide
             */
            setParentMenus(menus){
                this.menus = menus;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
