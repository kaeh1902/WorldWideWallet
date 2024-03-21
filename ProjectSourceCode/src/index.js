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