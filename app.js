/*********************************
*     BUDGET CONTROLLER IIFE     *
*********************************/

var budgetController = (function() {
    
    // Create function constructors for expence and income objects :
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
   };
    
    // Add method to Expense prototype for calculating the percentage :
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value * 100 / totalIncome);
        } else {
            this.percentage = -1;
        }
    };
    
    // Add method to Expense prototype for returning the percentages :
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
   
   var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
   };
    
    // Function to calculate the total income or expenses :
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    // Create object to store data from input and calculated data :
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
        percentage: -1  // something not existing
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // [1, 2, 3, 4, 5], next ID should be 6
            // [1, 2, 4, 6, 8], next ID should be 9
            // ID = last ID + 1
            
            // Create new ID :
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type :
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push new item into data structure :
            data.allItems[type].push(newItem);
            
            // Return the new item :
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // If for example the passed in id = 6, and we have left elements with these ids [1 2 4 6 8], the the index of id=6 would be 3.
            // Loop throught currently available ids and return array of them (map is like foreach, but return new array) :
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            // Get the index of id=6 in new array :
            index = ids.indexOf(id);  // index = 3
            
            // Remove the item with index if it exists :
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        changeItem: function(type, id, newDescription, newValue) {
            var desc = data.allItems[type][id].description = newDescription;
            var value = data.allItems[type][id].value = newValue;
        },
        
        calculateBudget: function() {
            // 1. Calculate total income and expenses :
            calculateTotal('exp');
            calculateTotal('inc');
            
            // 2. Calculate the budget: income - expenses :
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate the percentage of income that we spent :
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp * 100 / data.totals.inc);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            
            // Loop throught each expenses elements to calc the percentages :
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentage: function() {
            
            // Loop throught each expenses elements and return percentages in new array :
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();


/*********************************
*       UI CONTROLLER IIFE       *
*********************************/

var UIController = (function() {
    
    // Create object to store all the class names from the DOM :
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        deleteInputString: 'item__delete--btn delete',
        editInputString: 'item__delete--btn edit',
        saveInputString: 'item__delete--btn save',
        itemDescriptionString: 'item__description',
        itemValueString: 'item__value',
        deleteBtnString: 'item__delete--btn',
        editButton: '.item__delete--btn.edit',
        saveButton: '.item__delete--btn.save',
        itemDescription: '.item__description',
        itemValue: '.item__value',
        editModeString: 'edit-mode',
        editDescriptionString: 'edit-description',
        editValueString: 'edit-value',
        iconSave: '<ion-icon name="save-outline"></ion-icon>',
        iconEdit: '<ion-icon name="create-outline"></ion-icon>'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        // 1. Exactly 2 decimal points :
        num = Math.abs(num);  // returns a module of number |-24350| = 24350
        num = num.toFixed(2); // returns a string '24350.00'
        

        // 2. comma separating the thousands :
        numSplit = num.split('.'); // returns ['24350', '00']
        int = Number(numSplit[0])  // 24350
        int = int.toLocaleString();  // 24,350
//        if (int.length > 3) {
//            int = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, int.length);  // '24,350'
//        }

        dec = numSplit[1]  // '00'

        // 3. + or - before the number
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    // Our custom forEach function :
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeholder text :
            if (type === 'inc') {
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn edit"><ion-icon name="create-outline"></ion-icon></button><button class="item__delete--btn delete"><ion-icon name="trash-outline"></ion-icon></div></div>';
                
                element = DOMstrings.incomeContainer;
            } else if (type === 'exp') {
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn edit"><ion-icon name="create-outline"></ion-icon></button><button class="item__delete--btn delete"><ion-icon name="trash-outline"></ion-icon></button></div></div></div>';
                
                element = DOMstrings.expensesContainer;
            }
            
            // Replace the placeholder text with actual data :
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM :
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        editListItem: function(selectorId) {    
            var idArr, type, editBtn, saveBtn, descDiv, valueDiv, descInput, value, valueArr, valueNum, valueInput;
            
            idArr = selectorId.split('-');  // ['inc', '0']
            type = idArr[0]; // 'inc'
            
            // Replace 'edit' button with 'save' button :
            editBtn = document.querySelector('#' + selectorId + ' ' + DOMstrings.editButton);
            editBtn.parentElement.classList.add(DOMstrings.editModeString);
            saveBtn = document.createElement('button');
            saveBtn.classList.add(DOMstrings.deleteBtnString, 'save');
            saveBtn.innerHTML = DOMstrings.iconSave;
            editBtn.parentNode.replaceChild(saveBtn, editBtn);
            
            if (type === 'exp') {
                document.querySelector('#' + selectorId + ' ' + DOMstrings.expensesPercLabel).classList.add('display-none');
            }
            
            // Save the current <div> element with description :
            descDiv = document.querySelector('#' + selectorId + ' ' + DOMstrings.itemDescription);
            
            // Save the current <div> element with value :
            valueDiv = document.querySelector('#' + selectorId + ' ' + DOMstrings.itemValue);
            
            // Create new <input> element with current description :
            descInput = document.createElement('input');
            descInput.classList.add(DOMstrings.editDescriptionString);
            descInput.setAttribute('type', 'text');
            descInput.setAttribute('value', descDiv.textContent);
            
            // Create new <input> element with current number value :
            valueInput = document.createElement('input');
            valueInput.classList.add(DOMstrings.editValueString);
            valueInput.setAttribute('type', 'number');
            
            value = valueDiv.textContent;  // '+ 5,000.45'
            valueArr = value.split(' ');  // ['+', '5,000.45']
            valueNum = Number(valueArr[1].replace(/,/g, ''));  // 5000.45
            valueInput.setAttribute('value', valueNum);
            
            // Replace the current <div> elements with newly created <input> elements :
            descDiv.parentNode.replaceChild(descInput, descDiv);
            valueDiv.parentNode.replaceChild(valueInput, valueDiv);
        },
        
        getEditedListItem: function(selectorId) {
            var idArr, type, id, descInput, valueInput, descOutput, valueOutput, descDiv, valueDiv, saveBtn, editBtn, formatedValue;
            
            idArr = selectorId.split('-');  // ['inc', '0']
            type = idArr[0]; // 'inc'
            id = Number(idArr[1]);  // 0
            
            descInput = document.querySelector('#' + selectorId + ' .' + DOMstrings.editDescriptionString);
            valueInput = document.querySelector('#' + selectorId + ' .' + DOMstrings.editValueString);
            
            // Save new description and value :
            descOutput = descInput.value;
            valueOutput = Number(valueInput.value);
                        
            // Create <div> element with new description and value :
            descDiv = document.createElement('div');
            descDiv.classList.add(DOMstrings.itemDescriptionString);
            valueDiv = document.createElement('div');
            valueDiv.classList.add(DOMstrings.itemValueString);
            
            if (descOutput !== '' && !isNaN(valueOutput) && valueOutput > 0) {
                
                // Place description and value from <input> to <div> :
                descDiv.textContent = descOutput;
                formatedValue = formatNumber(valueOutput, type);
                valueDiv.textContent = formatedValue;
            
                // Replace <input> elements with newly created <div> elements :
                descInput.parentNode.replaceChild(descDiv, descInput);
                valueInput.parentNode.replaceChild(valueDiv, valueInput);

                // Replace 'save' button with 'edit' button:
                saveBtn = document.querySelector('#' + selectorId + ' ' + DOMstrings.saveButton);
                saveBtn.parentElement.classList.remove(DOMstrings.editModeString);
                editBtn = document.createElement('button');
                editBtn.classList.add(DOMstrings.deleteBtnString, 'edit');
                editBtn.innerHTML = DOMstrings.iconEdit;
                saveBtn.parentNode.replaceChild(editBtn, saveBtn);
                
                if (type === 'exp') {
                    document.querySelector('#' + selectorId + ' ' + DOMstrings.expensesPercLabel).classList.remove('display-none');
                }
                
                return {
                    newType: type,
                    newId: id,
                    newDescription: descOutput,
                    newValue: valueOutput
                }
                
            } else {
                alert('Please fill in the fields correctly.');
            }
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // returns a list
            
            // Convert list into array - use array method 'slice' on fields list :
            fieldsArr = Array.prototype.slice.call(fields)
            
            // Loop throught all fields array items and clear them :
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            
            // Set the focus back on the description :
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =  '---';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // returns a node list, on which we can't use forEach loop
            
            // Use custom forEach function on fields node list :
            nodeListForEach(fields, function(current, index) {
                
                // Loop through every fields item and add expenses percentage :
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        
        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);  // returns a node list
            
            // Using our custom foreEach function to loop over node list :
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    }
    
})();


/*********************************
*      App CONTROLLER IIFE       *
*********************************/

var controller = (function(budgetCtrl, UICtrl) {
    
    // Function to store all event listeners :
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        // To add item on click or keydown event :
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keydown', function(event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });
        
        // To change the input color :
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
        // To delete or edit item on click :
        document.querySelector(DOM.container).addEventListener('click', function(event) {
            if (event.target.parentElement.className === DOM.deleteInputString) {
                ctrlDeleteItem(event);
            } else if (event.target.parentElement.className === DOM.editInputString) {
                ctrlEditItem(event);
            } else if (event.target.parentElement.className === DOM.saveInputString) {
                ctrlChangeItem(event);
            }
        });
    };
    
    var updateBudget = function() {
        
        // 1. Calculate the budget :
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget :
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI :        
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages :
        budgetCtrl.calculatePercentages();
        
        // 2. Return percentages from budget controller :
        var percentages = budgetCtrl.getPercentage();
        
        // 3. Update and display the percentage on the UI :
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, NewItem;
        
        // 1. Get the field input data :
        input = UICtrl.getInput();
        
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller :
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI :
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields :
            UICtrl.clearFields();

            // 5. Calculate and update budget :
            updateBudget();
            
            // 6. Calculate and update the percentages :
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
            var itemID, splitID, type, ID;
        
            // Get the id of the item, which was clicked :
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // 'inc-0'
            
            if (itemID) {
                
                splitID = itemID.split('-');  // ['inc', '0']
                type = splitID[0];  // 'inc'
                ID = parseInt(splitID[1]);  // parseInt('0') = 0
                
                // 1. Delete the item from the data structure :
                budgetCtrl.deleteItem(type, ID);
                
                // 2. Delete the item from the UI :
                UICtrl.deleteListItem(itemID);
                
                // 3. Update and show the new budget :
                updateBudget();
                
                // 4. Calculate and update the percentages :
                updatePercentages();
                
            }
            
        };
        
    var ctrlEditItem = function(event) {        
        // Get the id of the item, which was clicked :
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; // 'inc-0'
        
        if (itemId) {
            UICtrl.editListItem(itemId);
        }
    };
    
    var ctrlChangeItem = function(event) {
        var itemId, changedItem;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId) {
            // Get the changed item :
            changedItem = UICtrl.getEditedListItem(itemId);
            
            // Update the description and value in budget controller :
            if (changedItem.newDescription !== '' && changedItem.newDescription !== undefined && !isNaN(changedItem.newValue) && changedItem.newValue > 0) {
                budgetCtrl.changeItem(changedItem.newType, changedItem.newId, changedItem.newDescription, changedItem.newValue);
                
                // Calculate and update budget :
                updateBudget();
                
                // Calculate and update the percentages :
                updatePercentages();
            }
        }
    };
    
    return {
        init: function() {
            console.log('Application has started.');
            
            // Display the current Month and Year :
            UICtrl.displayMonth();
            
            // Reset all UI labels to 0 :
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
            // Initialize the starting function for event listeners :
            setupEventListeners();
        }
    }
    
    
    
})(budgetController, UIController);

controller.init();

















