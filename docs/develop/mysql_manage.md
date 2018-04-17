# Mysql(MariaDB) Manage Snippets

## Create User Database

login mysql client with root account

```
$ mysql -uroot -p
```

create user and database and grant privileges

```
mysql> CREATE DATABASE `name_of_database`;
mysql> use mysql;
mysql> select host, user, authentication_string from user;
mysql> CREATE USER 'name_of_user'@'localhost' IDENTIFIED BY 'password_for_user';
mysql> CREATE USER 'name_of_user'@'192.168.%' IDENTIFIED BY 'password_for_user';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'name_of_user'@'localhost';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'name_of_user'@'192.168.%';
mysql> FLUSH PRIVILEGES;
```

if your user's password didn't update then use this command

```
mysql> update user set authentication_string=password('password_for_user') where user='name_of_user';
```
