## Data Broker Scripting
Data Brokers provide Server-side scripting capabilities for UI Builder Components.
### Transform Data Brokers
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
