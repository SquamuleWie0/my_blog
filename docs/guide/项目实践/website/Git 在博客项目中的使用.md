# 使用 Git 管理 Hexo 博客

**1.遇到 `git push` 报错怎么办**
**现象**：
```bash
error: failed to push some refs to 'git@github.com:username/repo.git'  
hint: Updates were rejected because the remote contains work that you do  
hint: not have locally.
```
**解决方法**：
保存本地修改  
```bash
git add .  
git commit -m "Save local changes"  
  
```
**拉取远程更新并** rebase  
```bash
git pull origin main --rebase  
```
  
**推送到远程仓库**  
```bash
git push origin main
```

**2.上传静态文件到服务器（结合 Git）**
生成最新静态文件 
```bash
hexo generate
```

可选：将 public 添加到版本管理
```bash
git add public  
git commit -m "Update static files"  
git push origin main
```

上传到服务器并覆盖 Nginx

```bash
scp -i ~/.ssh/id_rsa -r ./public/. root@IP:/tmp/my_hexo_public  
docker cp /tmp/my_hexo_public/. myiginx:/usr/share/nginx/html  
docker restart myiginx
```
**说明**：  
Git 要求本地分支包含远程最新 commit，先拉取再 push 可以避免冲突。

> 这个流程保证本地、远程仓库和服务器内容同步，减少报错与覆盖风险。