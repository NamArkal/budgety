var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0)
			this.percentage = Math.round((this.value / totalIncome) * 100);
		else
			this.percentage = -1;
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(curr) {
			sum += curr.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {

		addItem: function(type, des, val) {
			var newItem, ID;

			if(data.allItems[type].length > 0)
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			else
				ID = 0;

			if(type === 'inc') 
				newItem = new Income(ID, des, val);
			else if(type === 'exp')
				newItem = new Expense(ID, des, val);

			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;

			if(data.totals.inc > 0)
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			else
				data.percentage = -1;
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}
	};

})();

var uiController = (function() {

	var domStrings = {
		inputType: '.add__type',
		inputDescrip: '.add__description',
		inputValue: '.add__value',
		inputAddBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
			var numSplit, int, dec;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');
			int = numSplit[0];

			if(int.length > 3)
				int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);

			dec = numSplit[1];

			;

			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
		};

	var nodeListForEach = function(list, callBack) {
			for(var i=0; i<list.length; i++)
				callBack(list[i], i);
		};

	return {

		getInput: function() {
			return{
				type: document.querySelector(domStrings.inputType).value,
				descrip: document.querySelector(domStrings.inputDescrip).value,
				value: parseInt(document.querySelector(domStrings.inputValue).value)
			};
		},

		getDOMStrings: function() {
			return domStrings;
		},

		addListItem: function(obj, type) {
			var html, newHTML, element;

			if(type === 'inc'){
				element = domStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			else if(type === 'exp'){
				element = domStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},

		deleteListItem: function(selectorId) {
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields = document.querySelectorAll(domStrings.inputDescrip + ', ' + domStrings.inputValue);
			var fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(currValue) {
				currValue.value = "";
			});

			fieldsArr[0].focus();
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(domStrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index){
				if (percentages[index] > 0)
					current.textContent = percentages[index] + '%';
				else
					current.textContent = '---';
			});
		},

		displayBudget: function(obj) {
			document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, (obj.budget >= 0 ? 'inc' : 'exp'));
			document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0)
				document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
			else
				document.querySelector(domStrings.percentageLabel).textContent = '---';
		},

		displayMonth: function() {
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth();
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll(domStrings.inputType + ', ' + domStrings.inputDescrip + ', ' + domStrings.inputValue);
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(domStrings.inputAddBtn).classList.toggle('red');
		}

	};

})();

var controller = (function(bdgtCtrl, uiCtrl) {

	var setUpEventListeners = function() {
		var dom = uiCtrl.getDOMStrings();
		document.querySelector(dom.inputAddBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
			if (event.keyCode === 13 || event.which === 13)
				ctrlAddItem();
		});

		document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
	};

	var updateBudget = function() {
		/*
		1. calculate budget
		2. return budget
		3. display updated budget to UI
		*/

		bdgtCtrl.calculateBudget();
		var budget = bdgtCtrl.getBudget();
		uiCtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		bdgtCtrl.calculatePercentages();
		var percentages = bdgtCtrl.getPercentages();
		uiCtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		/*
		1. get field input data
		2. add item to budget controller
		3. add item to UI
		4. clear the fields
		5. call updateBudget
		*/

		var input = uiCtrl.getInput();

		if(input.descrip !== "" && !isNaN(input.value) && input.value > 0){
			var newItem = bdgtCtrl.addItem(input.type, input.descrip, input.value);
			uiCtrl.addListItem(newItem, input.type);
			uiCtrl.clearFields();
			updateBudget();
			updatePercentages();
		}
		
	};

	var ctrlDeleteItem = function(event) {
		var itemId, splitId, type, id;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0]; 
			id = parseInt(splitId[1]);
			bdgtCtrl.deleteItem(type, id);
			uiCtrl.deleteListItem(itemId);
			updateBudget();
			updatePercentages();
		}
	};

	return {
		init: function() {
			uiCtrl.displayMonth();
			uiCtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setUpEventListeners();
		}
	};

})(budgetController, uiController);

controller.init();