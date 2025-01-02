---
title: Mybatis设计缺陷
date: 2025-01-12 13:38:02
---
#### 背景
在最近的一个项目中，我遇到了一个由 MyBatis 引发的异常，异常堆栈信息如下：
```
org.springframework.dao.DataIntegrityViolationException: Error attempting to get column 'remark' from result set. Cause: java.sql.SQLDataException: Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value ; Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value; nested exception is java.sql.SQLDataException: Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value org.springframework.dao.DataIntegrityViolationException: Error attempting to get column 'remark' from result set. Cause: java.sql.SQLDataException: Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value ; Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value; nested exception is java.sql.SQLDataException: Cannot convert string '[process:下单成功通知][result:fail][error:syntax error, unexpect token error];' to java.sql.Timestamp value at org.springframework.jdbc.support.SQLExceptionSubclassTranslator.doTranslate(SQLExceptionSubclassTranslator.java:84)
```
该异常表明，MyBatis 在尝试将数据库中的字符串值转换为` java.sql.Timestamp`  时失败，导致 ` DataIntegrityViolationException` 异常。
#### 问题分析
首先，我检查了相关的代码，包括 Mapper 文件、Java Bean 以及 SQL 查询语句。
##### mapper.xml文件
```
    <select id="selectById" resultType="com.tem.car.domestic.model.didi.DidiMockRecord" parameterType="java.lang.Long">
        SELECT 
    id,
       callback_info,
       supplier_order_id,
       refund_amount,
       status,
       scene_type,
       remark,
       create_time,
       update_time
        FROM didi_mock_record
        WHERE id = #{id}
    </select>
```
#####  Mapper接口
```
public interface DidiMockRecordMapper {
    /**
     * 根据ID查询记录
     */
    DidiMockRecord selectById(Long id);
}

```
##### Java Bean
```
@Data
@Builder
public class DidiMockRecord {

    @Id
    @GeneratedValue(generator = "JDBC")
    private Long id;

    /**
     * 回调信息
     */
    private String callbackInfo;

    /**
     * 供应商订单号
     */
    private String supplierOrderId;

    /**
     * 退款金额
     */
    private BigDecimal refundAmount;

    /**
     * 状态 init:初始化 process:处理中 success:处理成功 fail:处理失败
     * @see com.tem.car.domestic.model.enums.DidiMockStatus
     */
    private String status;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 场景类型
     * @see com.tem.car.domestic.model.enums.DidiMockSceneType
     */
    private String sceneType;
}
```
从代码中可以看出，`remark` 字段是一个 `String` 类型，而异常信息却显示 MyBatis 试图将其转换为 `Timestamp` 类型。显然，问题并不在于 `remark` 字段的类型定义，而是 MyBatis 在处理结果集时出现了问题。

#### 远码分析
通过调试 MyBatis 源码，我发现问题的根源在于 `DefaultResultSetHandler` 类的 `createUsingConstructor` 方法。该方法通过构造函数来实例化对象，而构造函数的参数顺序与 SQL 查询结果的列顺序不一致，导致了类型转换错误。
```
  private Object createUsingConstructor(ResultSetWrapper rsw, Class<?> resultType, List<Class<?>> constructorArgTypes, List<Object> constructorArgs, Constructor<?> constructor) throws SQLException {
    boolean foundValues = false;
    for (int i = 0; i < constructor.getParameterTypes().length; i++) {
      Class<?> parameterType = constructor.getParameterTypes()[i];
      String columnName = rsw.getColumnNames().get(i);
      TypeHandler<?> typeHandler = rsw.getTypeHandler(parameterType, columnName);
      Object value = typeHandler.getResult(rsw.getResultSet(), columnName);
      constructorArgTypes.add(parameterType);
      constructorArgs.add(value);
      foundValues = value != null || foundValues;
    }
    return foundValues ? objectFactory.create(resultType, constructorArgTypes, constructorArgs) : null;
  }
```
关键代码在于最后一行：
```
    return foundValues ? objectFactory.create(resultType, constructorArgTypes, constructorArgs) : null;
```
该方法通过 `resultType` 的构造函数来实例化对象。具体来说：
1. `resultType` 是 `DidiMockRecord。`
2. `constructorArgTypes` 是构造函数的参数类型，依次为 `Long, String, String, BigDecimal, String, String, Date, Date, String`。
3. `constructorArgs` 是 SQL 查询结果中的数据，对应数据库中的 `id, callback_info, supplier_order_id, refund_amount, status, scene_type, remark, create_time, update_time`。
4. 对应关系如下
| Long | String |String | BigDecimal |String | String |Date | Date | String |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |------ |
| id | callback_info | supplier_order_id | refund_amount | status | scene_type | remark | create_time | update_time |


通过对比可以发现，构造函数的参数顺序与 SQL 查询结果的列顺序不一致，导致 remark 字段被错误地解释为 Date 类型，从而引发了异常。

#### 问题根源
问题的根源在于 MyBatis 默认使用构造函数来实例化对象，而构造函数的参数顺序与 SQL 查询结果的列顺序不一致。特别是在使用 Lombok 的 `@Builder` 注解时，生成的构造函数参数顺序可能与数据库列顺序不一致，导致类型转换错误。
#### 解决方案

为了避免这种问题，我认为更好的方式是不使用构造函数来实例化对象，而是通过反射或工厂方法来创建对象。这样可以确保对象的属性与数据库列的顺序无关，从而避免类型转换错误。

#### 结论
MyBatis 默认使用构造函数来实例化对象的设计存在缺陷，特别是在构造函数参数顺序与 SQL 查询结果列顺序不一致时，容易导致 `DataIntegrityViolationException` 异常。为了避免这种问题，建议使用反射或工厂方法来创建对象，而不是依赖构造函数。
