# 初识Flag

### 思考部分：

1、当前实现的流程中，dom有什么问题？每次在completeWork都会创建新的dom元素，如果更新发生在局部，大部分都不需要变化的时候，这个时候又在频发的创建dom，就会很耗性能。怎么办？dom复用

2、怎么实现dom复用？判断+执行。判断是否可复用，根据判断结果执行对应操作。

3、当前处理dom的操作主要集中在completeWork中，以及commitWork的挂载，那是不是可以都放在completeWork里，进行判断+执行？不可以，当遇到可中段渲染和优先级高的情况，会出现渲染完整性的问题。

4、不在completeWork中直接进行，那怎么办？将判断和执行拆成两个部分，判断放在可中段的阶段，执行放在一个不可中断的阶段中进行。也就是commitWork阶段。

- 对比过程：发生在beginWork和completeWork阶段，并将对比后的结果存储下来，（completeWork阶段有个特殊情况——离屏构建）简单说就是三个字——打标记（标记系统）

- 执行复用：发生在commitWork阶段。

5、既然要拆开，那怎么保证在执行的时候是可以做出正确的操作呢？标记系统，打标记。

6、那标记应该是个什么样的数据结构会比较好呢？二进制，便于运算。

```typescript
// 使用二进制位运算，性能极高
const Placement = 0b0000000000000000000000000000010;  // 2
const Update = 0b0000000000000000000000000000100;     // 4
const Deletion = 0b0000000000000000000000000001000;   // 8

// 设置标记 - 使用位或运算
fiber.flags |= Placement;  // 添加Placement标记

// 检查标记 - 使用位与运算
if (fiber.flags & Placement) {
  // 有Placement标记
}

// 移除标记 - 使用位与运算
fiber.flags &= ~Placement;  // 移除Placement标记

// 合并多个标记
fiber.flags |= Placement | Update;  // 同时设置两个标记
```

7、为什么tag是十进制，而flag是二进制？（tag就像性别，flag就像职业）

- tag是确定的，flag是不确定的

- tag是唯一的，flag可以是多个

- tag只需要判断，而flag需要判断和运算

8、标记系统不只是为dom服务，还有别的优化也会用到标记系统，也就是标记系统会有很多标记，而在dom优化部分，需要了解哪些标记呢？

- Placement：安排位置
  
  - 创建：A->A,B
  
  - 移动位置：A,B->B,A

- Update：更新属性，A->A'

- ChildDeletion：子元素删除，将要删除的元素的标记打到父元素上，A,B->A
