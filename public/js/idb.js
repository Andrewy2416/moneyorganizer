let db;
// creates a connection to budget_tracker and it's first version
const request = indexedDB.open('budget_tracker', 1);

//creating new table
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

//function if it works
request.onsuccess = function(event) {

  db = event.target.result;
  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_transaction');
  budgetObjectStore.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transaction');

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_transaction');
          budgetObjectStore.clear();
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadBudget);