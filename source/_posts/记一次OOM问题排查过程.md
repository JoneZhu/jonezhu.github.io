---
title: 记一次OOM问题排查过程
date: 2024-11-24 11:35:30
categories:
  - 技术
  - 问题甜点
tags:
---
#### 问题现象
从监控系统中发现系统状态异常，从后台的日志中查看日志如下

```
throwable:
java.lang.OutOfMemoryError: GC overhead limit exceeded
Exception in thread "DubboServerHandler-10.112.8.247:21885-thread-198" java.lang.OutOfMemoryError: GC overhead limit exceeded
java.lang.reflect.InvocationTargetException
at sun.reflect.GeneratedMethodAccessor426.invoke(Unknown Source)
at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.lang.reflect.Method.invoke(Method.java:498)
at com.iplatform.common.utils.LogUtils.fixedLocation(LogUtils.java:225)
at com.iplatform.common.utils.LogUtils.error(LogUtils.java:538)
at com.iplatform.common.interceptor.GlobalResponseInterceptor.logProcess(GlobalResponseInterceptor.java:81)
at sun.reflect.GeneratedMethodAccessor428.invoke(Unknown Source)
at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.lang.reflect.Method.invoke(Method.java:498)
at org.springframework.aop.aspectj.AbstractAspectJAdvice.invokeAdviceMethodWithGivenArgs(AbstractAspectJAdvice.java:644)
at org.springframework.aop.aspectj.AbstractAspectJAdvice.invokeAdviceMethod(AbstractAspectJAdvice.java:633)
at org.springframework.aop.aspectj.AspectJAroundAdvice.invoke(AspectJAroundAdvice.java:70)
at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.proceed(CglibAopProxy.java:750)
at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:95)
at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.proceed(CglibAopProxy.java:750)
at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:692)
at com.tem.oms.service.OrderServiceImpl$$EnhancerBySpringCGLIB$$7822f4a2.listAllOrderAndOrderCost(<generated>)
at org.apache.dubbo.common.bytecode.Wrapper33.invokeMethod(Wrapper33.java)
at org.apache.dubbo.rpc.proxy.javassist.JavassistProxyFactory$1.doInvoke(JavassistProxyFactory.java:47)
at org.apache.dubbo.rpc.proxy.AbstractProxyInvoker.invoke(AbstractProxyInvoker.java:84)
at org.apache.dubbo.config.invoker.DelegateProviderMetaDataInvoker.invoke(DelegateProviderMetaDataInvoker.java:56)
at org.apache.dubbo.rpc.protocol.InvokerWrapper.invoke(InvokerWrapper.java:56)
at org.apache.dubbo.rpc.protocol.dubbo.filter.TraceFilter.invoke(TraceFilter.java:77)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.TimeoutFilter.invoke(TimeoutFilter.java:44)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.monitor.support.MonitorFilter.invoke(MonitorFilter.java:91)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.ExceptionFilter.invoke(ExceptionFilter.java:52)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at com.iplatform.common.trace.apache.ApacheProviderTraceFilter.invoke(ApacheProviderTraceFilter.java:113)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at com.iplatform.common.router.filter.DubboProviderTrafficTagFilter.invoke(DubboProviderTrafficTagFilter.java:31)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.GenericFilter.invoke(GenericFilter.java:192)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.ClassLoaderFilter.invoke(ClassLoaderFilter.java:38)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.EchoFilter.invoke(EchoFilter.java:41)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.filter.ContextFilter.invoke(ContextFilter.java:129)
at org.apache.dubbo.rpc.protocol.FilterNode.invoke(FilterNode.java:61)
at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol$1.reply(DubboProtocol.java:148)
at org.apache.dubbo.remoting.exchange.support.header.HeaderExchangeHandler.handleRequest(HeaderExchangeHandler.java:100)
at org.apache.dubbo.remoting.exchange.support.header.HeaderExchangeHandler.received(HeaderExchangeHandler.java:175)
at org.apache.dubbo.remoting.transport.DecodeHandler.received(DecodeHandler.java:51)
at org.apache.dubbo.remoting.transport.dispatcher.ChannelEventRunnable.run(ChannelEventRunnable.java:57)
at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
at org.apache.dubbo.common.threadlocal.InternalRunnable.run(InternalRunnable.java:41)
at java.lang.Thread.run(Thread.java:750)
Caused by: java.lang.IndexOutOfBoundsException
at java.lang.Throwable.getStackTraceElement(Native Method)
... 53 more
```
#### 问题原因
OOM原因：A服务的接口 `/plan/module` 查询条件设置错误，导致查询出了数据库将近10w的订单数据，进而导致内存耗尽。
![Img](/images/img_20241124114201_1.png)

#### 解决方案
1. 修正逻辑错误，每次仅查一条订单数据
2. 在查询服务中限制查询最大查询数据量，最大仅可查询10条数据。
#### 问题定位过程
##### Q1:为什么op22在阿里云 kubernetes集群状态下是异常
由于check-health.do 接口无响应导致

##### Q2. 为什么check-health.do 接口无响应？
在日志中找到了答案，是因为服务OOM
```
2024-11-15 16:18:51,487 ERROR [DubboServerHandler-10.112.8.247:21885-thread-191] [com.iplatform.common.interceptor.GlobalResponseInterceptor] 7529e43823a147e08636c85d0968c43a - 业务执行出现未知异常:
java.lang.OutOfMemoryError: GC overhead limit exceeded
Exception in thread "DubboServerHandler-10.112.8.247:21885-thread-198" java.lang.OutOfMemoryError: GC overhead limit exceeded
java.lang.reflect.InvocationTargetException
at sun.reflect.GeneratedMethodAccessor426.invoke(Unknown Source)
at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.lang.reflect.Method.invoke(Method.java:498)
```
##### Q3. 为什么通过ES日志无法获取到异常OOM
服务未将此异常上报

##### Q4. 知道了服务OOM，排查起来页简单，直接dump就可以，但是dump 下来的文件只有不到200M，为什么只有不到200M呢？
现在在已经得知问题的根本原因的情况去反推的话，在dump 之前服务已经做了full GC。GC之后能回收数据应该不是泄漏了

##### Q5. 既然推测不是泄漏了，那么修改jvm 的最大内存 从1G改到2G，再观察，虽然不再出现OOM，但是内存占用仍然会达到80%，这个服务是没什么流量的，不应该占用如此大的流量，拉dump，分析dump 支配树即，观察下图的dump发现支配树的内存总共也就占100M有余，但是整个dump 有1.4G，所以直接分析支配书应该分析不出来，那只能尝试分析对象实例了。
![Img](/images/img_20241124114617_2.png)




##### Q6：对象的实例倒是很明显，大对象特别多，其中有个一个对象竟然140M，饭解析一下这个对象，其内容如下，从140M的对象可以看出这是个特别大的字符串，而且这个字符串对象在序列化前和ResponseInfo以及OrderBillSimpleDto 有关系
![Img](/images/img_20241124114654_3.png)

```
重点在R,e,s,p,o,n,s,e,I,n,f,o, ,[,c,o,d,e,=,0,,, ,m,s,g,=,成,功,,, ,d,a,t,a,=,[,O,r,d,e,r,B,i,l,l,S,i,m,p,l,e,D,t,o,
```


![Img](/images/img_20241124114700_4.png)


##### Q7: ResponseInfo是找不到的，但是OrderBillSimpleDto可以找到，将所有的返回OrderBillSimpleDto 均加上数量集日志，发现如下，某个返回的列表竟然有近10w的数据 ，
![Img](/images/img_20241124114201_1.png)

##### Q8. 什么场景下需要查询10w的数据呢？ 
通过链路追踪，发现错误传参导致，condition传入了id，但是在service层接收的参数是orderId，所以导致会查询出所有的数据，所以第一这个地方要改正，其次service 层要加控制，最少要传入pageStart 和pageSize

#### 一些思考和目前仍然没有答案的疑问
-  为了避免类似的情况发生，系统应该有大对象监控
- 为什么通过分析支配树分析无效
- 为什么打印出的日志是 ResponseInfo 且业务逻辑中没有使用到该类



