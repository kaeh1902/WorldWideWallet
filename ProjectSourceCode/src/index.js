function clearFields() {
    // Clear the input fields
    document.querySelector("input[type='text']").value = '';
    document.querySelector("input[type='number']").value = '';

    // Reset the content of the converted currency card
    document.querySelector('.card-title').textContent = 'Converted Currency:';
    document.querySelector('.card-text:nth-of-type(1)').textContent = 'Please enter values to see the converted currency';
    document.getElementById('exchangeRate').textContent = '---';
}

function convertCurrency() {
    const apiUrl = 'https://api.currencyapi.com/v3/latest?apikey=cur_live_xzLkdrHYs6YZ7YtF3ZgfEKH98e3yvyi5BLjuJxp0';


    // Hardcoded exchange rate for demonstration
    const exchangeRate = 1.0940;
    
    // Get the amount entered by the user
    const amountInput = document.querySelector("input[type='number']").value;
    const amount = parseFloat(amountInput);
    
    // Check if the input is a valid number
    if (!isNaN(amount) && amount > 0) {
        // Calculate the converted amount
        const convertedAmount = amount * exchangeRate;

        // Display the converted amount
        document.getElementById('exchangeRate').textContent = `$${convertedAmount.toFixed(2)} USD`;
    } else {
        // If input is not a valid number, display an error or reset
        alert("Please enter a valid amount.");
        clearFields(); 
    }
}

// Replace 'YOUR-APIKEY' with your actual API key
const apiKey = 'cur_live_xzLkdrHYs6YZ7YtF3ZgfEKH98e3yvyi5BLjuJxp0';

// This function will fetch the latest currency exchange rates and print them
function getLatestRates() {
  const url = 'https://api.currencyapi.com/v3/latest?apikey=cur_live_xzLkdrHYs6YZ7YtF3ZgfEKH98e3yvyi5BLjuJxp0';

  fetch(url, {
    method: 'GET',
    headers: {
      'apikey': apiKey
    }
  })
  .then(response => {
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Here you can handle the response JSON object
    console.log(data);
    // For example, print the exchange rate from USD to EUR
    const rate = data.data['EUR'];
    document.getElementById('result').innerText = `1 USD is equal to ${rate} EUR`;
  })
  .catch(error => {
    console.log('There was an error fetching the exchange rates:', error);
  });
}

// Call this function when you want to perform the API call, for example on page load or on a button click
getLatestRates();
