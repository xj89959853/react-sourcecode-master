# diff之beginWork中单一子节点

### 思考部分：

1、判断dom相同的依据是什么？

- key：核心依据，dom相同，key一定相同，但key相同不一定dom相同。类似于手机号

- type：标签名，辅助依据。同标签名元素有很多，所以不能当作主要依据，但是可以辅助判断当key相同时，是否是相同元素。类似于名字。

2、单一子节点的情况是指current树上的单一子节点还是workInProgress上的单一子节点？workInProgress。workLoop针对workInProgress树操作，所以进到子节点协调器中，一定是workInProgress树上的节点。

3、单一子节点有几种情况呢？就是workInProgress上是一个节点，但current上的节点有几种情况呢？

- null->1:不用判断，只能是创建

- n->1:
  
  - 1->1:需要判断，判断后决定是否复用
  
  - m->1:需要判断，从m中找1的存在，找到复用，没找到创建，同时对于没匹配上的节点要标记删除。

4、删除的标记和删除的节点是同一棵树的么？不是，标记删除的是workInProgress，而要删除的子节点是current上的。
