---
title: JPA与MySQL JSON_EXTRACT布尔值查询问题
date: 2025-09-06 17:21:04
categories:
  - 技术
  - 问题甜点
---
## 问题描述

在使用Spring Data JPA的`@Query`注解进行MySQL原生查询时，当查询条件涉及JSON字段的布尔值比较时，可能会出现查询结果为空的问题。

## 问题原因

MySQL 8.0的`JSON_EXTRACT`函数返回原生布尔类型（`true`/`false`），但JPA在处理命名参数时，会将Java的`Boolean`类型转换为字符串形式（`'true'`/`'false'`）。

这导致以下查询条件失效：
```sql
-- JPA实际执行的查询（类型不匹配）
JSON_EXTRACT(t.task_params, '$.ballInBasket') = 'true'  -- 字符串'true'
```

而期望的查询应该是：
```sql
-- 正确的查询（类型匹配）
JSON_EXTRACT(t.task_params, '$.ballInBasket') = true    -- 布尔值true
```

## 问题示例

### 有问题的代码
```java
@Query(value = "SELECT * FROM ai_analysis_tasks t WHERE " +
       "JSON_EXTRACT(t.task_params, '$.ballInBasket') = :ballInBasket", 
       nativeQuery = true)
Page<AiAnalysisTask> findTasksByBoolParam(@Param("ballInBasket") Boolean ballInBasket, Pageable pageable);
```

当传入`ballInBasket = true`时，JPA会将其转换为字符串`'true'`，导致与JSON中的布尔值`true`不匹配。

## 解决方案

### 方案1：使用动态SQL拼接（推荐）

```java
private Page<AiAnalysisTask> findTasksDynamic(Boolean ballInBasket, Pageable pageable) {
    StringBuilder sql = new StringBuilder();
    sql.append("SELECT * FROM ai_analysis_tasks t WHERE 1=1 ");
    
    if (ballInBasket != null) {
        // 直接拼接布尔值，避免JPA参数转换
        sql.append("AND JSON_EXTRACT(t.task_params, '$.ballInBasket') = ").append(ballInBasket).append(" ");
    }
    
    sql.append("ORDER BY t.created_at DESC");
    
    Query query = entityManager.createNativeQuery(sql.toString(), AiAnalysisTask.class);
    // ... 执行查询和分页逻辑
}
```

### 方案2：使用字符串比较

```java
@Query(value = "SELECT * FROM ai_analysis_tasks t WHERE " +
       "JSON_EXTRACT(t.task_params, '$.ballInBasket') = 'true'", 
       nativeQuery = true)
Page<AiAnalysisTask> findTasksWithTrueBallInBasket(Pageable pageable);
```

### 方案3：使用JSON函数进行类型转换

```java
@Query(value = "SELECT * FROM ai_analysis_tasks t WHERE " +
       "CAST(JSON_EXTRACT(t.task_params, '$.ballInBasket') AS CHAR) = :ballInBasket", 
       nativeQuery = true)
Page<AiAnalysisTask> findTasksByBoolParam(@Param("ballInBasket") String ballInBasket, Pageable pageable);
```

## 最佳实践

1. **避免在JPA @Query中直接使用Boolean参数与JSON_EXTRACT比较**
2. **使用动态SQL拼接的方式处理复杂的JSON查询条件**
3. **添加SQL日志输出，便于调试查询问题**
4. **考虑使用JPA的Criteria API或Specification进行类型安全的动态查询**

## 相关代码位置

- Repository: `AiAnalysisTaskRepository.java`
- Service: `ShotAccuracyManagementService.findShotAccuracyTasksDynamic()`

## 教训总结

在处理MySQL JSON字段与JPA结合使用时，需要特别注意类型转换问题。原生SQL查询中的参数绑定可能不会按照预期的数据类型进行处理，建议使用动态SQL拼接的方式来确保类型匹配的准确性。