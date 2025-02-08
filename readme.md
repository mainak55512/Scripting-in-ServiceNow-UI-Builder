# Scripting In UI Builder
This repository aims to document the scripting part of UI Builder as much as possible.
## Scripting in Data Visualizations
Most of the work in the UI Builder can be done through configuring various fields available for the data visualizations, but in some cases we need to rely on the good old scripting. Here I have documented some of them.
### Data Source Scripting
The Data Source script defines the source of the data for your visualization. Here are the available properties:
 1. **allowRealTime**: boolean
 2. **filterQuery**: string
 3. **id**: string
 4. **isDatabaseView**: boolean
 5. **sourceType**: string (available options: "table", "database view")
 6. **tableOrViewName**: string
 7. **label**: Object
	1. **message**: string
#### Example data source script:
```javascript
function evaluateProperty({api, helpers}){
	return [{
		"allowRealtime": true,
		"filterQuery": "active=true",
		"id": "YOUR_DATA_SOURCE_ID",
		"isDatabaseView": false,
		"sourceType": "table",
		"tableOrViewName": "your_table_name",
		"label": {
			"message": "test label"
		}
	}];
}
```
### Metric Scripting
The metric script defines how the data should be processed and displayed. Here are the available properties:
 1. **dataSource**: string (reference to data source ID)
 2. **id**: string (unique identifier for this metric)
 3. **aggregateFunction**:  string (e.g. AVG, SUM, COUNT etc.)
 4. **aggregateField**: string (not applicable for all type of data visualization)
 5. **numberFormat**: Object
	1. **customFormat**: boolean
6. **transforms**: Object
	1.  **metric**: string (visualization type e.g. donut, indicator etc.)
	2.  **transform**: Array of Object 
			1.  **name**: string
			2. **transform**: string
7. **axisId**: string
#### Example data source script:
```javascript
function evaluateProperty({api, helpers}){
	return [{
		"dataSource": "YOUR_DATA_SOURCE_ID",
		"id": "YOUR_METRIC_ID",
		"aggregateFunction": "AVG",
		"aggregateField": "table_column_name",
		"numberFormat": {
			"customFormat": false
		},
		"transforms": {
			"metric": "donut",
			"transform": [{
				"name": "label",
				"transform": "Reference"
			}]
		},
		"axisId": "primary"
	}];
}
```
### Group By Scripting
The group by script defines how the data should be grouped on the visualization chart. Here are the available properties:

1.  **groupBy**: Array of Object
    1.  **dataSource**: string (reference to data source ID)   
    2.  **groupByField**: string        
2.  **maxNumberOfGroups**: string
#### Example Group By script:
```javascript
function evaluateProperty({ api, helpers }) {
  return [{
    "groupBy": [
      {
        "dataSource": "YOUR_DATA_SOURCE_ID",
        "groupByField": "group_by_field"
      }
    ],
    "maxNumberOfGroups": "ALL"
  }];
}
```
### Code Examples
Let's say, we want to create a Semi-donut type data visualization element on ‘incident’ table where the condition is:

*"Active is true AND caller is Abel Tutor OR caller is Abraham Lincoln OR caller is David Miller OR caller is System Administrator"* 

And we will group it by Caller.

**Data Source Script**
```javascript
function evaluateProperty({ api, helpers }) {
	return [{
		"allowRealTime": true,
		"filterQuery": "active=true^caller_id=62826bf03710200044e0bfc8bcbe5df1^ORcaller_id=a8f98bb0eb32010045e1a5115206fe3a^ORcaller_id=77ad8176731313005754660c4cf6a7de^ORcaller_id=6816f79cc0a8016401c5a33be04be441",
		"id": "DATA_SOURCE_ID",
		"isDatabaseView": false,
		"sourceType": "table",
		"tableOrViewName": "incident"
	}];
}
```
**Metric Script**
```javascript
function evaluateProperty({ api, helpers }) {
  return [{
    "dataSource": "DATA_SOURCE_ID",
    "id": "groupby_count",
    "aggregateFunction": "COUNT",
    "numberFormat": {
      "customFormat": false
    },
    "transforms": {
      "metric": "donut",
      "transform": [{
        "name": "label",
        "transform": "Reference"
      },{
        "name": "value",
        "transform": "Reference"
      }],
    },
    "axisId": "primary"
  }];
}
```
**Group By Script**
```javascript
function evaluateProperty({ api, helpers }) {
  return [{
    "groupBy": [
      {
        "dataSource": "DATA_SOURCE_ID",
        "groupByField": "caller_id"
      }
    ],
    "maxNumberOfGroups": "ALL"
  }];
}
```
## Transform Data Brokers
Transform data broker in UI Builder is a  server-side script that may take input, execute server-side JavaScript code and provide an output for use in UI Builder components.
We can use server-side APIs of ServiceNow in transform data brokers like `GlideRecord`, `GlideAggregate` etc.

Here are the available input Properties & Output Schema:
1. **name**: string
2. **label**: string,
3. **description**: string,
4. **readOnly**: boolean,
5. **fieldType**: string,
6. **mandatory**: boolean,
7. **defaultValue**: any
### Example Transform Data Broker
#### Properties:
```json
[
  {
    "name": "group_infos",
    "label": "Comma Separated Group Sys Ids",
    "description": "Get Group Members for Specific Group(s)",
    "readOnly": false,
    "fieldType": "string",
    "mandatory": true,
    "defaultValue": ""
  }
]
```
#### Script:
```javascript
function transform(input) {
	// 'input' is the property object defined in the 'Properties' section
	/* 
	* in the following line, I have split the input string
	* filtered out the empty elements &
	* removed all the spaces from start and end for all the elements
	*/
	let grpList = input.group_infos.split(",").filter(e => e).map(e => e.trim());
	
	let userList = [];
	
	grpList.forEach(e => {
		const grpGR = new GlideRecord("sys_user_grmember");
		grpGR.addEncodedQuery("group=" + e.toString() + "^user.active=true");
		grpGR.query();
		while (grpGR.next()) {
			userList.push(grpGR.user.sys_id.toString());
		}
	});

	// returning the comma separated user sys_ids
	return userList.join(",");
}
```
#### Output Schema:
```json
[
  {
    "name": "user_infos",
    "label": "Comma Separated User Sys Ids",
    "description": "Get Group Members for Specific Group(s)",
    "readOnly": false,
    "fieldType": "string",
    "defaultValue": ""
  }
]
```
#### Usage:
You can add the transform data broker in your page in UI Builder with comma separated group sys_ids as input and can bind the output to the elements. To get the output in a client script use the `api` object like this:
`api.data.<your_databroker_id>.user_infos`(as we have defined the output schema name as 'user_infos').
#### *! NOTE !*: 
*You have to define `ux_data_broker` type `execute` ACL in order to run the transform data broker (use the `sys_id` of the data broker as the `name` of the ACL).*
