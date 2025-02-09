## Scripting in Data Visualizations
Most of the work in the UI Builder can be done through configuring various fields available for the data visualizations, but in some cases we need to rely on the good old scripting. Here I have documented some of them.
<a id="data_source_scripting"></a>
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
#### Example Data Source script:
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
<a id="metric_scripting"></a>
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
#### Example Metric script:
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
<a id="group_by_scripting"></a>
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
<a id="data_metric_example"></a>
### Code Example for Data Source, Metric & Group By Script
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
<a id="dashboard_redirect"></a>
### Scripting in Advanced Dashboards - Redirect
In Dashboards, there is an event action available called `Advanced Dashboards - Redirect`. It is used to redirect the user to a destination page of the workspace when use user clicks the data visualization.

Here are the available properties:
1. **context**: Object
2. **route**: string (destination page id)
3. **fields**: Object (these are the mandatory url parameters for the destination page)
4. **params**: Object (these are the optional url parameters for the destination page)
5. **title**: string
6. **external**: string (external url for redirect)

<a id="dashboard_redirect_code"></a>
### Code Example for Advanced Dashboards - Redirect
We have created one `List - Simple` type element where we added one event `Reference Link Clicked` and `Advanced Dashboards - Redirect` event handler.
Other than list type element, the data is available through `event.payload.params`, so for example if we are using `donut` visualization and we want to get the `table`, we will use ``even.payload.params.table``.
```javascript
function evaluateEvent({ api, event }) {
	return {
		context: null,
		route: "record",
		fields: {
			"table": event.payload.table,
			"sysId": event.payload.record_id
		},
		params: null,
		title: "User Details",
		external: null
	};
}
```

