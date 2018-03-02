---
title: 基于Hexo的GitHub Pages多终端协同编辑方案
date: 2018-03-01 14:12:12
tags:
---

- 使用Hexo并部署于GitHub Pages上的解决方案网上很多，不展开介绍了。
本文主要介绍如何在多个终端下同步Hexo编写的Blog文件，使得不管在哪台电脑上都能完成blog的书写工作，主要涉及 `git && github 命令`

步骤如下：<br>
 1. 申请GitHub账号，执行 new repository 操作<br>
 2. 仓库名必须为 shadowkimi520.github.io 等形式<br> 
 3. 本地使用Hexo完成blog的书写<br>
 4. 打开blog文件夹下的_config.xml配置文件，修改deploy下的repo为对应的GitHub pages仓库，比如：`git@github.com:shadowkimi520/shadowkimi520.github.io.git`；分支必须为 [master](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/) <br>
 5. 执行 hexo deploy 将 blog 部署到 github pages

 第一阶段完成，此时github上的仓库拥有master分支，并且本地blog项目目录下的.deploy_git目录中的内容在每次执行hexo deploy时候都会被推送到该分支上；第二阶段需要将blog项目下的源文件提交到该仓库的另外一个分支上，用于多终端同步。步骤二如下：<br>
 1. 在Blog项目主目录下执行 git init, 将其初始化为一个 git 仓库；执行 git add themes/next/ 先将主题仓库文件纳入版本控制系统，再执行 git add . 纳入其他文件（这些文件不是git子仓库），最后执行 git commit （如果先执行 git add . ， 由于主题文件夹也是一个 git 仓库，这样操作的话主题文件夹下的文件不会被纳入版本控制系统）<br>
 2. 执行 `git remote add origin git@github.com:shadowkimi520/shadowkimi520.github.io.git`<br>
 3. 本地git仓库创建hexo分支，用于向GitHub提交Blog源文件 `git checkout hexo `<br>
 4. 执行 git push origin hexo命令将仓库推送到github上，由于github仓库不存在hexo分支，该命令会创建新的hexo分支


 `git clone -b hexo git@github.com:shadowkimi520/shadowkimi520.github.io.git` <br>
 从远程仓库拷贝指定的hexo分支到本地<br>

 git rm -r --cached path/ <br> [参考](https://www.zhihu.com/question/24467417)
 1. 如果.git仓库中存在.git仓库，外层git仓库git add . 默认只会将内层 git 仓库所在文件夹添加进版本控制系统，文件夹里面的内容不会纳入外层的版本控制系统；除非直接先使用 git add path/ 来先添加内层仓库文件夹（必须包含 / ，否则仅添加文件夹文件）<br>
 2. 无论内层仓库是在外层仓库init之前引入的还是之后引入的，使用 git add . 不会将内层仓库纳入版本控制系统，仅将内层文件夹纳入；此时如果删除内层仓库的 .git 文件，依旧不能添加内层仓库文件夹内的文件，需要使用上述命令清空内层仓库在外层仓库中的缓存，并再次 git add 对应文件夹后才能纳入版本控制系统<br>

 git push --force|-f -u origin master:hexo <br>
 1. 在多终端提交blog源文件到github的时候如果不想拉取其他机器提交的内容，使用 --force 参数直接覆盖 github 上的内容 [See the 'Note about fast-forwards' in 'git push --help' for details] <br>
 2. -u 参数用于关联两个分支

 git push <远程库名> <本地分支名>:<远程分支名>  <br>
 git pull <远程库名> <远程分支名>:<本地分支名>  <br>
 git pull origin next 取回远程的next与当前分支合并 <br>


git reflog master
git reset --hard master@{1} // 回滚的正确姿势


存在问题：<br>
1. _posts文件夹下 Hexo 生成的存放图片的空文件夹不会同步到github:master <br>
2. Hexo new post name 会生成对应的空文件夹用于解决图片在主页和内容页上的路径不一致问题（Hexo添加了新的语法，而非采用MarkDown的链接语法），该空文件夹无法被 git 管理<br>
    解决方法：1. 在空文件夹下手动添加 (.gitkeep 文件)[http://blog.csdn.net/fengchao2016/article/details/52769151] 2. 修改 Hexo 的对应命令，默认让其生成 .gitkeep 文件 