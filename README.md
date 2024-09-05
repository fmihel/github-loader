## gitrep v0.0.5
Загрузка проектов/кода непосредственно из репозиториев github.
Загружает репозитории с github, распаковывает их на локальный диск, кеширует.
Можно использовать, если нужно использовать какой либо код, непосредственно с github.


## установка
```
$ npm i fmihel-gitrep -D
```

## работа с репозиториями
Инициализация используя информацию из `gitrep.json`, загружает репозитории в папку `./gitrep`

```bash
$ node node_modules/fmihel-gitrep install
$ node node_modules/fmihel-gitrep i
```
<hr>

Добавление репозитория

```bash
$ node node_modules/fmihel-gitrep install <REPO> <REPO> ...
$ node node_modules/fmihel-gitrep i <REPO> <REPO> ...
```
Ex:
```bash
$ node node_modules/fmihel-gitrep i jquery/jquery
```
<hr>

Выгрузка в другую папку (к примеру ./dest)
```bash
$ node node_modules/fmihel-gitrep install dest=<PATH>
$ node node_modules/fmihel-gitrep i dest=<PATH>
```
Ex:
```bash
$ node node_modules/fmihel-gitrep install dest=./dest
$ node node_modules/fmihel-gitrep i dest=./dest
```
<hr>

Обновление кэша и репозиториев
```bash
$ gitrep update  
```
<hr>
Обновление отдельных репозиториев 
```bash
$ gitrep update <REPO> <REPO> .... 
```
Ex:
```bash
$ node node_modules/fmihel-gitrep update 
```


Удаление репозитория из папки и конфига

```bash
$ gitrep uninstall <REPO>  
```


## файл конфигурация gitrep.json
Для конфигурации используется файл `gitrep.json`:

Список параметров файла конфигурации
|параметр|по умолчанию|описание|
|---|---|---|
|cache|"./gitrep"|папка куда будут загружаться пакеты|
|prod|{}|список основных репозиториев github используемых в проекте|
|dev|{}|список репозиториев github используемых додолнительно, при установке в папку отличную от cache, эти пакет устанвавливаться не будут|
|include|[]|список файловых шаблонов, которые будут оставлены в используемом репозитории|
|exclude|[]|список файловых шаблонов, которые будут удалены в используемом репозитории, имеет приоритет над include|
|plugins|{}|список плагинов,включенных в обработку. На данный момент есть только один PhpAutoloadPsr4 - создает файл autoload.php для автозагрузки классов php, использует информацию из composer.json|


Пример:
```json
{
    "dev": {
        "fmihel/redux-wrapper": "master",
        "fmihel/ajax-plugin-session": "tags/v1.0.5",
        "fmihel/php-cache": "main",
        "jquery/jquery": "main"
    },
    "prod": {
        "fmihel/console-log": "master",
        "fmihel/php-config": "main",
        "fmihel/wu": "master"
    },
    "exclude": [
        "*.bat",
        "*.babelrc",
        "*.npmignore",
        "*.eslintignore",
        "composer.*",
        "*.js",
        "*.md",
        {
            "fmihel/wu":[
                "*.json",        
                "*.gitignore",
                "*.pas",
                "*.dfm",
                "*.mpb"
            ]
        }
    ],
    "plugins":{
        "PhpAutoloadPsr4": {}
    }
}
```

