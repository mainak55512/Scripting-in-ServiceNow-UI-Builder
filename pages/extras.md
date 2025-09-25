## Extras
<a id="custom-filter-scripting"></a>
### Creating custom filters with drop-down
UI builder has filters which gives you ability to filter records on-the-fly. Filter options are generally the records from a particular table. what if we need custom options which may point to multiple records at a time. lets say, we need three options -> 'Tier A Groups', 'Tier B Groups' & 'Tier C Groups', where each option contains multiple groups i.e. if we select 'Tier A Groups' the filter should be applied for "Service desk", "Hardware" & "Software" groups. We can achieve this with dropdown element and some scripting.
#### Creating Drop-down:
Add the dropdown element to the page and configure the choices. The choices have two fields -> 'id' & 'label'. We are creating the following options: 
1. id -> l1; label -> List option 1
2. id -> l2; label -> List option 2
3. id -> l3; label -> List option 3

#### Creating Client state parameters
We need some client state parameters to hold the values
1. parFilters (name should be exactly same): to broadcast the filter conditions to the data visualizations -> type: [JSON] complex array.
2. selectedGrpOption: to store the dropdown selection -> type: string.
3. group_1_ids: to store sysIds of Tier A Groups -> type: [JSON] simple array.
4. group_2_ids: to store sysIds of Tier B Groups -> type: [JSON] simple array.
5. group_3_ids: to store sysIds of Tier C Groups -> type: [JSON] simple array.

#### Creating Client Script
Create a client script as follows. Add 'mergePARFilters' client script include to it.
After creating the client script, create an event handler on the dropdown element for 'item selected' option and add this client script.
```javascript
function applyFilter({
    api,
    event,
    imports
}) {
    api.setState('selectedGrpOption', event.payload.item.id);
    api.setState('parFilters', ({
        currentValue
    }) => {
        let groupsIDs = [];
        switch (event.payload.item.id) {
            case 'l1':
                {
                    groupsIDs = api.state.group_1_ids;
                    break;
                }
            case 'l2':
                {
                    groupsIDs = api.state.group_2_ids;
                    break;
                }
            case 'l3':
                {
                    groupsIDs = api.state.group_3_ids;
                    break;
                }
        }
        let appliedFilters = [{
            "order": 9000,
            "filterId": "1gppagcin4rvu530m8g8",
            "type": "reference",
            "label": "Grouped Group Filter",
            "source": {
                "type": "table",
                "payload": {
                    "table": "sys_user_group"
                }
            },
            "values": groupsIDs,
            "include_unmatched_or_empty": false,
            "apply_to": ["incident.assignment_group"]
        }];
        const parFilters = imports['global.mergePARFilters']()(currentValue, appliedFilters);
        return parFilters;
    });
}
```

#### Creating Data Visualization
We will create a Single score data visualization on incident table with Data source query 'Active = True'.

#### Filtering List element
List - Simple do not follow filters, so we have to manually configure it.
Create a Simple list element and add incident data source.
Use script option for the 'Filter' under 'default display section' with the following code:
```javascript
function evaluateProperty({api, helpers}) {
  let encQuery = 'active=true'; // this is the default query
  if (api.state.selectedGrpOption) {
    switch (api.state.selectedGrpOption) {
      case 'l1':{
        encQuery += "^assignment_group=" + api.state.group_1_ids.join("^ORassignment_group=");
        break;
      }
      case 'l2':{
        encQuery += "^assignment_group=" + api.state.group_2_ids.join("^ORassignment_group=");
        break;
      }
      case 'l3':{
        encQuery += "^assignment_group=" + api.state.group_3_ids.join("^ORassignment_group=");
        break;
      }
    }
  }
    return encQuery;
}
```

