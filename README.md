## gitrep v0.0.1
Менеджер проектов непосредственно из репозиториев github.
Загружает репозитории с github, распаковывает их на локальный диск и кеширует.
Можно использовать, если нужно использовать какой либо код, непосредственно с github.

## установка
```
$ npm i fmihel/gitrep -D
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
Для конфигурации используется файл `gitrep.json` со след структурой
```json
{
    "cache": "PATH", 
    "dev": {
        "repo1": "BRANCH OR TAG",
        "repo2": "BRANCH OR TAG",
        ...
    },
    "prod": {
        "repo1": "BRANCH OR TAG",
        "repo2": "BRANCH OR TAG",
        ...
    },
    "exclude": [
        "RULES1",
        "RULES2",
        ...,
        {
            "repo1":[
                "RULES3 FOR REPO1",
                ...
            ]
        }
    ],
    "iclude": [
        "RULES1",
        "RULES2",
        ...,
        {
            "repo1":[
                "RULES3 FOR REPO1",
                ...
            ]
        }
    ],
}
```

Ex:
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
    ]
}
```

