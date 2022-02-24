function stateNewTransaction (){
  //activate form on page
  const element = document.querySelector(".modal-overlay")

  element.classList.toggle("active")
}

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem("dev.financeDataTable")) || []
  },
  set(transaction){
    localStorage.setItem("dev.financeDataTable", JSON.stringify(transaction))
  }
}

const Transaction = {
  all: Storage.get(),
  incomes(){
    //all incomes
    let income = 0

    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0){
        income += transaction.amount
      }
    })
    return income
  },
  expenses(){
    //all expenses
    let expense = 0

    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0){
        expense += transaction.amount
      }
    })
    return expense
  },
  total(){
    //income - expense, for the total
    return Transaction.incomes() + Transaction.expenses() 
  },
  add(transaction){
    //new transaction data 
    Transaction.all.push(transaction)
    api.reload()
  },
  remove(index){
    //remove transaction
    Transaction.all.splice(index, 1)
    api.reload()
  }
}



const DOM = {
  transactionContainer: document.querySelector("#data-table tbody"),
  innerHTMLTransaction(element, index){
    const classCSS = element.amount > 0 ? "income" : "expense"

    const amount = Utils.formatcurrency(element.amount)

    const html = `
      <td class="description">${element.description}</td>
      <td class=${classCSS}>${amount}</td>
      <td class="date">${element.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="../assets/minus.svg" alt="Remover da tabela"></td>
    `

    return html
  },
  addTransaction(transaction, index){
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionContainer.appendChild(tr)
  },
  updateBalance(){
    //establish balance data
    document.querySelector("#incomeCurrency").innerHTML = Utils.formatcurrency(Transaction.incomes())
    document.querySelector("#expenseCurrency").innerHTML = Utils.formatcurrency(Transaction.expenses())
    document.querySelector("#totalCurrency").innerHTML = Utils.formatcurrency(Transaction.total())
  },
  clearTransaction(){
    //clear tbody
    DOM.transactionContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value){
    value = Number(value) * 100 
    return value
  },
  formatDate(value){
    const splitedDate = value.split("-").slice(0).reverse().join("/")

    return splitedDate
  },
  formatcurrency(value){
    const signal = Number(value) < 0 ? "-": ""

    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency:"BRL"
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  date: document.querySelector("#date"),
  getvalues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields(){
    const {description, amount, date} = Form.getvalues()

    if(description.trim() == "" || amount.trim() == "" || date.trim() == ""){
      throw new Error("Por favor, preencha todos os campos.")
    }
  },
  formatValues(){
    let {description, amount, date} = Form.getvalues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return{
      description,
      amount,
      date
    }
  },
  save(transaction){
    Transaction.add(transaction)
  },
  clearFields(){
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },
  submit(event){
    //retirar o corpotamento base
    event.preventDefault()

    //validar os valores
    try{
      Form.validateFields()

      //formatar Valores
      const transaction = Form.formatValues()
      //salvar
      Form.save(transaction) 

      //limpar form
      Form.clearFields()

      //feixar o modal
      stateNewTransaction()
    } catch(error){
      //fazer um modal para quando ter um erro nessa forma de formulario
      alert(error.message)
    }
    

  }
}

const api ={
  init(){
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance() 

    Storage.set(Transaction.all)
  }, 
  reload(){
    DOM.clearTransaction()
    api.init()
  }
}

api.init()