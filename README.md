The project is under development.

Варианты использования
<br><br>
Используя информацию из `gitrep.json` загружает репозитории в папку
`gitrep`

```bash
$ node node_modules/fmihel-gitrep install
$ node node_modules/fmihel-gitrep gitrep i
```
Выгрузка в другую папку (к примеру ./dest)
```bash
$ node node_modules/fmihel-gitrep install dest=./dest
$ node node_modules/fmihel-gitrep i dest=./dest
```

Добавление репозитория

```bash
$ node node_modules/fmihel-gitrep install <REPO> <REPO> ...
$ node node_modules/fmihel-gitrep i <REPO> <REPO> ...
```

Обновление кэша и репозиториев

```bash
$ gitrep update  
```
Обновление отдельных репозиториев 

```bash
$ gitrep update <REPO> <REPO> .... 
```


Удаление репозитория из папки и конфига

```bash
$ gitrep uninstall <REPO>  
```
