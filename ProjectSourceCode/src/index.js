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
        document.getElementById('exchangeRate').textContent = `$${convertedAmount.toFixed(8)} USD`;
    } else {
        // If input is not a valid number, display an error or reset
        alert("Please enter a valid amount.");
        clearFields(); 
    }
}

// Call this function when you want to perform the API call, for example on page load or on a button click
getLatestRates();


const apiKey = 'cur_live_xzLkdrHYs6YZ7YtF3ZgfEKH98e3yvyi5BLjuJxp0';

function convertCurrency() {
    const amount = document.getElementById('amountInput').value;
    const currencyCode = document.getElementById('currencyCodeInput').value.toUpperCase();

    const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data[currencyCode]) {
                const rate = data.data[currencyCode].value;
                document.getElementById('exchangeRate').textContent = `${amount} USD is equal to ${(rate * amount).toFixed(2)} ${currencyCode}`;
                document.getElementById('conversionText').textContent = `United States Dollar (USD) to ${currencyCode}`;
            } else {
                document.getElementById('exchangeRate').textContent = 'Currency code not found';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('exchangeRate').textContent = 'Error fetching exchange rate';
        });
}

function clearFields() {
    document.getElementById('currencyCodeInput').value = '';
    document.getElementById('amountInput').value = '';
    document.getElementById('exchangeRate').textContent = '-';
    document.getElementById('conversionText').textContent = 'Euro (EUR) to U.S Dollar (USD)';
}
