
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

#### Finishing up
If we have done all the steps correctly we are good to go!
you can select option from the dropdown and that will filter the data visualization and list element accordingly.
