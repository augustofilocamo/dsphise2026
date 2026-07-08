// Define a function to normalize audio input to 0 dBFS
function normalizeToZeroDB(input) {
    // Calculate the gain required to bring the input to 0 dBFS
    var gain = -20 * Math.log10(Math.abs(input));
    
    Console.print("Gain makeup: " + gain);

    // Apply the gain to the input
    var normalizedInput = input * Math.pow(10, gain / 20);

    return normalizedInput;
}


// Example usage:
//var input = -89; // Example audio input value (in linear scale)
//var normalizedInput = normalizeToZeroDB(input);
//Console.print("Normalized Input: " + normalizedInput);