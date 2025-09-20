function transform(input) {
	var sla5 = {
		business_percentage: "<5%",
		value: 0
	};
	var sla5to10 = {
		business_percentage: "5-10%",
		value: 0
	};
	var sla10 = {
		business_percentage: ">10%",
		value: 0
	};
	var typeQuery = "active=true^task.sys_class_name=incident";
	var slaGr5 = new GlideAggregate('task_sla');
	slaGr5.addEncodedQuery(typeQuery + "^business_percentage<=5");
	slaGr5.addAggregate("COUNT");
	slaGr5.query();
	if (slaGr5.next()) {
		sla5.value = slaGr5.getAggregate("COUNT");
	}

	var slaGr5to10 = new GlideAggregate('task_sla');
	slaGr5to10.addEncodedQuery(typeQuery + "^business_percentage>5^business_percentage<=10");
	slaGr5to10.addAggregate("COUNT");
	slaGr5to10.query();
	if (slaGr5to10.next()) {
		sla5to10.value = slaGr5to10.getAggregate("COUNT");
	}

	var slaGr10 = new GlideAggregate('task_sla');
	slaGr10.addEncodedQuery(typeQuery + "^business_percentage>10");
	slaGr10.addAggregate("COUNT");
	slaGr10.query();
	if (slaGr10.next()) {
		sla10.value = slaGr10.getAggregate("COUNT");
	}

	return JSON.stringify([{
		"data": [
			sla5, sla5to10, sla10
		],
		"metadata": {
			"eventData": {
				"table": "task_sla"
			},
			"dataSourceLabel": "SLA Breached",
			"groupBy": [{
				"series": [{
					"label": "Task SLA",
					"id": "value",
					"type": "value"
				}],
				"elements": [{
					"eventData": {
						"query": typeQuery + "^business_percentage="
					},
					"label": "(empty)",
					"id": ""
				},
				{
					"eventData": {
						"query": typeQuery + "^business_percentage<=5"
					},
					"label": "<5%",
					"id": "d625dccec0a8016700a222a0f7900d06"
				},
				{
					"eventData": {
						"query": typeQuery + "^business_percentage>5^business_percentage<=10"
					},
					"label": "5-10%",
					"id": "8a5055c9c61122780043563ef53438e3"
				},
				{
					"eventData": {
						"query": typeQuery + "^business_percentage>10"
					},
					"label": ">10%",
					"id": "8a4dde73c6112278017a6a4baf547aa7"
				}
				],
				"label": "Elapsed Percentage",
				"id": "business_percentage",
				"fieldType": "reference"
			}],
			"format": {
				"unitFormat": "{0}"
			},
			"aggregateBy": 4,
			"metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="
		}
	}]);
}
