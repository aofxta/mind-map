jsMind
======

## Notice

This repo that convert original lib to typescript lib.

## Original

jsMind 是一个显示/编辑思维导图的纯 javascript 类库，其基于 html5 的 canvas 进行设计。jsMind 以 BSD 协议开源，在此基础上你可以在你的项目上任意使用。你可以在此浏览[适用于 jsMind 的 BSD 许可协议(中英文版本)][3]。

jsMind is a pure javascript library for mindmap, it base on html5 canvas. jsMind was released under BSD license, you can embed it in any project, if only you observe the license. You can read [the BSD license agreement for jsMind in English and Chinese version][3] here.

## Feature

* configurable node tree depth.

> we can add property depth of option parameter to control this mind map depth, it will throw exception when add node greater the depth.

```javascript
const option = {
  ...
  depth: 5
}

const mindMap = MindMapMain.show(option, mind);
```

By above example, we create a mind map that support 5 level depth.


* configurable node select type.

> we can add property hierarchy_rule of option parameter to control this mind map select type and node backgroud color and font color.

```javascript
const HIERARCHY_RULES = {
  ROOT: {
    name: 'XX汽车有限公司',
    backgroundColor: '#7EC6E1',
    getChildren: () => [
      HIERARCHY_RULES.SALES_MANAGER,
      HIERARCHY_RULES.SHOW_ROOM,
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SALES_MANAGER: {
    name: '销售经理',
    color: '#fff',
    backgroundColor: '#616161',
    getChildren: () => [
      HIERARCHY_RULES.SHOW_ROOM,
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SHOW_ROOM: {
    name: '展厅',
    color: '#fff',
    backgroundColor: '#989898',
    getChildren: () => [
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SALES_TEAM: {
    name: '销售小组',
    color: '#fff',
    backgroundColor: '#C6C6C6',
    getChildren: () => []
  }
};
```

By above example, we can configurate the mind map hierarchical relationship.

> name: display in node text
> color: node font color
> backgroundColor: node background color
> getChildren: get can select node type in selector



## Usage

In angular2,

```javascript

import { MindMapMain } from 'mind-map';

const HIERARCHY_RULES = {
  ROOT: {
    name: 'XX汽车有限公司',
    backgroundColor: '#7EC6E1',
    getChildren: () => [
      HIERARCHY_RULES.SALES_MANAGER,
      HIERARCHY_RULES.SHOW_ROOM,
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SALES_MANAGER: {
    name: '销售经理',
    color: '#fff',
    backgroundColor: '#616161',
    getChildren: () => [
      HIERARCHY_RULES.SHOW_ROOM,
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SHOW_ROOM: {
    name: '展厅',
    color: '#fff',
    backgroundColor: '#989898',
    getChildren: () => [
      HIERARCHY_RULES.SALES_TEAM
    ]
  },
  SALES_TEAM: {
    name: '销售小组',
    color: '#fff',
    backgroundColor: '#C6C6C6',
    getChildren: () => []
  }
};

const option = {
  container: 'jsmind_container',
  theme: 'normal',
  editable: true,
  depth: 4,
  hierarchy_rule: HIERARCHY_RULES
};

const mind = {
  "format": "node_tree",
    "data": {
      "id": 43,
      "topic": "xx车行",
      "selected_type": false,
      "background_color": "#7EC6E1",
      "children": [
        {
          "id": 80,
          "color": "#fff",
          "topic": "show room",
          "direction": "right",
          "selected_type": "销售经理",
          "background_color": "#616161",
          "children": []
        },
        {
          "id": 44,
          "color": "#fff",
          "topic": "销售经理",
          "direction": "right",
          "selected_type": "销售经理",
          "background_color": "#616161",
          "children": [
            {
              "id": 46,
              "color": "#fff",
              "topic": "展厅经理",
              "direction": "right",
              "selected_type": "展厅",
              "background_color": "#989898",
              "children": [
                {
                  "id": 49,
                  "color": "#fff",
                  "topic": "销售小组C",
                  "direction": "right",
                  "selected_type": "销售小组",
                  "background_color": "#C6C6C6",
                  "children": []
                },
                {
                  "id": 51,
                  "color": "#fff",
                  "topic": "AMG销售",
                  "direction": "right",
                  "selected_type": "销售小组",
                  "background_color": "#C6C6C6",
                  "children": []
                },
                {
                  "id": 47,
                  "color": "#fff",
                  "topic": "销售小组A",
                  "direction": "right",
                  "selected_type": "销售小组",
                  "background_color": "#C6C6C6",
                  "children": []
                },
                {
                  "id": 48,
                  "color": "#fff",
                  "topic": "销售小组B",
                  "direction": "right",
                  "selected_type": "销售小组",
                  "background_color": "#C6C6C6",
                  "children": []
                },
                {
                  "id": 50,
                  "color": "#fff",
                  "topic": "销售小组D",
                  "direction": "right",
                  "selected_type": "销售小组",
                  "background_color": "#C6C6C6",
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": 45,
          "color": "#fff",
          "topic": "Smart经理",
          "direction": "right",
          "selected_type": "销售经理",
          "background_color": "#616161",
          "children": []
        }
      ]
    }
};


@Component(
  ...
)
class MindMapComponent Implements OnInit {

  mindMap;

  constructor() {

  }

  ngOnInit() {
    this.mindMap = MindMapMain.show(option, mind);
  }

}

```
![example](./lib/mind-map.gif)


Links:

* App : <http://jsmind.sinaapp.com>
* Home : <http://hizzgdev.github.io/jsmind/developer.html>
* Demo :
  * <http://hizzgdev.github.io/jsmind/example/1_basic.html>
  * <http://hizzgdev.github.io/jsmind/example/2_features.html>
* Documents :
  * [简体中文][1]
  * [English(draft)][2]
* Wiki :
  * [邮件列表 Mailing List](../../wiki/MailingList)
  * [热点问题 Hot Topics](../../wiki/HotTopics)
* Donate :
  * [资助本项目的开发][4]


[1]:https://github.com/hizzgdev/jsmind/blob/master/docs/zh/index.md
[2]:https://github.com/hizzgdev/jsmind/blob/master/docs/en/index.md
[3]:LICENSE
[4]:http://hizzgdev.github.io/jsmind/donate.html

