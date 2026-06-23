# 个人记账系统 — 数据库导入与配置说明

本说明聚焦于如何在本项目中导入数据库并配置后端与前端以使应用正常运行。默认后端路径为 [bookkeeping-api/db.php](bookkeeping-api/db.php)，前端代理已在 `vite.config.js` 中配置为指向 `http://localhost/bookkeeping-api`。

**前提**

- 已安装并启动 XAMPP（或等效的 Apache + MySQL 环境）。
- 已将后端代码放在 XAMPP 的 `htdocs` 下，路径示例：`htdocs/bookkeeping-api`

## 1. 创建并导入数据库（推荐使用 phpMyAdmin）

1. 使用 phpMyAdmin 导入：
   - 打开 http://localhost/phpmyadmin
   - 点击 “新建”，输入数据库名 `bookkeeping`，字符集选择 `utf8mb4`，排序规则选择 `utf8mb4_general_ci`，创建。
   - 进入新建的 `bookkeeping` 数据库，选择“导入”，将下面的 SQL 内容保存为 `bookkeeping.sql` 后上传导入。

2. 或使用 MySQL 命令行导入：

```bash
# 在命令行中执行（Windows 的 MySQL 客户端示例）
mysql -u root -p < bookkeeping.sql
```

3. SQL 建表脚本（保存为 `bookkeeping.sql` 并导入）：

```sql
CREATE DATABASE IF NOT EXISTS `bookkeeping` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bookkeeping`;

CREATE TABLE `user` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(100) NOT NULL UNIQUE,
	`password` VARCHAR(255) NOT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `record` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`user_id` INT NOT NULL,
	`type` VARCHAR(20) NOT NULL,
	`amount` DECIMAL(10,2) NOT NULL,
	`category` VARCHAR(100) DEFAULT NULL,
	`remark` TEXT DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	INDEX (`user_id`),
	CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 可选：插入示例用户
INSERT INTO `user` (`username`, `password`) VALUES ('test', 'testpassword');

```

## 2. 配置后端数据库连接

后端数据库连接文件为 [bookkeeping-api/db.php](bookkeeping-api/db.php)。该文件默认使用：

- host: `localhost`
- user: `root`
- password: ``（空）
- database: `bookkeeping`

如果你的 MySQL 用户名或密码不同，请编辑 [bookkeeping-api/db.php](bookkeeping-api/db.php) 中的连接信息，例如：

```php
$conn = new mysqli("localhost", "your_db_user", "your_password", "bookkeeping");
```

保存后重启 Apache（或确保 PHP/Apache 自动重新加载）。

## 3. 前端与后端的联通（开发环境）

本项目的前端 axios 实例使用相对路径 `/api`：在 `bookkeeping-vue/src/api/records.js` 与 `bookkeeping-vue/src/api/users.js` 中，`baseURL` 配置为 `/api`。

开发时，`vite.config.js` 已配置代理，将 `/api` 转发到 `http://localhost/bookkeeping-api`：

- 如需修改后端地址，请编辑 [vite.config.js](vite.config.js) 中的 `server.proxy['/api'].target`。

生产部署时，请将 axios 的 `baseURL` 指向真实后端地址（例如 `https://example.com/bookkeeping-api`），或在构建时配置 Nginx/Apache 的反向代理。

示例：在生产环境将 `src/api/records.js` 中的 `baseURL` 改为：

```js
const api = axios.create({
  baseURL: 'https://your-domain.com/bookkeeping-api',
  headers: { 'Content-Type': 'application/json' },
})
```

## 4. 常见检查项与排错

- 如果前端请求返回 404 或 500：确认 `bookkeeping-api` 文件夹已放在 `htdocs` 下，并能通过浏览器访问，例如 `http://localhost/bookkeeping-api/records.php`。
- 若出现数据库连接失败：检查 [bookkeeping-api/db.php](bookkeeping-api/db.php) 中的主机、用户名、密码和数据库名是否正确，确认 MySQL 服务已启动。
- 若遇到跨域问题（CORS）：在后端 PHP 文件开头加入允许跨域的 header，例如：

```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```