<a id="manual-datasource-with-custom-groupby-scripting"></a>
### Populate Data Source of visualization with manual data and custom groupby
In UI Builder, you can create a data visualization with grouping by a particular field. But in some cases you need to fetch data from a table and segregate the data based on specific value range of the group by field. For example, you want to see an Incident SLA report where the data visualization should group the records in three categories: SLA elapsed 0-30%, SLA elapsed 30-70% and SLA elapsed above 70%. In this case we can create a 'Transform' data broker to populate data source of the visualization with manual data and custom group by.

#### Create Transform data broker
In this case we are considering a donut type data visualization. We shall create transform data broker to query 'task_sla' table with specific conditions and return an object in the format required by the data source to populate data manually with custom grouping.

```javascript
// name: fetch_elapse_details
function transform(input) {
	var sla30 = {
		business_percentage: "<30%",
		value: 0
	};
	var sla30to70 = {
		business_percentage: "30-70%",
		value: 0
	};
	var sla70 = {
		business_percentage: ">70%",
		value: 0
	};

	var typeQuery = "active=true^task.sys_class_name=incident";

	var slaGr30 = new GlideAggregate('task_sla');
	slaGr30.addEncodedQuery(typeQuery + "^business_percentage<=30");
	slaGr30.addAggregate("COUNT");
	slaGr30.query();
	if (slaGr30.next()) {
		sla30.value = slaGr30.getAggregate("COUNT");
	}

	var slaGr30to70 = new GlideAggregate('task_sla');
	slaGr30to70.addEncodedQuery(typeQuery + "^business_percentage>30^business_percentage<=70");
	slaGr30to70.addAggregate("COUNT");
	slaGr30to70.query();
	if (slaGr30to70.next()) {
		sla30to70.value = slaGr30to70.getAggregate("COUNT");
	}

	var slaGr70 = new GlideAggregate('task_sla');
	slaGr70.addEncodedQuery(typeQuery + "^business_percentage>70");
	slaGr70.addAggregate("COUNT");
	slaGr70.query();
	if (slaGr70.next()) {
		sla70.value = slaGr70.getAggregate("COUNT");
	}

	return JSON.stringify([{
		"data": [
			sla30, sla30to70, sla70
		],
		"metadata": {
			"eventData": {
				"table": "task_sla"
			},
			"dataSourceLabel": "SLA Elapsed",
			"groupBy": [{
				"series": [{
					"label": "Task SLA",
					"id": "value",
					"type": "value"
				}],
				"elements": [{
					"eventData": {
						"query": typeQuery + "^business_percentage<=30"
					},
					"label": "<=30%",
					"id": "d625dccec0a8016700a222a0f7900d06"
				},
				{
					"eventData": {
						"query": typeQuery + "^business_percentage>30^business_percentage<=70"
					},
					"label": "30-70%",
					"id": "8a5055c9c61122780043563ef53438e3"
				},
				{
					"eventData": {
						"query": typeQuery + "^business_percentage>70"
					},
					"label": ">70%",
					"id": "8a4dde73c6112278017a6a4baf547aa7"
				}
				],
				"label": "Elapsed Percentage",
				"id": "business_percentage", // this should be the field name the on which the groupby will work.
				"fieldType": "percent_complete"
			}],
			"format": {
				"unitFormat": "{0}"
			},
			"aggregateBy": 4,
			"metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="
		}
	}]);
}
```

#### Create Client state parameter
Create a Client state parameter 'elapsedDetails' of type 'json', bind this client state parameter with the data source(check the 'set data manually' option and then add to the data source through the stack icon ⛁ )

#### Create Client script to populate client state parameter
Create the following client script to populate 'elapsedDetails' parameter and attach it to the data broker for the event 'data fetch succeeded'

```javascript
function evaluateProperty({api, helpers}) {
    api.setState('elapsedDetails', JSON.parse(api.data.fetch_elapse_details.output));
}
```

#### Finishing up
If we have done all the steps correctly we are good to go!
you can select option from the dropdown and that will filter the data visualization and list element accordingly.
