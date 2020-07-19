let budgetController = (function () {
 
    let Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
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
            if (data.allItems[type.length > 0]) {
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
        expensesContainer: '.expenses__list'
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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          } else if (type === 'exp') {
                element = DOMstrings.expensesContainer
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }
        
          //Replace the placeholder text with some actual data
          newHtml = html.replace('%id%', obj.id)
          newHtml = newHtml.replace('%description%', obj.description)
          newHtml = newHtml.replace('%value%', obj.value)
          
          // Insert the HMT into the DOM 
          document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
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
  
    }

    let updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget()
        
        //2. Return the budget
        let budget = budgetCtrl.getBudget()

        //3. Display the budget on the UI
        console.log(budget)
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
        }

    }

    return {
        init: function () {
            setupEventListeners()
        }
    }

    
})(budgetController, UIController)

controller.init()