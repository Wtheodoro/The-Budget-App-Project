let budgetController = (function () {
 
    let Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome)*100)  
        } else {
            this.percentage = -1
        }        
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    let Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let calculateTotal = function (type) {
        let sum = 0
        data.allItems[type].forEach(function (current) {
            //sum = sum + current.value
            sum += current.value
        })
        data.totals[type] = sum
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        // -1 is to say something does not exist
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID
            // Creat new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            
            // Creat new item 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val)
            }
            // Push it into data structure
            data.allItems[type].push(newItem)
            // Return the new element
            return newItem
        },

        deleteItem: function (type, id) {
            let ids, index

            ids = data.allItems[type].map(function (current) {
                return current.id
            })

            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }

        },

        calculateBudget: function () {
          
            // calculate total income and expenses 
            calculateTotal('exp')
            calculateTotal('inc')

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            // calculate the percentage of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
            
        },

        calculatePercentages: function () {
          
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentages: function () {
          let allPerc = data.allItems.exp.map(function (cur) {
              return cur.getPercentage()
          })
          return allPerc
        },

        getBudget: function () {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }  
        },

        testing: function () {
            console.log(data)
        }
    }

})()

let UIController = (function () {
    
    let DOMstrings = {
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
        container: '.container'
    }

    return {
        getInput: function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            let html, newHtml, element
          // Creat HTML string with placeholder text

          if (type === 'inc') {
                element = DOMstrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          } else if (type === 'exp') {
                element = DOMstrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }
        
          //Replace the placeholder text with some actual data
          newHtml = html.replace('%id%', obj.id)
          newHtml = newHtml.replace('%description%', obj.description)
          newHtml = newHtml.replace('%value%', obj.value)
          
          // Insert the HMT into the DOM 
          document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },


        deleteListItem: function (selectorID) {
            let element = document.getElementById(selectorID)
            element.parentNode.removeChild(element)
        },

        clearFields: function () {
            let fields, fieldsArray
            // querySelector sintaxe is from CSS
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' +DOMstrings.inputValue)

            fieldsArray = Array.prototype.slice.call(fields)
            fieldsArray.forEach(function (current, index, array) {
                current.value = ""
            })

            fieldsArray[0].focus()
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp
            

            if (obj.percentage > 0) {
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage 
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---' 
            }
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    }

})()

// GLOBAL CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {
   
    let setupEventListeners = function () {

        let DOM = UICtrl.getDOMstrings()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        // Run the funcion with ENTER
        document.addEventListener('keypress', function (event) {
            // keyCode is a new propertie, for older browsers it must be which
            if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem()
            }

        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
  
    }

    let updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget()
        
        //2. Return the budget
        let budget = budgetCtrl.getBudget()

        //3. Display the budget on the UI
        UIController.displayBudget(budget)
    }

    let updatePercentages = function () {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages()
        // 2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages()
        // 3. Update the UI with the new percentages
        console.log(percentages)
    }

    let ctrlAddItem = function () {
        let input, newItem
        // 1. Get de field input data
        input = UICtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value)

        // 3. Add the new item to the UI
        UICtrl.addListItem(newItem, input.type)

        // 4. clear the fields
        UICtrl.clearFields()
        // 5. Calculate and update the budget
        updateBudget()

        // 6. Calculate and update the percengaes
        updatePercentages()
        }

    }

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if(itemID) {
            //INC 1 exemple
            splitID = itemID.split('-')
            type = splitID[0]
                // The ID must be a NUMBER and not a STRING, it will be easyer to find it and delete it.
            ID = parseInt(splitID[1])

            // 1. Delete tthe item from the data structure
            budgetCtrl.deleteItem(type, ID)
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID)

            // 3. Update and show the new result
            updateBudget()

            // 6. Calculate and update the percengaes
            updatePercentages()

        }
    }

    return {
        init: function () {
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: '---'
            })
            setupEventListeners()
        }
    }

    
})(budgetController, UIController)

controller.init()